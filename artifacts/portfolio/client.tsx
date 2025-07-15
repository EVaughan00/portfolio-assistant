import { Artifact } from '@/components/create-artifact';
import { CopyIcon } from '@/components/icons';
import { Markdown } from '@/components/markdown';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

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

interface PortfolioError {
  error: true;
  message: string;
  portfolioName: string;
}

function PortfolioViewer({ content, status }: { content: string; status: 'streaming' | 'idle' }) {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [timeoutReached, setTimeoutReached] = useState(false);



  // Add timeout for slow loading
  useEffect(() => {
    if (!content && status === 'streaming') {
      const timer = setTimeout(() => {
        setTimeoutReached(true);
      }, 10000); // 10 second timeout

      return () => clearTimeout(timer);
    }
  }, [content, status]);

  // Parse portfolio data when content changes
  useEffect(() => {
    if (content && !portfolioData && !hasError) {
      try {
        const parsed = JSON.parse(content);
        
        // Check if it's an error response
        if (parsed.error) {
          setHasError(true);
          setErrorMessage(parsed.message || 'Unknown error occurred');
          setTimeoutReached(false);
        } else {
          setPortfolioData(parsed);
          setHasError(false);
          setErrorMessage('');
          setTimeoutReached(false);
        }
      } catch (error) {
        setHasError(true);
        setErrorMessage('Failed to parse portfolio data');
      }
    }
  }, [content, portfolioData, hasError]);

  // Handle timeout case
  if (timeoutReached && !portfolioData && !hasError && !content) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="text-amber-600 font-medium">Loading is taking longer than expected</div>
          <div className="text-muted-foreground text-sm">
            This might be due to a slow network connection or server issues.
          </div>
          <div className="text-muted-foreground text-xs">
            Please try again in a moment or check your internet connection.
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <div className="text-destructive font-medium">Failed to load portfolio</div>
          <div className="text-muted-foreground text-sm">{errorMessage}</div>
          <div className="text-muted-foreground text-xs">Please try again or check if the portfolio name is correct.</div>
        </div>
      </div>
    );
  }

  if (!portfolioData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <div className="text-muted-foreground">
            {content ? 'Processing portfolio data...' : 'Loading portfolio...'}
          </div>
          {status === 'streaming' && (
            <div className="text-xs text-muted-foreground">
              Fetching from database...
            </div>
          )}
        </div>
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
    
    // Set artifact visible when we know it's a portfolio type, not just when data arrives
    if (streamPart.type === 'data-kind' && streamPart.data === 'portfolio') {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
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