import { Send } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { FaMicrophone } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';


const IframeChat = () => {
  const [chat, setChat] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const recognitionRef = useRef(null);

  // Speech recognition functions remain the same
  const startSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech Recognition API is not supported in this browser.');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false; 
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setUserInput(speechToText); 

      // Auto-send message after transcription
      handleChat(speechToText);
    };

    recognition.start(); // Start recognition
    recognitionRef.current = recognition;
  };

  // Stop speech recognition
  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // Handle chat submission
  const handleChat = async (input = userInput) => {
    if (!input.trim()) {
      return;
    }

    setIsThinking(true);

 // Add user's message to the chat
   const userMessage = { sender: "You", text: userInput };
   setChat(prevChat => [...prevChat, userMessage]);

 try {
   const res = await fetch("http://localhost:4001/chat", {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
     },
     body: JSON.stringify({ message:input}),
   });

   const data = await res.json();
   console.log(data);

   // Format the AI's response (Markdown content)
   let aiResponse = data.message || "❌ No response from AI";

   // Add AI's response to the chat
   setChat(prevChat => [...prevChat, { sender: "AI", text: aiResponse }]);

 } catch (error) {
   console.error('Error in chat:', error);
   setChat(prevChat => [...prevChat, { sender: "AI", text: "❌ Error: Unable to process request" }]);
 }
 finally{

  setIsThinking(false);
  
 }

};



const handleKeyDown = (e) => {
  if (e.key === 'Enter' && userInput.trim()) {
    handleChat(userInput);
  }
};


  return (
     <div className="flex-1 flex flex-col h-screen bg-black">
       <div className="flex-1 overflow-y-auto space-y-4 mt-3 ml-2 mr-3">
       {chat.length === 0 ? (
               <p className="text-gray-400 text-center">Start chatting...</p>
             ) : (
               chat.map((msg, index) => (
                 <div
                   key={index}
                   className={`p-3 rounded-lg shadow-md ${
                     chat.sender === 'user'
                       ? 'bg-yellow-500 text-black self-end'
                       : 'bg-yellow-200 text-black self-start'
                   }`}
                   style={{
                     maxWidth: '100%',
                     alignSelf: chat.sender === 'user' ? 'flex-end' : 'flex-start',
                     marginBottom: '10px',
                   }}
                 >
                   <strong className="p-2 mt-1">{msg.sender}:</strong> <ReactMarkdown>{msg.text}</ReactMarkdown>
                 </div>
               ))
             )}
             
         {isThinking && (
           <div className="flex items-center space-x-2 p-4  bg-yellow-500/20 rounded-lg">
             <div className="text-yellow-500">Thinking</div>
             <div className="flex space-x-1">
               {[0, 1, 2].map((index) => (
                 <div
                   key={index}
                   className={`w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce`}
                   style={{
                     animationDelay: `${index * 0.2}s`,
                     animationDuration: '1.2s'
                   }}
                 />
               ))}
             </div>
           </div>
         )}
       </div>
   
       <div className="flex items-center bg-black p-4 border-t border-yellow-500/20">
         <button
           onClick={isRecording ? stopSpeechRecognition : startSpeechRecognition}
           className={`${
             isRecording ? 'bg-red-500' : 'bg-yellow-500'
           } text-black rounded-l p-3 mr-2 hover:opacity-90 transition-opacity`}
         >
           <FaMicrophone className="mr-0" />
         </button>
   
         <input
           type="text"
           placeholder="Type your message..."
           value={userInput}
           onChange={(e) => setUserInput(e.target.value)}
           onKeyDown={handleKeyDown}
           className="flex-1 mx-4 p-3 rounded-lg text-sm md:text-base shadow-sm focus:ring-2 focus:ring-yellow-500 focus:outline-none bg-yellow-500/10 text-yellow-500 placeholder-yellow-500/50 border border-yellow-500/20"
         />
   
         <button
           onClick={() => handleChat(userInput)}
           className="flex items-center justify-center bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-3 rounded-lg shadow-md transition-all duration-300"
         >
           <Send size={18} />
           <span className="ml-2 hidden sm:inline">Send</span>
         </button>
       </div>
     </div>

  );
};

export default IframeChat;
