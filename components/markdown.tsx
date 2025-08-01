import Link from 'next/link';
import React, { memo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './code-block';

const components: Partial<Components> = {
  // @ts-expect-error
  code: ({ node, inline, className, children, ...props }) => {
    // Force block code elements to break out of paragraphs
    if (!inline) {
      return (
        <>
          <CodeBlock 
            node={node} 
            inline={inline} 
            className={className || ''} 
            {...props} 
          >
            {children}
          </CodeBlock>
        </>
      );
    }
    return (
      <CodeBlock 
        node={node} 
        inline={inline} 
        className={className || ''} 
        {...props} 
      >
        {children}
      </CodeBlock>
    );
  },
  pre: ({ children }) => <>{children}</>,
  p: ({ node, children, ...props }) => {
    // Check if this paragraph contains code blocks at any level
    const containsCodeBlock = (node: any): boolean => {
      if (!node) return false;
      
      if (node.tagName === 'code' || node.tagName === 'pre') {
        return true;
      }
      
      if (node.type === 'element' && node.tagName === 'code') {
        return true;
      }
      
      if (node.children) {
        return node.children.some(containsCodeBlock);
      }
      
      return false;
    };
    
    if (containsCodeBlock(node)) {
      // Return a fragment to avoid wrapping in any element
      return <>{children}</>;
    }
    
    // Otherwise render as normal paragraph
    return <p {...props}>{children}</p>;
  },
  ol: ({ node, children, ...props }) => {
    return (
      <ol className="list-decimal list-outside ml-4" {...props}>
        {children}
      </ol>
    );
  },
  li: ({ node, children, ...props }) => {
    return (
      <li className="py-1" {...props}>
        {children}
      </li>
    );
  },
  ul: ({ node, children, ...props }) => {
    return (
      <ul className="list-decimal list-outside ml-4" {...props}>
        {children}
      </ul>
    );
  },
  strong: ({ node, children, ...props }) => {
    return (
      <span className="font-semibold" {...props}>
        {children}
      </span>
    );
  },
  a: ({ node, children, ...props }) => {
    return (
      // @ts-expect-error
      <Link
        className="text-blue-500 hover:underline"
        target="_blank"
        rel="noreferrer"
        {...props}
      >
        {children}
      </Link>
    );
  },
  h1: ({ node, children, ...props }) => {
    return (
      <h1 className="text-3xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h1>
    );
  },
  h2: ({ node, children, ...props }) => {
    return (
      <h2 className="text-2xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h2>
    );
  },
  h3: ({ node, children, ...props }) => {
    return (
      <h3 className="text-xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h3>
    );
  },
  h4: ({ node, children, ...props }) => {
    return (
      <h4 className="text-lg font-semibold mt-6 mb-2" {...props}>
        {children}
      </h4>
    );
  },
  h5: ({ node, children, ...props }) => {
    return (
      <h5 className="text-base font-semibold mt-6 mb-2" {...props}>
        {children}
      </h5>
    );
  },
  h6: ({ node, children, ...props }) => {
    return (
      <h6 className="text-sm font-semibold mt-6 mb-2" {...props}>
        {children}
      </h6>
    );
  },
};

const remarkPlugins = [remarkGfm];

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  return (
    <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
      {children}
    </ReactMarkdown>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);
