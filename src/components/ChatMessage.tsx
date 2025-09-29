import React, { useState } from 'react';
import { cn } from '../lib/utils';
import type { ChatMessage as ChatMessageType } from '../types';
import { Bot, User, Clock, Copy, Check, ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';

interface ChatMessageProps {
  message: ChatMessageType;
  onSuggestionClick: (suggestion: string) => void;
  isLoading: boolean;
}

const formatTimestamp = (date: Date) => {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onSuggestionClick, isLoading }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = message.role === "user";

  const TypingIndicator = () => (
    <div className="flex items-center space-x-1.5 p-2">
        <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
        <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
        <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse"></span>
    </div>
  );
  
  return (
    <div className={cn("flex items-end gap-3 animate-fadeInUp", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/30">
          <Bot className="w-5 h-5 text-white" />
        </div>
      )}

      <div className={cn("max-w-[85%] md:max-w-[75%] flex flex-col", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm shadow-xl transition-all duration-300",
            isUser
              ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-br-lg"
              : "bg-gray-800/80 border border-white/10 backdrop-blur-md text-gray-200 rounded-bl-lg",
          )}
        >
          {message.isLoading ? <TypingIndicator /> : <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>}

          {!message.isLoading && (
            <div className="flex items-center gap-2 mt-3 text-xs opacity-60">
              <Clock className="w-3 h-3" />
              <span>{formatTimestamp(message.timestamp)}</span>
              {!isUser && message.confidence !== undefined && (
                <span className="font-semibold text-indigo-300">
                  {Math.round(message.confidence * 100)}% Conf.
                </span>
              )}
              
              {!isUser && (
                <div className="flex gap-1 ml-auto">
                   <Button variant="ghost" size="icon" onClick={() => copyToClipboard(message.content)} className="h-7 w-7 hover:text-indigo-400">
                     {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                   </Button>
                   <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-green-400"><ThumbsUp className="w-3.5 h-3.5" /></Button>
                   <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-red-400"><ThumbsDown className="w-3.5 h-3.5" /></Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sources */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-2">
            {message.sources.map((source, index) => (
              <div key={index} className="text-xs bg-gray-700/50 text-gray-300 px-2 py-1 rounded-full border border-white/10">
                📊 {source}
              </div>
            ))}
          </div>
        )}

        {/* Suggestions */}
        {!isUser && message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-3 w-full space-y-2">
            <p className="text-xs text-gray-400 font-medium">💡 Suggested follow-ups:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {message.suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => onSuggestionClick(suggestion)}
                  disabled={isLoading}
                  className="text-xs text-left h-auto py-2 px-3 rounded-lg bg-gray-800/80 border border-white/10 hover:bg-white/10 disabled:opacity-50 transition-all duration-200 backdrop-blur-md"
                >
                  <div className="flex items-start gap-2">
                    <MessageCircle className="w-3 h-3 mt-0.5 flex-shrink-0 text-indigo-400" />
                    <span className="text-gray-300">{suggestion}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center flex-shrink-0 shadow-lg">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </div>
  );
};