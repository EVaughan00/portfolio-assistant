'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWindowSize } from 'usehooks-ts';

import { ModelSelector } from '@/components/model-selector';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { Button } from '@/components/ui/button';
import { PlusIcon, VercelIcon, HomeIcon } from './icons';
import { useSidebar } from './ui/sidebar';
import { memo } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { type VisibilityType, VisibilitySelector } from './visibility-selector';
import type { Session } from 'next-auth';
import { PortfolioModal } from './portfolio-modal';
import { toast } from 'sonner';

function PureChatHeader({
  chatId,
  selectedModelId,
  selectedVisibilityType,
  isReadonly,
  session,
  autoResume,
  hasMessages,
}: {
  chatId: string;
  selectedModelId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
  session: Session;
  autoResume: boolean;
  hasMessages: boolean;
}) {
  const router = useRouter();
  const { open } = useSidebar();

  const { width: windowWidth } = useWindowSize();

  return (  
    <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
      {session && session.user.type === 'regular' && <SidebarToggle />}
      {/* Back to Dashboard button - shown when there are messages in chat */}
      {hasMessages && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="order-1 md:order-1 flex items-center gap-2"
              onClick={() => {
                router.push('/');
                router.refresh();
              }}
            >
              <HomeIcon size={16} />
              <span className="hidden md:inline text-sm">Dashboard</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Back to Dashboard</TooltipContent>
        </Tooltip>
      )}

      {/* Portfolio modal - shown when no messages and (sidebar closed or mobile) and authenticated as regular user */}
      {(!open || windowWidth < 768) && !hasMessages && session && session.user.type === 'regular' && (
        <div className="order-2 md:order-1 ml-auto md:ml-0">
          <PortfolioModal 
            onSuccess={(portfolio) => {
              toast.success(`Portfolio "${portfolio.name}" created successfully!`);
            }}
          />
        </div>
      )}

      {/* {!isReadonly && (
        <ModelSelector
          session={session}
          selectedModelId={selectedModelId}
          className="order-1 md:order-2"
        />
      )} */}

      {/* {!isReadonly && (
        <VisibilitySelector
          chatId={chatId}
          selectedVisibilityType={selectedVisibilityType}
          className="order-1 md:order-3"
        />
      )} */}
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return (
    prevProps.selectedModelId === nextProps.selectedModelId &&
    prevProps.autoResume === nextProps.autoResume &&
    prevProps.hasMessages === nextProps.hasMessages
  );
});
