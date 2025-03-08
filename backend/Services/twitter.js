const express = require('express');
const app = express();
const User = require('../model/user');

app.use(express.json());

const twitterService = {

  async userTwitter(userData) {
    const { email, credentials: { appKey, appSecret, accessToken, accessSecret } } = userData;

    if (!email || !appKey || !appSecret || !accessToken || !accessSecret) {
      return {
        success: false,
        statusCode: 400,
        message: "All fields are required.",
      };
    }

    try {
      // Check if user already exists
      let user = await User.findOne({ email });

      if (!user) {
        return {
          success: false,
          statusCode: 404, // Conflict
          message: "User not found.",
        };
      }

      // Save new user
      user.appKey=appKey,
      user.appSecret=appSecret,
      user.accessToken=accessToken,
      user.accessSecret=accessSecret,
   


      await user.save();

      return {
        success: true,
        statusCode: 201,
        message: "Credentials saved successfully!",
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        statusCode: 500,
        message: "An error occurred while saving user information.",
        error: error.message,
      };
    }
  },

  // Save personality and schedule & send confirmation email
  async userTwitterData(userData) {
    const { email, personality, schedule } = userData;

    if (!email || !personality || !schedule) {
      return {
        success: false,
        statusCode: 400,
        message: "All fields are required.",
      };
    }

    try {
      // Check if user exists
      let user = await User.findOne({ email });

      if (!user) {
        return {
          success: false,
          statusCode: 404, // Not Found
          message: "User not found.",
        };
      }

      // Update user with new data
      user.personality = personality;
      user.schedule = schedule;
      await user.save();

      return {
        success: true,
        statusCode: 201,
        message: "Personality and schedule saved successfully!",
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        statusCode: 500,
        message: "An error occurred while updating user information.",
        error: error.message,
      };
    }
  },
  
      async getUserCredentials(email) {
          try {
              const user = await User.findOne({ email });
              if (!user) return null;
              
              return {
                  appKey: user.appKey,
                  appSecret: user.appSecret,
                  accessToken: user.accessToken,
                  accessSecret: user.accessSecret,
                  personality:user.personality,
                  schedule:user.schedule

              };
          } catch (error) {
              console.error('❌ Error fetching user credentials:', error);
              return null;
          }
      }
  
   
  };


module.exports = twitterService;
