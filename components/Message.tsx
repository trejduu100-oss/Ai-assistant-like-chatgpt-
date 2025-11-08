
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Message as MessageType } from '../types';
// Removed SpeakerIcon import

interface MessageProps {
  message: MessageType;
  isStreaming?: boolean;
  theme: 'light' | 'dark';
}

const Message: React.FC<MessageProps> = ({ message, isStreaming, theme }) => {
  // Removed isSpeaking state and useEffect for speech synthesis

  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-4 p-4 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-indigo-500 flex-shrink-0" />
      )}
      <div className={`max-w-3xl w-full px-4 py-3 rounded-lg ${isUser ? 'bg-light-user-msg dark:bg-dark-user-msg' : 'bg-light-model-msg dark:bg-dark-model-msg'}`}>
        {message.image && (
          <img src={`data:${message.image.mimeType};base64,${message.image.base64}`} alt="Uploaded content" className="max-w-xs rounded-md mb-2" />
        )}
        <div className="prose prose-sm dark:prose-invert max-w-none text-light-text-primary dark:text-dark-text-primary">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={theme === 'dark' ? oneDark : oneLight}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {message.content + (isStreaming ? '▍' : '')}
          </ReactMarkdown>
        </div>
        {/* Removed text-to-speech button */}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-slate-500 flex-shrink-0" />
      )}
    </div>
  );
};

export default Message;
