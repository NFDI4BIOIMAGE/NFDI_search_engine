import React, { useState, useEffect, useRef } from 'react';
import "../assets/styles/style.css";
import robotAvatar from "../assets/images/avatar_robot.jpg";
import userAvatar from "../assets/images/avatar_user.jpg";
import axios from "axios";

// Utility function to detect and render URLs as clickable links
const renderMessageWithLinks = (message) => {
  // Updated regex to exclude trailing parentheses unless balanced
  const urlRegex = /(https?:\/\/[^\s\)\]]*[^\s\)\]\.])/g;
  const parts = message.split(urlRegex);

  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#007bff", textDecoration: "underline" }}
        >
          {part}
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
};


const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isFirstOpen, setIsFirstOpen] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const chatContainerRef = useRef(null); // Reference for chat bubbles container

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    if (!isOpen && isFirstOpen && chatHistory.length === 0) {
      setIsFirstOpen(false);
      setTimeout(() => {
        setChatHistory((prevHistory) => [
          ...prevHistory,
          { sender: "bot", message: "Hi! I'm your NFDIBIOIMAGE Assistant. How can I help you today?" }
        ]);
      }, 500);
    }
  };

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const newChatHistory = [...chatHistory, { sender: "user", message: query }];
    setChatHistory(newChatHistory);
    setQuery("");

    let thinkingTimeout = setTimeout(() => setIsThinking(true), 1000);

    try {
      const res = await axios.post("http://localhost:5002/api/chat", { query });
      clearTimeout(thinkingTimeout);
      setIsThinking(false);
      setChatHistory([...newChatHistory, { sender: "bot", message: res.data.response }]);
    } catch (error) {
      clearTimeout(thinkingTimeout);
      setIsThinking(false);
      setChatHistory([...newChatHistory, { sender: "bot", message: "Error: Unable to get a response from the chatbot." }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    // Automatically scroll to the bottom of the chat
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, isThinking]); // Trigger scroll on chatHistory or isThinking change

  return (
    <div className="chatbot-icon-container">
      <img
        src={robotAvatar}
        alt="Chatbot Avatar"
        className="chatbot-icon"
        onClick={toggleChatbot}
      />
      {isOpen && (
        <div className="chatbot-popup">
          <div className="chatbot-header">
            <h5>NFDIBIOIMAGE Assistant</h5>
            <button className="close-button" onClick={toggleChatbot}>&times;</button>
          </div>
          <div className="chatbot-body" ref={chatContainerRef}>
            <div className="chat-bubbles">
              {chatHistory.map((chat, index) => (
                <div key={index} className={`chat-row ${chat.sender === "user" ? "user-row" : "bot-row"}`}>
                  {chat.sender === "bot" && (
                    <>
                      <img src={robotAvatar} alt="Robot Avatar" className="chat-avatar" />
                      <div className="chat-bubble chatbot-bubble">
                        {renderMessageWithLinks(chat.message)}
                      </div>
                    </>
                  )}
                  {chat.sender === "user" && (
                    <>
                      <div className="chat-bubble user-bubble">{chat.message}</div>
                      <img src={userAvatar} alt="User Avatar" className="chat-avatar" />
                    </>
                  )}
                </div>
              ))}
              {isThinking && (
                <div className="chat-row bot-row">
                  <img src={robotAvatar} alt="Robot Avatar" className="chat-avatar" />
                  <div className="chat-bubble chatbot-bubble thinking-text">
                    The assistant is thinking...
                  </div>
                </div>
              )}
            </div>
          </div>
          <form onSubmit={handleSubmit} className="chat-input-form">
            <textarea
              value={query}
              onChange={handleQueryChange}
              onKeyDown={handleKeyDown} // Use onKeyDown instead of onKeyPress
              placeholder="Ask me anything..."
            ></textarea>
            <button type="submit" className="send-button">Send</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
