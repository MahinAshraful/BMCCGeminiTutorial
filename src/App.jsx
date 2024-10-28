// Import necessary dependencies
import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Retrieve the API key from Vite's environment variables
// This keeps the API key secure and not hardcoded in the source
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize the Gemini API client with the API key
const genAI = new GoogleGenerativeAI(apiKey);

//npm install @google/generative-ai

// Get the chat model
// We use "gemini-pro" which is suitable for text-based conversations
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Define the main App component
const App = () => {
  // State to store chat messages
  // Each message is an object with 'text' and 'sender' properties
  const [messages, setMessages] = useState([]);
  
  // State to store the current user input
  const [input, setInput] = useState('');
  
  // State to track if the bot is currently processing a message
  const [isLoading, setIsLoading] = useState(false);

  // Function to handle sending a message
  const handleSend = async () => {
    // Don't send if the input is empty or if we're already processing a message
    if (input.trim() === '' || isLoading) return;
    
    // Create a message object for the user's input
    const userMessage = { text: input, sender: 'user' };
    
    // Add the user's message to the chat
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Clear the input field
    setInput('');
    
    // Set loading state to true while we wait for the AI's response
    setIsLoading(true);
    
    try {
      // Send the user's input to the Gemini API and wait for a response
      const result = await model.generateContent(input);
      
      // Create a message object for the bot's response
      const botMessage = { text: result.response.text(), sender: 'bot' };
      
      // Add the bot's message to the chat
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      // Log any errors to the console
      console.error('Error calling Gemini API:', error);
      
      // If there's an error, add an error message to the chat
      const errorMessage = { text: 'Sorry, I encountered an error. Please try again.', sender: 'bot' };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      // Set loading state back to false, whether the API call succeeded or failed
      setIsLoading(false);
    }
  };

  // Function to handle key down events in the input field
  const handleKeyDown = (e) => {
    // Check if the pressed key is 'Enter' and the Shift key is not held down
    if (e.key === 'Enter' && !e.shiftKey) {
      // Prevent the default action (newline in textarea)
      e.preventDefault();
      // Send the message
      handleSend();
    }
  };

  // Render the component
  return (
    <div>
      {/* Title of the chatbot */}
      <h1>Gemini Chatbot</h1>
      
      {/* Chat messages container */}
      <div>
        {/* Map through messages and render each one */}
        {messages.map((message, index) => (
          <div key={index}>
            <span>{message.text}</span>
          </div>
        ))}
        {/* Show a loading message when the bot is typing */}
        {isLoading && <div>Bot is typing...</div>}
      </div>
      
      {/* Input area */}
      <div>
        {/* Text input for user messages */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
        />
        {/* Send button */}
        <button onClick={handleSend} disabled={isLoading}>
          Send
        </button>
      </div>
    </div>
  );
};
// Export the App component as the default export
export default App;