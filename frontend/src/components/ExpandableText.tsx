import React, { useState } from 'react';

interface ExpandableTextProps {
  text: string;
  maxLength?: number;
  className?: string;
}

export function ExpandableText({ text, maxLength = 100, className = "" }: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) return null;

  if (text.length <= maxLength) {
    return <p className={className}>{text}</p>;
  }

  const displayText = isExpanded ? text : `${text.slice(0, maxLength)}...`;

  return (
    <div className={className}>
      <span className="inline">{displayText}</span>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="ml-2 text-blue-400 hover:text-blue-300 font-medium text-xs underline focus:outline-none inline-block"
      >
        {isExpanded ? 'See Less' : 'See More'}
      </button>
    </div>
  );
}
