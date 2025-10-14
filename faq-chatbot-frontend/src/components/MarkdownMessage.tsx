'use client';

import { Streamdown } from 'streamdown';
import { useEffect, useState } from 'react';

interface MarkdownMessageProps {
  content: string;
  isStreaming?: boolean;
}

export function MarkdownMessage({ content, isStreaming = false }: MarkdownMessageProps) {
  const [formattedContent, setFormattedContent] = useState(content);

  return (
    <Streamdown
      isAnimating={isStreaming}
      parseIncompleteMarkdown={true}
    >
      {content}
    </Streamdown>
  );
}
