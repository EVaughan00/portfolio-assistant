import { Artifact } from '@/components/create-artifact';
import { CopyIcon } from '@/components/icons';
import { Markdown } from '@/components/markdown';
import { toast } from 'sonner';
import { useState } from 'react';

interface PortfolioData {
  id: string;
  name: string;
  description?: string;
  systemPrompt?: string;
  images: Array<{
    id: string;
    imageUrl: string;
    imageName: string;
    contentType: string;
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

function PortfolioViewer({ content }: { content: string }) {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);

  // Parse the portfolio data from the content
  if (!portfolioData && content) {
    try {
      const parsed = JSON.parse(content);
      setPortfolioData(parsed);
    } catch (error) {
      console.error('Error parsing portfolio data:', error);
    }
  }

  if (!portfolioData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading portfolio...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Portfolio Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{portfolioData.name}</h1>
        {portfolioData.description && (
          <div className="text-muted-foreground text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
            <Markdown>{portfolioData.description}</Markdown>
          </div>
        )}
      </div>

      {/* Portfolio Images */}
      {portfolioData.images.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portfolioData.images.map((image) => (
              <div key={image.id} className="space-y-2">
                <img
                  src={image.imageUrl}
                  alt={image.imageName}
                  className="w-full h-auto rounded-lg border shadow-sm"
                  loading="lazy"
                />
                <p className="text-xs text-muted-foreground">{image.imageName}</p>
              </div>
            ))}
          </div>
        </div>
      )}


    </div>
  );
}

export const portfolioArtifact = new Artifact({
  kind: 'portfolio',
  description: 'Displays portfolio project information',
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === 'data-portfolioDelta') {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: streamPart.data,
        isVisible: true,
        status: 'streaming',
      }));
    }
  },
  content: PortfolioViewer,
  actions: [
    {
      icon: <CopyIcon size={18} />,
      description: 'Copy portfolio URL',
      onClick: ({ content }) => {
        try {
          const portfolioData = JSON.parse(content) as PortfolioData;
          const url = `${window.location.origin}/portfolio/${portfolioData.id}`;
          navigator.clipboard.writeText(url);
          toast.success('Portfolio URL copied to clipboard');
        } catch (error) {
          toast.error('Failed to copy URL');
        }
      },
    },
  ],
  toolbar: [],
}); 