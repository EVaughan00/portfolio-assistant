import { generateUUID } from '@/lib/utils';
import { tool, type UIMessageStreamWriter } from 'ai';
import { z } from 'zod';
import type { Session } from 'next-auth';
import { documentHandlersByArtifactKind } from '@/lib/artifacts/server';
import type { ChatMessage } from '@/lib/types';

interface DisplayPortfolioProps {
  session: Session;
  dataStream: UIMessageStreamWriter<ChatMessage>;
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

      await documentHandler.onCreateDocument({
        id,
        title,
        dataStream,
        session,
      });

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