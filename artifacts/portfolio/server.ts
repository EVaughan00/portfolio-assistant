import { createDocumentHandler } from '@/lib/artifacts/server';
import { getPortfolioByName, getPortfolioImages, getAllPortfolios, getPortfoliosByUserId } from '@/lib/db/queries';

// Helper function to find portfolio with fuzzy matching (same as in display-portfolio.ts)
async function findPortfolioByName(portfolioName: string, session: any) {
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

export const portfolioDocumentHandler = createDocumentHandler({
  kind: 'portfolio' as const,
  onCreateDocument: async ({ title, dataStream, session }) => {
    try {
      // Extract portfolio name from the title (format: "portfolio-{name}")
      const portfolioName = title.replace('portfolio-', '');
      
      if (!portfolioName) {
        throw new Error('Portfolio name is required');
      }

      if (!session?.user) {
        throw new Error('User session is required');
      }

      // Use the original simpler approach temporarily
      const portfolio = await getPortfolioByName({ 
        name: portfolioName, 
        userId: session.user.type === 'guest' ? undefined : session.user.id 
      });
      
      if (!portfolio) {
        // Fall back to fuzzy matching
        const foundPortfolio = await findPortfolioByName(portfolioName, session);
        if (!foundPortfolio) {
          throw new Error(`Portfolio "${portfolioName}" not found. Please check the project name or create the portfolio first.`);
        }
      }

      const finalPortfolio = portfolio || await findPortfolioByName(portfolioName, session);
      
      // Fetch portfolio images
      const images = await getPortfolioImages({ portfolioId: finalPortfolio.id });

      const portfolioData = {
        id: finalPortfolio.id,
        name: finalPortfolio.name,
        description: finalPortfolio.description,
        systemPrompt: finalPortfolio.systemPrompt,
        images: images || [],
        createdAt: finalPortfolio.createdAt,
        updatedAt: finalPortfolio.updatedAt,
      };

      // Stream the portfolio data to the client
      dataStream.write({
        type: 'data-portfolioDelta',
        data: JSON.stringify(portfolioData),
        transient: true,
      });

      // Return the portfolio data as content
      return JSON.stringify(portfolioData);
    } catch (error) {
      // Write error to stream
      dataStream.write({
        type: 'data-portfolioDelta',
        data: JSON.stringify({
          error: true,
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          portfolioName: title.replace('portfolio-', ''),
        }),
        transient: true,
      });
      
      throw error;
    }
  },
  onUpdateDocument: async ({ document, description, dataStream, session }) => {
    // Portfolio artifacts are read-only, so we don't support updates
    throw new Error('Portfolio artifacts are read-only');
  },
}); 