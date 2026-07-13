import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { MdModeComment, MdDelete, MdClose,
      MdArrowUpward, MdSentimentSatisfied, MdKeyboardArrowDown } from 'react-icons/md';
import {LuExpand} from 'react-icons/lu';
import { sendMessageToAgent } from './agentConfig';
import { Message, EmojiPicker } from './sharedComponents';
import ExpandChat from './expand';

// ChatHeader Component
const ChatHeader = ({ onClose }) => (
  <div className="chat-header">
    <div className="header-info">
      <svg
        className="chatbot-logo"
        xmlns="http://www.w3.org/2000/svg"
        width="50"
        height="50"
        viewBox="0 0 1024 1024"
      >
        <path
          d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"
        ></path>
      </svg>
      <h2 className="logo-text">Agent Chatbot</h2>
    </div>
    <button id="close-chatbot" onClick={onClose}>
      <MdKeyboardArrowDown />
    </button>
  </div>
);

// ChatFooter Component
const ChatFooter = ({ onSendMessage, messageInput, setMessageInput, inputRef, formRef }) => {
  const [isFormFocused, setIsFormFocused] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const initialInputHeight = 47;

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = `${initialInputHeight}px`;
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [messageInput, inputRef]);

  const handleKeyDown = (e) => {
    const userMessage = e.target.value.trim();
    if (e.key === 'Enter' && userMessage && !e.shiftKey && window.innerWidth > 768) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim()) {
      onSendMessage();
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

  return (
    <div className={`chat-footer ${showEmojiPicker ? 'show-emoji-picker' : ''}`}>
      <form 
        className={`chat-form ${isFormFocused ? 'focused' : ''}`} 
        onSubmit={handleSendMessage}
        ref={formRef}
      >
        <textarea
          ref={inputRef}
          placeholder="Message..."
          className="message-input"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFormFocused(true)}
          onBlur={() => setIsFormFocused(false)}
          required
        />
        <div className="chat-controls">
          <button 
            type="button" 
            id="emoji-picker" 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <MdSentimentSatisfied />
          </button>
          <button type="submit" id="send-message">
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
  );
};

// Main App Component
function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isExpandOpen, setIsExpandOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', content: 'Hey there 👋 How can I help you today?' }
  ]);
  const [messageInput, setMessageInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  
  const chatBodyRef = useRef(null);
  const inputRef = useRef(null);
  const formRef = useRef(null);

  // Chat history
  const chatHistory = [];

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

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

      // Save to chat history
      if (!hasError) {
        chatHistory.push({ role: "user", content: messageInput.trim() });
        chatHistory.push({ role: "assistant", content: text });
      }
    } catch (error) {
      console.log(error);
      setMessages(prev => {
        const newMessages = [...prev];
        const lastBotMessageIndex = newMessages.findLastIndex(m => m.type === 'bot' && m.thinking);
        if (lastBotMessageIndex !== -1) {
          newMessages[lastBotMessageIndex] = {
            type: 'bot',
            content: `Lỗi: ${error.message}`,
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

  const toggleChatbot = () => {
    setIsChatOpen(!isChatOpen);
  };

  const closeChatbot = () => {
    setIsChatOpen(false);
  };

  const handleDeleteChat = () => {
    setMessages([
      { type: 'bot', content: 'Hey there 👋 How can I help you today?' }
    ]);
    setMessageInput('');
    setIsThinking(false);
  };

  return (
    <div className="App">
      {/* Chatbot Toggler Button */}
      <button 
        id="chatbot-toggler" 
        onClick={toggleChatbot}
        className={isChatOpen ? 'rotated' : ''}
      >
        <span className="mode-comment"><MdModeComment /></span>
        <span className="close"><MdClose /></span>
      </button>

      {/* Expand Button - Hiển thị khi chat mở */}
      <button 
        id="expand-chat"
        className={isChatOpen ? 'visible' : ''}
        title="Expand chat"
        onClick={() => {
          setIsExpandOpen(true);
          setIsChatOpen(false);
        }}
      >
        <LuExpand/>
      </button>

      {/* Expand Chat Modal */}
      <ExpandChat 
        isOpen={isExpandOpen} 
        onClose={(showSmallChat) => {
          setIsExpandOpen(false);
          if (showSmallChat) {
            setIsChatOpen(true);
          }
        }}
        messages={messages}
        setMessages={setMessages}
        isThinking={isThinking}
        setIsThinking={setIsThinking}
      />

      {/* Delete Button - Hiển thị khi chat mở */}
      <button 
        id="delete-chat"
        className={isChatOpen ? 'visible' : ''}
        onClick={handleDeleteChat}
        title="Delete chat"
      >
        <MdDelete />
      </button>

      {/* Chatbot Popup */}
      <div className={`chatbot-popup ${isChatOpen ? 'visible' : ''}`}>
        <ChatHeader onClose={closeChatbot} />
        
        <div className="chat-body" ref={chatBodyRef}>
          {messages.map((msg, index) => (
            <Message 
              key={index} 
              type={msg.type} 
              content={msg.content} 
              thinking={msg.thinking}
              error={msg.error}
            />
          ))}
        </div>

        <ChatFooter 
          onSendMessage={handleSendMessage}
          messageInput={messageInput}
          setMessageInput={setMessageInput}
          inputRef={inputRef}
          formRef={formRef}
        />
      </div>
    </div>
  );
}

export default App;
