'use client';

interface CodeBlockProps {
  node: any;
  inline: boolean;
  className: string;
  children: any;
}

export function CodeBlock({
  node,
  inline,
  className,
  children,
  ...props
}: CodeBlockProps) {
  if (!inline) {
    return (
      <div className="not-prose flex flex-col my-4">
        <pre
          {...props}
          className={`text-sm w-full overflow-x-auto dark:bg-muted p-4 border border-border rounded-xl text-foreground`}
        >
          <code className="whitespace-pre-wrap break-words">{children}</code>
        </pre>
      </div>
    );
  } else {
    return (
      <code
        className={`${className} text-sm bg-muted py-0.5 px-1 rounded-md`}
        {...props}
      >
        {children}
      </code>
    );
  }
}

CodeBlock.displayName = 'CodeBlock';
