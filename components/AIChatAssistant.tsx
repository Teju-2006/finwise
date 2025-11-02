import React, { useState, useEffect, useRef, useCallback } from 'react';
import { geminiService } from '../services/geminiService';
import { ChatMessage } from '../types';
import Button from './Button';
import Input from './Input';
import LoadingSpinner from './LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';

const systemInstruction = `You are 'FinWise AI,' a friendly, non-advisory SEBI-compliant personal financial assistant for young Indian users. Your tone is supportive and educational. All advice must prioritize financial literacy, debt management, and stable government-backed savings schemes for the Indian context. Do not offer specific investment recommendations that require a license. Focus on general financial education.`;

const AIChatAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isSessionInitialized = useRef(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesEndRef]);

  useEffect(() => {
    if (!isSessionInitialized.current) {
      try {
        geminiService.initChatSession(systemInstruction);
        isSessionInitialized.current = true;
      } catch (err: any) {
        setError(`Failed to initialize AI: ${err.message}`);
      }
    }
  }, []); // eslint-disable-next-line react-hooks/exhaustive-deps

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: inputMessage.trim() };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const modelResponse = await geminiService.sendMessage(userMessage.content, systemInstruction);
      setMessages((prevMessages) => [...prevMessages, modelResponse]);
    } catch (err: any) {
      console.error('Error in AI Chat:', err);
      setError(`Failed to get response: ${err.message}`);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'model', content: `Sorry, I encountered an error: ${err.message}. Please try again.` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg shadow-xl p-6">
      <h2 className="text-3xl font-bold text-yellow-400 mb-6 border-b border-gray-700 pb-4">
        AI Chat Assistant
      </h2>

      <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`mb-4 p-4 rounded-lg shadow-md ${
                msg.role === 'user'
                  ? 'bg-yellow-500 text-gray-900 self-end ml-auto'
                  : 'bg-gray-700 text-gray-100 self-start mr-auto'
              } max-w-[80%]`}
            >
              <p className="font-semibold mb-1">{msg.role === 'user' ? 'You' : 'FinWise AI'}</p>
              <p>{msg.content}</p>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && <LoadingSpinner />}
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="mt-6 flex gap-3">
        <Input
          id="chat-input"
          type="text"
          placeholder="Ask FinWise AI a question..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="flex-grow"
          disabled={isLoading}
        />
        <Button type="submit" isLoading={isLoading} disabled={!inputMessage.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
};

export default AIChatAssistant;