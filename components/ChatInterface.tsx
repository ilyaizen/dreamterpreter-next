'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Define the structure of a message in the chat
interface Message {
  text: string; // The content of the message
  isUser: boolean; // Whether the message is from the user or AI
  id: number; // Unique identifier for the message
  sentiment?: number | null; // Sentiment score of the message (for AI responses)
  tags?: string[]; // Array of tags associated with the message (for AI responses)
  summary?: string; // Add this line
}

export function ChatInterface() {
  // State to store all messages in the chat
  const [messages, setMessages] = useState<Message[]>([]);
  // State to store the current input value
  const [inputValue, setInputValue] = useState('');
  // State to indicate if a message is being processed
  const [isLoading, setIsLoading] = useState(false);
  // State to store any error messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Ref to the scroll area for auto-scrolling
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Function to scroll to the bottom of the chat
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: behavior,
        });
      }
    }
  }, []);

  // Effect to scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Function to handle sending a message
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim()) return;

    // Create a new user message
    const newUserMessage: Message = { text: inputValue, isUser: true, id: Date.now() };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInputValue('');
    setErrorMessage(null);
    setIsLoading(true);

    try {
      // Send the message to the AI API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages.map((msg) => ({
              role: msg.isUser ? 'user' : 'assistant',
              content: msg.text,
            })),
            { role: 'user', content: newUserMessage.text },
          ],
        }),
      });

      if (!response.ok) throw new Error('Failed to get response from AI');

      const { result } = await response.json();
      // Parse the AI response and add it to the messages
      const aiMessage = parseAIResponse(result);
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('Failed to get response from AI. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, messages]);

  // Function to parse the AI response and extract sentiment and tags
  const parseAIResponse = (response: string): Message => {
    const match = response.match(/^\[([\d.]+),\s*'(.*?)',\s*'(.*?)'\]\s*([\s\S]*)/);

    let sentiment = null;
    let tags: string[] = [];
    let summary = '';
    let text = response;

    if (match) {
      sentiment = parseFloat(match[1]);
      tags = match[2].split(/,\s*/).map((tag) => tag.trim());
      summary = match[3];
      text = match[4].trim(); // This will be the rest of the message without the bracketed part
    }

    return {
      text,
      isUser: false,
      id: Date.now(),
      sentiment,
      tags: tags.length > 0 ? tags : undefined,
      summary: summary || undefined,
    };
  };

  return (
    <div className="flex h-[600px] w-full max-w-xl flex-col rounded-lg border border-gray-300 bg-background shadow-sm">
      {/* Scrollable area for messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-grow">
        <div className="flex flex-col space-y-4 p-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isLoading && <LoadingIndicator />}
        </div>
      </ScrollArea>
      {/* Input area for user to type and send messages */}
      <InputArea
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleSendMessage={handleSendMessage}
        isLoading={isLoading}
        errorMessage={errorMessage}
      />
    </div>
  );
}

// Component to render individual message bubbles
const MessageBubble: React.FC<{ message: Message }> = ({ message }) => (
  <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
    <div
      className={`animate-pop-in rounded-lg p-3 ${
        message.isUser ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
      } max-w-[80%] break-words`}
    >
      <div>{message.text}</div>
      {!message.isUser && (
        <MessageMetadata sentiment={message.sentiment} tags={message.tags} summary={message.summary} />
      )}
    </div>
  </div>
);

// Component to render metadata (sentiment and tags) for AI messages
const MessageMetadata: React.FC<{ sentiment?: number | null; tags?: string[]; summary?: string }> = ({
  sentiment,
  tags,
  summary,
}) => (
  <div className="mt-2 flex flex-col gap-2 text-xs">
    <div className="flex flex-wrap items-center gap-2">
      {sentiment !== undefined && sentiment !== null && (
        <div
          className={`inline-block rounded px-2 py-1 ${
            sentiment > 0.5 ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
          }`}
        >
          Sentiment: {sentiment.toFixed(2)}
        </div>
      )}
      {tags &&
        tags.map((tag, index) => (
          <span key={index} className="rounded bg-blue-200 px-2 py-1 text-blue-800">
            {tag}
          </span>
        ))}
    </div>
    {summary && <div className="mt-1 italic text-gray-600 dark:text-gray-400">Summary: {summary}</div>}
  </div>
);

// Props interface for the InputArea component
interface InputAreaProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSendMessage: () => void;
  isLoading: boolean;
  errorMessage: string | null;
}

// Component for the input area where users type and send messages
const InputArea: React.FC<InputAreaProps> = ({
  inputValue,
  setInputValue,
  handleSendMessage,
  isLoading,
  errorMessage,
}) => (
  <div className="flex flex-col p-4">
    <div className="mb-2 flex">
      <Input
        placeholder="Describe your dream..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          // Allow sending message with Enter key
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSendMessage();
          }
        }}
        className="mr-2 flex-grow"
      />
      <Button onClick={handleSendMessage} disabled={isLoading}>
        {isLoading ? 'Analyzing...' : 'Analyze'}
      </Button>
    </div>
    {/* Display error message if any */}
    {errorMessage && (
      <Alert variant="destructive" className="mt-2">
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>
    )}
  </div>
);

// Add this new component at the end of the file
const LoadingIndicator: React.FC = () => (
  <div className="flex justify-start">
    <div className="animate-pop-in rounded-lg bg-secondary p-3 text-secondary-foreground">
      <div className="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  </div>
);
