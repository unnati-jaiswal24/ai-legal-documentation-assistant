import React from 'react';

/**
 * Safely parses inline markdown (bold text and inline code) without innerHTML.
 * @param {string} text
 * @returns {React.ReactNode[]}
 */
function parseInline(text) {
  if (!text) return [];

  // Match **bold** or `code`
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={index} className="font-semibold text-[#233124] dark:text-[#f0f4ee]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code key={index} className="rounded bg-[#ecefe9] px-1 py-0.5 font-mono text-[11px] text-[#334434] dark:bg-[#253126] dark:text-[#d3dfd1]">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

/**
 * Safe markdown renderer for AI generated text.
 * Strictly prevents XSS by avoiding dangerouslySetInnerHTML.
 * Supports paragraphs, bulleted lists, and bold text.
 */
export default function SafeMarkdown({ content = '', className = '' }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let currentList = [];

  function flushList() {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="my-2 list-disc space-y-1 pl-5">
          {currentList.map((item, i) => (
            <li key={i} className="text-xs leading-5">
              {parseInline(item)}
            </li>
          ))}
        </ul>,
      );
      currentList = [];
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      flushList();
      continue;
    }

    // Check for bullet list item
    if (line.startsWith('- ') || line.startsWith('* ')) {
      currentList.push(line.slice(2));
    } else {
      flushList();
      elements.push(
        <p key={`p-${elements.length}`} className="my-1.5 text-xs leading-relaxed">
          {parseInline(line)}
        </p>,
      );
    }
  }

  flushList();

  return <div className={`safe-markdown ${className}`}>{elements}</div>;
}
