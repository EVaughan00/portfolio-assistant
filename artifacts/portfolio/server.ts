import { createDocumentHandler } from '@/lib/artifacts/server';
import { getPortfolioByName, getPortfolioImages } from '@/lib/db/queries';

export const portfolioDocumentHandler = createDocumentHandler({
  kind: 'portfolio' as const,
  onCreateDocument: async ({ title, dataStream, session }) => {
    // Extract portfolio name from the title (format: "portfolio-{name}")
    const portfolioName = title.replace('portfolio-', '');
    
    if (!portfolioName) {
      throw new Error('Portfolio name is required');
    }

    if (!session?.user?.id) {
      throw new Error('User session is required');
    }

    try {
      // Fetch portfolio data from database by name
      const portfolio = await getPortfolioByName({ 
        name: portfolioName, 
        userId: session.user.id 
      });
      
      if (!portfolio) {
        throw new Error(`Portfolio "${portfolioName}" not found. Please check the project name or create the portfolio first.`);
      }

      // Fetch portfolio images
      const images = await getPortfolioImages({ portfolioId: portfolio.id });

      const portfolioData = {
        id: portfolio.id,
        name: portfolio.name,
        description: portfolio.description,
        images: images || [],
        createdAt: portfolio.createdAt,
        updatedAt: portfolio.updatedAt,
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
      console.error('Error fetching portfolio:', error);
      throw error;
    }
  },
  onUpdateDocument: async ({ document, description, dataStream, session }) => {
    // Portfolio artifacts are read-only, so we don't support updates
    throw new Error('Portfolio artifacts are read-only');
  },
}); 