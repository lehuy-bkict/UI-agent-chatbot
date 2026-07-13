import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import { MdClose, MdArrowUpward, MdSentimentSatisfied, MdDelete } from 'react-icons/md';
import { LuMinimize } from 'react-icons/lu';
import { sendMessageToAgent } from './agentConfig';
import { Message, EmojiPicker } from './sharedComponents';

const ExpandChat = ({ isOpen, onClose, messages, setMessages, isThinking, setIsThinking }) => {
  const [messageInput, setMessageInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isFormFocused, setIsFormFocused] = useState(false);
  
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const chatBodyRef = useRef(null);
  const inputRef = useRef(null);
  const formRef = useRef(null);
  const expandRef = useRef(null);
  const resizeRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const centerX = (window.innerWidth - size.width) / 2;
      const centerY = (window.innerHeight - size.height) / 2;
      setPosition({ x: centerX, y: centerY });
    }
  }, [isOpen]);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = '47px';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [messageInput]);

  const handleMouseDownResize = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizing && expandRef.current) {
        const rect = expandRef.current.getBoundingClientRect();
        const newWidth = Math.max(400, e.clientX - rect.left);
        const newHeight = Math.max(300, e.clientY - rect.top);
        setSize({ width: newWidth, height: newHeight });
      }
      if (isDragging) {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setIsDragging(false);
    };

    if (isResizing || isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, isDragging, dragStart]);

  // Handle dragging
  const handleMouseDownDrag = useCallback((e) => {
    if (e.target.closest('.expand-header-buttons')) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  }, [position]);

  const generateBotResponse = async () => {
    try {
      const { text, hasError } = await sendMessageToAgent(messageInput.trim());

      setMessages(prev => {
        const newMessages = [...prev];
        const lastBotMessageIndex = newMessages.findLastIndex(m => m.type === 'bot' && m.thinking);
        if (lastBotMessageIndex !== -1) {
          newMessages[lastBotMessageIndex] = {
            type: 'bot',
            content: hasError ? 'Error occurred while processing the message' : text,
            thinking: false,
            error: hasError
          };
        }
        return newMessages;
      });
    } catch (error) {
      console.log(error);
      setMessages(prev => {
        const newMessages = [...prev];
        const lastBotMessageIndex = newMessages.findLastIndex(m => m.type === 'bot' && m.thinking);
        if (lastBotMessageIndex !== -1) {
          newMessages[lastBotMessageIndex] = {
            type: 'bot',
            content: `Error: ${error.message}`,
            thinking: false,
            error: true
          };
        }
        return newMessages;
      });
    } finally {
      setIsThinking(false);
      setMessageInput('');
    }
  };

  const handleSendMessage = () => {
    const userMessage = messageInput.trim();
    if (!userMessage) return;

    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setMessageInput('');
    setIsThinking(true);
    setMessages(prev => [...prev, { type: 'bot', content: '', thinking: true }]);

    setTimeout(() => {
      generateBotResponse();
    }, 600);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && messageInput.trim() && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInsertEmoji = (emoji) => {
    const input = inputRef.current;
    if (input) {
      const { selectionStart, selectionEnd } = input;
      const text = input.value;
      const newText = text.slice(0, selectionStart) + emoji.native + text.slice(selectionEnd);
      setMessageInput(newText);
      setShowEmojiPicker(false);
      setTimeout(() => input.focus(), 100);
    }
  };

  const handleDeleteChat = () => {
    setMessages([
      { type: 'bot', content: 'Hey there 👋 How can I help you today?' }
    ]);
    setMessageInput('');
    setIsThinking(false);
  };

  if (!isOpen) return null;

  const displayMessages = messages || [
    { type: 'bot', content: 'Hey there 👋 How can I help you today?' }
  ];

  return (
    <div className="expand-overlay">
      <div 
        ref={expandRef}
        className="expand-chat-container"
        style={{
          width: `${size.width}px`,
          height: `${size.height}px`,
          transform: `translate(${position.x}px, ${position.y}px)`
        }}
      >
        <div 
          className="expand-header"
          onMouseDown={handleMouseDownDrag}
        >
          <div className="expand-header-info">
            <svg
              className="expand-chatbot-logo"
              xmlns="http://www.w3.org/2000/svg"
              width="50"
              height="50"
              viewBox="0 0 1024 1024"
            >
              <path
                d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"
              ></path>
            </svg>
            <h2 className="expand-logo-text">Agent Chatbot</h2>
          </div>
          <div className="expand-header-buttons">
            <button 
              className="expand-header-btn delete-btn"
              onClick={handleDeleteChat}
              title="Delete chat"
            >
              <MdDelete />
            </button>
            <button 
              className="expand-header-btn minimize-btn"
              onClick={() => onClose(true)}
              title="Minimize"
            >
              <LuMinimize />
            </button>
            <button 
              className="expand-header-btn close-btn"
              onClick={() => onClose(false)}
              title="Close"
            >
              <MdClose />
            </button>
          </div>
        </div>

        <div className="expand-chat-body" ref={chatBodyRef}>
          {displayMessages.map((msg, index) => (
            <Message 
              key={index} 
              type={msg.type} 
              content={msg.content} 
              thinking={msg.thinking}
            />
          ))}
        </div>

        <div className={`expand-chat-footer ${showEmojiPicker ? 'show-emoji-picker' : ''}`}>
          <form 
            className={`expand-chat-form ${isFormFocused ? 'focused' : ''}`} 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            ref={formRef}
          >
            <textarea
              ref={inputRef}
              placeholder="Message..."
              className="expand-message-input"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFormFocused(true)}
              onBlur={() => setIsFormFocused(false)}
              required
            />
            <div className="expand-chat-controls">
              <button 
                type="button" 
                className="expand-emoji-btn"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <MdSentimentSatisfied />
              </button>
              <button type="submit" className="expand-send-btn">
                <MdArrowUpward />
              </button>
            </div>
          </form>
          {showEmojiPicker && (
            <EmojiPicker 
              onSelect={handleInsertEmoji} 
              onClose={() => setShowEmojiPicker(false)}
            />
          )}
        </div>

        <div 
          ref={resizeRef}
          className="expand-resize-handle"
          onMouseDown={handleMouseDownResize}
        />
      </div>
    </div>
  );
};

export default ExpandChat;
