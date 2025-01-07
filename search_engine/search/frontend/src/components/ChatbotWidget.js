import React, { useState } from 'react';
import "../assets/styles/style.css";
import robotAvatar from "../assets/images/avatar_robot.jpg";
import userAvatar from "../assets/images/avatar_user.jpg";
import axios from "axios";

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isFirstOpen, setIsFirstOpen] = useState(true);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);

    if (!isOpen && isFirstOpen && chatHistory.length === 0) {
      setIsFirstOpen(false); // Ensure this happens only the first time
      setTimeout(() => {
        setChatHistory((prevHistory) => [
          ...prevHistory,
          { sender: "bot", message: "Hi! I'm your NFDIBIOIMAGE Assistant. How can I help you today?" }
        ]);
      }, 500); // 0.5s delay
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

    try {
      const res = await axios.post("http://localhost:5002/api/chat", { query });
      setChatHistory([...newChatHistory, { sender: "bot", message: res.data.response }]);
    } catch (error) {
      setChatHistory([...newChatHistory, { sender: "bot", message: "Error: Unable to get a response from the chatbot." }]);
    }
  };

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
          <div className="chatbot-body">
            <div className="chat-bubbles">
              {chatHistory.map((chat, index) => (
                <div key={index} className={`chat-row ${chat.sender === "user" ? "user-row" : "bot-row"}`}>
                  {chat.sender === "bot" && (
                    <>
                      <img src={robotAvatar} alt="Robot Avatar" className="chat-avatar" />
                      <div className="chat-bubble chatbot-bubble">{chat.message}</div>
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
            </div>
          </div>
          <form onSubmit={handleSubmit} className="chat-input-form">
            <textarea
              value={query}
              onChange={handleQueryChange}
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
