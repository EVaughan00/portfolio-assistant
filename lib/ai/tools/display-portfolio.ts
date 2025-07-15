import { generateUUID } from '@/lib/utils';
import { tool, type UIMessageStreamWriter } from 'ai';
import { z } from 'zod';
import type { Session } from 'next-auth';
import { documentHandlersByArtifactKind } from '@/lib/artifacts/server';
import type { ChatMessage } from '@/lib/types';
import { getAllPortfolios, getPortfoliosByUserId } from '@/lib/db/queries';

interface DisplayPortfolioProps {
  session: Session;
  dataStream: UIMessageStreamWriter<ChatMessage>;
}

// Helper function to find portfolio with fuzzy matching
async function findPortfolio(portfolioName: string, session: Session) {
  try {
    // Get all available portfolios for the user
    const allPortfolios = session.user.type === 'guest' 
      ? await getAllPortfolios()
      : await getPortfoliosByUserId({ userId: session.user.id });

    if (allPortfolios.length === 0) {
      throw new Error('No portfolios found. Please create a portfolio first.');
    }

    const portfolioNameLower = portfolioName.toLowerCase().trim();
    
    // 1. Try exact match first
    let portfolio = allPortfolios.find(p => p.name === portfolioName);
    if (portfolio) {
      return portfolio;
    }
    
    // 2. Try case-insensitive exact match
    portfolio = allPortfolios.find(p => p.name.toLowerCase() === portfolioNameLower);
    if (portfolio) {
      return portfolio;
    }
    
    // 3. Try partial match (portfolio name contains the search term)
    portfolio = allPortfolios.find(p => p.name.toLowerCase().includes(portfolioNameLower));
    if (portfolio) {
      return portfolio;
    }
    
    // 4. Try reverse partial match (search term contains portfolio name)
    portfolio = allPortfolios.find(p => portfolioNameLower.includes(p.name.toLowerCase()));
    if (portfolio) {
      return portfolio;
    }
    
    // 5. Generate helpful error with available options
    const availableNames = allPortfolios.map(p => `"${p.name}"`).join(', ');
    throw new Error(`Portfolio "${portfolioName}" not found. Available portfolios: ${availableNames}`);
  } catch (error) {
    throw error;
  }
}

export const displayPortfolio = ({ session, dataStream }: DisplayPortfolioProps) =>
  tool({
    description:
      'Display a portfolio project in a slide-out artifact panel when user asks about a specific project. Use this for natural language queries like "Tell me about ReX", "Show me the Code Review project", "What is MyProject?", etc. This shows the portfolio title, description, and any attached images.',
    inputSchema: z.object({
      portfolioName: z.string().describe('The exact name of the portfolio project to display (extract from user message)'),
    }),
    execute: async ({ portfolioName }) => {
      const id = generateUUID();
      const title = `portfolio-${portfolioName}`;

      // Write initial stream parts to make artifact visible immediately
      dataStream.write({
        type: 'data-kind',
        data: 'portfolio',
        transient: true,
      });

      dataStream.write({
        type: 'data-id',
        data: id,
        transient: true,
      });

      dataStream.write({
        type: 'data-title',
        data: portfolioName,
        transient: true,
      });

      dataStream.write({
        type: 'data-clear',
        data: null,
        transient: true,
      });

      const documentHandler = documentHandlersByArtifactKind.find(
        (handler) => handler.kind === 'portfolio',
      );

      if (!documentHandler) {
        throw new Error('No document handler found for portfolio');
      }

      try {
        // Find portfolio with fuzzy matching
        const portfolio = await findPortfolio(portfolioName, session);
        
        // Use the exact portfolio name for the title
        const exactTitle = `portfolio-${portfolio.name}`;
        
        // Small delay to ensure stream parts are processed in order
        await new Promise(resolve => setTimeout(resolve, 100));
        
        await documentHandler.onCreateDocument({
          id,
          title: exactTitle,
          dataStream,
          session,
        });
      } catch (error) {
        
        // Write error data to stream so the artifact can display it
        dataStream.write({
          type: 'data-portfolioDelta',
          data: JSON.stringify({
            error: true,
            message: error instanceof Error ? error.message : 'Unknown error occurred',
            portfolioName,
          }),
          transient: true,
        });
      }

      dataStream.write({ type: 'data-finish', data: null, transient: true });

      // Instruct AI to provide summary and follow-up questions
      return {
        id,
        title: portfolioName,
        kind: 'portfolio',
        content: `Portfolio "${portfolioName}" has been successfully displayed in the slide-out artifact panel. Please provide a brief 2-3 sentence summary of this portfolio project and then suggest 3 specific follow-up questions the user might want to ask, such as about technical details, challenges, impact, or future improvements.`,
      };
    },
  }); 