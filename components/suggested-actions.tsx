'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { memo, useEffect, useState } from 'react';
import type { UseChatHelpers } from '@ai-sdk/react';
import type { VisibilityType } from './visibility-selector';
import type { ChatMessage, Portfolio } from '@/lib/types';
import type { Session } from 'next-auth';
import { TrashIcon, PencilEditIcon } from './icons';
import { PortfolioEditModal } from './portfolio-edit-modal';
import { toast } from 'sonner';

interface SuggestedAction {
  title: string;
  label: string;
  action: string;
}

interface SuggestedActionsProps {
  chatId: string;
  sendMessage: UseChatHelpers<ChatMessage>['sendMessage'];
  selectedVisibilityType: VisibilityType;
  session: Session;
}

function PureSuggestedActions({
  chatId,
  sendMessage,
  selectedVisibilityType,
  session,
}: SuggestedActionsProps) {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch portfolios from database
  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const response = await fetch('/api/portfolio');
        if (response.ok) {
          const data = await response.json();
          setPortfolios(data.portfolios || []);
        }
      } catch (error) {
        console.error('Failed to fetch portfolios:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolios();
  }, []);

  // Delete portfolio function
  const deletePortfolio = async (portfolioId: string, portfolioName: string) => {
    if (!confirm(`Are you sure you want to delete "${portfolioName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/portfolio?id=${portfolioId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`Portfolio "${portfolioName}" deleted successfully!`);
        // Update local state to remove the deleted portfolio
        setPortfolios(prev => prev.filter(p => p.id !== portfolioId));
      } else {
        toast.error(data.error || 'Failed to delete portfolio');
      }
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      toast.error('Failed to delete portfolio');
    }
  };

  // Transform portfolios into suggested actions
  const suggestedActions: SuggestedAction[] = portfolios.length > 0 
    ? portfolios.slice(0, 4).map((portfolio) => ({
        title: portfolio.name,
        label: portfolio.description?.slice(0, 50) + "..." || 'View this portfolio project',
        action: `Tell me about the "${portfolio.name}" portfolio project. ${portfolio.description ? `Describe ${portfolio.description}` : 'Show me the details and what makes it special.'}`,
      }))
    : [
        // Fallback actions when no portfolios exist
        {
          title: 'Create Your First Portfolio',
          label: 'Get started by adding your work',
          action: 'How do I create and manage my portfolio projects?',
        },
        {
          title: 'Portfolio Best Practices',
          label: 'Learn effective showcasing',
          action: 'What are the best practices for creating compelling portfolio projects?',
        },
        {
          title: 'Project Documentation',
          label: 'How to document your work',
          action: 'Help me understand how to effectively document and present my projects in a portfolio.',
        },
        {
          title: 'Career Development',
          label: 'Advancing your professional growth',
          action: 'What strategies can help me advance my career and showcase my skills effectively?',
        },
      ];

  // Original hardcoded actions (kept commented as requested)
  // const suggestedActions = [
  //   {
  //     title: 'Leadership in ReX',
  //     label: 'Evan\'s leadership role in enterprise AI',
  //     action: 'Tell me about the ReX portfolio project',
  //   },
  //   {
  //     title: 'Advanced Workflows with Code Review Copilot',
  //     label: `The code review agent that saves time`,
  //     action: `Tell me about the Code Review agent portfolio project. Describe the pocketflow implementation and how powerful custom ai workflows can be`,
  //   },
  //   {
  //     title: '',
  //     label: `about silicon valley`,
  //     action: `Help me write an essay about silicon valley`,
  //   },
  //   {
  //     title: 'What is the weather',
  //     label: 'in San Francisco?',
  //     action: 'What is the weather in San Francisco?',
  //   },
  // ];

  if (isLoading) {
    return (
      <div className="w-full space-y-3 sm:space-y-4 overflow-hidden">
        {/* Instructions chip for loading state */}
        <div className="flex justify-center px-4 sm:px-0">
          <div className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full bg-muted/50 text-xs sm:text-sm text-muted-foreground border border-muted max-w-full">
            <div className="size-3.5 bg-muted rounded-full animate-pulse"></div>
            <span className="text-center leading-tight">Loading your projects...</span>
          </div>
        </div>
        
        <div
          data-testid="suggested-actions"
          className="w-full max-h-[35vh] sm:max-h-[50vh] overflow-y-auto space-y-2 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-2"
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`loading-${index}`}
              className="block border rounded-xl px-4 py-3.5 animate-pulse"
            >
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-3 bg-muted rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 sm:space-y-4 overflow-hidden">
      {/* Instructions chip */}
      <div className="flex justify-center px-4 sm:px-0">
        <div className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full bg-muted/50 text-xs sm:text-sm text-muted-foreground border border-muted max-w-full">
          <svg
            className="shrink-0"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 12l2 2 4-4" />
            <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3" />
            <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3" />
          </svg>
          <span className="text-center leading-tight">
            Click on any {portfolios.length > 0 ? 'project' : 'card'} below to get started
            {portfolios.length > 6 && (
              <span className="block text-xs opacity-75 mt-1">
                Scroll to see all {portfolios.length} projects
              </span>
            )}
          </span>
        </div>
      </div>

      <div
        data-testid="suggested-actions"
        className="w-full max-h-[35vh] sm:max-h-[50vh] overflow-y-auto space-y-2 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-2"
      >
        {portfolios.length > 0 ? (
        // Show portfolio-based suggestions with delete buttons for regular users
        portfolios.map((portfolio, index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.05 * Math.min(index, 8) }}
            key={`portfolio-${portfolio.id}-${index}`}
            className="block"
          >
            <div className="relative border rounded-xl">
              <Button
                variant="ghost"
                onClick={async () => {
                  window.history.replaceState({}, '', `/chat/${chatId}`);

                  sendMessage({
                    role: 'user',
                    parts: [{ 
                      type: 'text', 
                      text: `Display the portfolio project "${portfolio.name}" in a slide-out artifact panel.`
                    }],
                  });
                }}
                className="text-left px-4 py-3.5 text-sm flex-1 gap-1 flex-col w-full h-auto justify-start items-start min-w-0"
              >
                <span className="font-medium truncate w-full">{portfolio.name}</span>
                <span className="text-muted-foreground text-wrap break-words">
                  {portfolio.description?.slice(0, 50) + "..." || 'View this portfolio project'}
                </span>
              </Button>
              
              {/* Edit and Delete buttons - only show for regular users */}
              {session.user.type === 'regular' && (
                <>
                  <PortfolioEditModal
                    portfolio={portfolio}
                    onSuccess={(updatedPortfolio) => {
                      toast.success(`Portfolio "${updatedPortfolio.name}" updated successfully!`);
                      // Update local state with the updated portfolio
                      setPortfolios(prev => prev.map(p => 
                        p.id === updatedPortfolio.id ? updatedPortfolio : p
                      ));
                    }}
                    trigger={
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="absolute top-2 right-8 p-1 size-6 text-muted-foreground hover:text-blue-500"
                      >
                        <PencilEditIcon size={12} />
                      </Button>
                    }
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePortfolio(portfolio.id, portfolio.name);
                    }}
                    className="absolute top-2 right-2 p-1 size-6 text-muted-foreground hover:text-destructive"
                  >
                    <TrashIcon size={12} />
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        ))
      ) : (
        // Show fallback suggestions when no portfolios exist
        suggestedActions.map((suggestedAction, index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.05 * index }}
            key={`suggested-action-${suggestedAction.title}-${index}`}
            className="block"
          >
            <Button
              variant="ghost"
              onClick={async () => {
                window.history.replaceState({}, '', `/chat/${chatId}`);

                sendMessage({
                  role: 'user',
                  parts: [{ type: 'text', text: suggestedAction.action }],
                });
              }}
              className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 flex-col w-full h-auto justify-start items-start min-w-0"
            >
              <span className="font-medium truncate w-full">{suggestedAction.title}</span>
              <span className="text-muted-foreground text-wrap break-words">
                {suggestedAction.label}
              </span>
            </Button>
          </motion.div>
        ))
      )}
      </div>
    </div>
  );
}

export const SuggestedActions = memo(
  PureSuggestedActions,
  (prevProps, nextProps) => {
    if (prevProps.chatId !== nextProps.chatId) return false;
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType)
      return false;

    return true;
  },
);
