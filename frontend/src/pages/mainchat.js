import React from 'react';
import Chat from '../components/chat';
import Sidebar from '../components/sidebar';
import '../styles/style.css';

function Mainchat() {


  return (
    <div className="app-container">
      <Sidebar/>
      <Chat/>
    </div>
  );
}

export default Mainchat;
