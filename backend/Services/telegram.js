const express = require('express');
const app = express();
const User = require('../model/user');

app.use(express.json());

const telegramService = {

    async userTelegram(userData) {
        const { chatId, Token, email } = userData;
    
        if (!chatId || !Token) {
            return { 
                success: false, 
                statusCode: 400, // Bad Request
                message: 'All fields are required.' 
            };
        }
    
        try {
            // Check if user already exists
            let user = await User.findOne({ email });
    
            if (user) {
                // Update existing user
                user.Token = Token;
                user.chatId = chatId;
                await user.save();
            } 
            return {
                success: true,
                statusCode: 201, // Created or 200 if it's an update
                message: 'Credentials updated successfully!'
            };
    
        } catch (error) {
            console.error(error);
            return {
                success: false,
                statusCode: 500, // Internal Server Error
                message: 'An error occurred while updating user information.',
                error: error.message
            };
        }
    },
    

      async getUserCredentials(email) {
        try {
            const user = await User.findOne({ email });
            if (!user) return null;
            
            return {
                chatId: user.chatId,
                Token: user.Token,

            };
        } catch (error) {
            console.error('❌ Error fetching user credentials:', error);
            return null;
        }
    }

  };


module.exports = telegramService;
