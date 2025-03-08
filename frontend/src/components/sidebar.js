import axios from 'axios';
import React, { useState } from 'react';
import { AiOutlineClockCircle, AiOutlineMenu, AiOutlineTwitter } from 'react-icons/ai';
import { FaTelegram } from 'react-icons/fa';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const Sidebar = () => {
  const [isTwitterModalOpen, setTwitterModalOpen] = useState(false);
  const [isCredentialModalOpen, setCredentialModalOpen] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [personality, setPersonality] = useState('');
  const [isTweetModalOpen, setTweetModalOpen] = useState(false);
  const [schedule, setSchedule] = useState('1');
  const [credentials, setCredentials] = useState({
    appKey: '',
    appSecret: '',
    accessToken: '',
    accessSecret: '',
  });

  const [telegramCredentials, setTelegramCredentials] = useState({
    botToken: '',
    chatId: ''
  })

  const email = localStorage.getItem('email');

  const handleTwitterSubmit = async () => {

    console.log(credentials)
    try {
      const response = await axios.post(`http://localhost:4001/save/twitter`, {
        credentials,
        email
      });

      if (response.status === 201) {
        alert('Twitter connected successfully!');
      } else {
        alert('Failed to connect Twitter: ' + response.data.message);
      }

      console.log(response)
    } catch (error) {
      alert('An error occurred while connecting to Twitter.');
    } finally {
      setTwitterModalOpen(false);
    }
  };

  const handleSendTweet = async () => {
    try {
      const response = await axios.post("http://localhost:4001/tweet/data", {
        personality,
        schedule,
        email
      });
  
      if (response.status === 201) {
        alert('Twitter connected successfully!');
      } else {
        alert('Failed to connect Twitter: ' + response.data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while sending the tweet.");
    } finally {
      setTweetModalOpen(false);
    }
  };



  const handleTelegramConnect = async () => {
    try {
      const response = await axios.post(`http://localhost:4001/save/telegram`, {
        Token: telegramCredentials.botToken,
        chatId: telegramCredentials.chatId,
        email
      });

      if (response.status === 201) {
        alert('Telegram connected successfully!');
      } else {
        alert('Failed to connect Telegram: ' + response.data.message);
      }
    } catch (error) {
      alert('An error occurred while connecting to Telegram.');
    } finally {
      setCredentialModalOpen(false);
    }
  };
  // ** Handle sending message to Telegram **


  const iframeUrl = `http://localhost:3000/viewownagent`;


  return (
    <>
      {/* Menu Button for Mobile */}
      <button
        className="fixed -top-16 left-4 z-50 p-2 bg-gray-800 text-white rounded-md md:hidden"
        onClick={() => setSidebarOpen(!isSidebarOpen)}
      >
        <AiOutlineMenu size={24} />
      </button>

      {/* Sidebar */}
      <div
        className={`fixed -top-12 left-0 h-full bg-gray-100 p-4 border-r border-gray-300 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 md:relative md:translate-x-0 md:w-1/4`}>


        <h2 className="text-lg font-bold mb-4 mt-28">Twitter Inegration </h2>
        <button
          onClick={() => setTwitterModalOpen(true)}
          className="flex items-center gap-2 w-full px-4 py-2 mb-4 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <AiOutlineTwitter /> Connect to Twitter
        </button>
       

       
        <button
          onClick={() => setTweetModalOpen(true)}
          className="flex items-center gap-2 w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          <AiOutlineClockCircle /> Schedule Tweet and add personality
        </button>
     

        <h2 className="text-lg font-bold mb-4 mt-6 text-black" >Telegram Inegration </h2>
        <button
        onClick={() => setCredentialModalOpen(true)}
        className="flex items-center gap-2  w-full px-4 py-2 mb-4  mt-3 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
       <FaTelegram /> Connect Telegram
      </button>



    
         <h2 className="text-lg font-bold mb-4 mt-10">How to Connect Twitter</h2>
           <a 
           href="https://visuals-org.gitbook.io/https-ai-saas-frontend.vercel.app/api-integration-and-media/integrations" 
           className="text-blue-500 underline"
           target="_blank"
            rel="noopener noreferrer"
           >
            Click here to view the guide
           </a>


           <h2 className="text-lg font-bold mb-4 mt-10">How to Connect Telegram</h2>
           <a 
           href="https://visuals-org.gitbook.io/https-ai-saas-frontend.vercel.app/api-integration-and-media/telegram-integration" 
           className="text-blue-500 underline"
           target="_blank"
            rel="noopener noreferrer"
           >
            Click here to view the guide
           </a>
           <div className="text-lg font-bold mb-4 mt-10"></div>

     
        <Modal
          isOpen={isTwitterModalOpen}
          onRequestClose={() => setTwitterModalOpen(false)}
          className="bg-white p-6 rounded shadow-lg max-w-lg mx-auto mt-20"
          overlayClassName="bg-gray-800 bg-opacity-50 fixed inset-0 flex items-center justify-center"
        >
          <h2 className="text-xl font-bold mb-4">Connect to Twitter</h2>
          <input
            type="text"
            placeholder="Api Key"
            value={credentials.appKey}
            onChange={(e) =>
              setCredentials({ ...credentials, appKey: e.target.value })
            }
            className="w-full px-4 py-2 mb-2 border rounded"
          />
          <input
            type="text"
            placeholder="Api Secret"
            value={credentials.appSecret}
            onChange={(e) =>
              setCredentials({ ...credentials, appSecret: e.target.value })
            }
            className="w-full px-4 py-2 mb-2 border rounded"
          />
          <input
            type="text"
            placeholder="Access Token"
            value={credentials.accessToken}
            onChange={(e) =>
              setCredentials({ ...credentials, accessToken: e.target.value })
            }
            className="w-full px-4 py-2 mb-2 border rounded"
          />
          <input
            type="text"
            placeholder="Access Token Secret"
            value={credentials.accessSecret}
            onChange={(e) =>
              setCredentials({ ...credentials, accessSecret: e.target.value })
            }
            className="w-full px-4 py-2 mb-4 border rounded"
          />
          <button
            onClick={handleTwitterSubmit}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Submit
          </button>
        </Modal>


        <Modal
          isOpen={isTweetModalOpen}
          onRequestClose={() => setTweetModalOpen(false)}
          className="bg-white p-6 rounded shadow-lg max-w-lg mx-auto mt-20"
          overlayClassName="bg-gray-800 bg-opacity-50 fixed inset-0 flex items-center justify-center"
        >
          <h2 className="text-xl font-bold mb-4">Schedule Tweet and Personality</h2>
          <textarea
            placeholder="Write your rersonality here..."
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
            className="w-full px-4 py-2 mb-4 border rounded h-24"
          />
         <select
  value={schedule}
  onChange={(e) => setSchedule(e.target.value)}
  className="w-full px-4 py-2 mb-4 border rounded">
  <option value="0.5">30 minute</option>
  <option value="1"> 1 hour</option>
  <option value="2">2 hours</option>
  <option value="3">3 hours</option>
  <option value="4">4 hours</option>
  <option value="5">5 hours</option>
  <option value="6">6 hours</option>

</select>
         
          <button
            onClick={handleSendTweet}
            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Submit
          </button>
        </Modal>


        <Modal
        isOpen={isCredentialModalOpen}
        onRequestClose={() => setCredentialModalOpen(false)}
        className="bg-white p-6 rounded shadow-lg max-w-lg mx-auto mt-20"
        overlayClassName="bg-gray-800 bg-opacity-50 fixed inset-0 flex items-center justify-center"
      >
        <h2 className="text-xl font-bold mb-4">Connect to Telegram</h2>
        <input
          type="text"
          placeholder="Bot Token"
          value={telegramCredentials.botToken}
          onChange={(e) => setTelegramCredentials({ ...telegramCredentials, botToken: e.target.value })}
          className="w-full px-4 py-2 mb-2 border rounded"
        />
        <input
          type="text"
          placeholder="Chat ID"
          value={telegramCredentials.chatId}
          onChange={(e) => setTelegramCredentials({ ...telegramCredentials, chatId: e.target.value })}
          className="w-full px-4 py-2 mb-4 border rounded"
        />
        <button
          onClick={handleTelegramConnect}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Submit
        </button>
      </Modal>


      {/* Message Modal */}
  
   
      </div>
    </>
  );
};

export default Sidebar;
