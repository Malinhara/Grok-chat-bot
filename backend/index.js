require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { TwitterApi } = require('twitter-api-v2');
const { initializeAgentExecutorWithOptions } = require('langchain/agents');
const { DynamicTool } = require('langchain/tools');
const { ChatXAI } = require('@langchain/xai');
const config = require('./config');
const twitterService = require('./Services/twitter'); // Fixed duplicate import
const connectDB = require('./dbConnection/Db');
const telegramService = require('./Services/telegram');
const userService = require('./Services/Login');
const cron = require('node-cron');
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json());
app.use(cors({ origin: 'http://localhost:4000', credentials: true }));



// Initialize ChatXAI (xAI's model)
const grok = new ChatXAI({
  model: 'grok-2-1212',
  temperature: 0,
  maxTokens: 1000, // Set a reasonable default instead of undefined
  maxRetries: 2,
  apiKey: config.GROK_CHAT_API_KEY,
});


let globalEmail = null;


let scheduledJobs = {}; // Store active cron jobs

// Convert schedule ("1", "2", ...) into a valid cron format
const parseSchedule = (schedule) => {
  const time = parseFloat(schedule); // Use parseFloat for better flexibility

  if (isNaN(time)) return null;

  switch (time) {
    case 0.5: // 30 minutes
      return "*/30 * * * *"; // Runs every 30 minutes
    case 1: // 1 hour
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
      return `0 */${time} * * *`; // Runs every X hours
    default:
      return null; // Invalid input
  }
};

// Twitter Posting Function
const postTweet = async (email) => {
  try {
    const credentials = await twitterService.getUserCredentials(email);
    if (!credentials) {
      console.error(`❌ No credentials found for ${email}`);
      return;
    }

    // Generate tweet content using LangChain
    const response = await grok.invoke(`Generate a tweet based on the personality also tweet should be less than 228 charaters "${credentials.personality}"`);

    let tweetText = response.text; // Adjust according to the actual response structure

    tweetText = tweetText.replace(/\(Character count: \d+\)/, "").trim();

    // Check if the tweet is within the character limit
    if (tweetText.length > 226) {
      console.error(`❌ Tweet exceeds 226 characters, and it will not be posted.`);
      return;
    }

    // Twitter API client
    const client = new TwitterApi({
      appKey: credentials.appKey,
      appSecret: credentials.appSecret,
      accessToken: credentials.accessToken,
      accessSecret: credentials.accessSecret,
    });

    // Post the tweet
    await client.v2.tweet(tweetText);

    console.log(`✅ Tweet posted for ${email}: ${tweetText}`);
  } catch (error) {
    console.error(`❌ Error posting tweet for ${email}:`, error.message);
  }
};


const posttelegramMessage = async (text, botToken, chatId) => {
  try {
    // Ensure the message is a valid string and does not exceed 280 characters
    if (!text || typeof text !== 'string' || text.length > 280) {
      return '❌ Error: Message must be a non-empty string ≤ 280 characters.';
    }

    // Make the request to Telegram's API
    const response = await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      chat_id: chatId,
      text: text,
    });

    // If the request is successful, return a success message
    if (response.data.ok) {
      return '✅ Your message has been posted successfully!';
    } else {
      return `❌ Error: Failed to send message to Telegram.`;
    }
  } catch (error) {
    return `❌ Error: ${error.message}`;
  }
};


const twitterSelectionTool = new DynamicTool({
  name: 'TwitterSetupGuide',
  func: async () => {
    return `📢 **Twitter (X) Integration & Scheduling Guide**  

🔹 **Step 1: Connect Your Twitter Account**  
1. Open the left-side navbar.  
2. Navigate to **Twitter Integration**.  
3. Fill in your Twitter API credentials (App Key, App Secret, Access Token, Access Secret).  
4. Click **Submit** to save your credentials.  

🔹 **Step 2: Schedule Tweets**  
1. Open the left-side navbar.  
2. Navigate to **Schedule Tweet**.  
3. Add your tweet personality and select a posting schedule.  
4. Click **Submit** to start automated posting.  

✅ Once set up, your tweets will be posted automatically based on your schedule! 🚀`;
  },
  description: 'Provides guidance on integrating Twitter (X) and scheduling posts when users ask related questions.',
});



const TelegramSelectionTool = new DynamicTool({
  name: 'TelegramSetupGuide',
  func: async () => {
    return `📢 To access Telegram features, please complete the setup form in the left-side navbar.  

🔹 **How to send a message?**  
Use this format: **"Message: I love AI!"**  

Once set up, you’ll be able to send messages and interact on Telegram seamlessly! 🚀`;
  },
  description: 'Guides users on setting up and using Telegram when they ask related questions.',
});


const telegramTool = new DynamicTool({
  name: 'PostTelegram',
  func: async (Meesage) => { // Receive email and input (the full command)


    // Check for email
    if (!globalEmail) {
      return 'Email required for authentication. Please log in and try again.';
    }

    // Validate input format (check if it starts with "Post: ")
    if (!Meesage || !Meesage.startsWith('Meesage: ')) {
      return 'Input must start with "Meesage: " followed by the tweet text (e.g., "Meesage: I love AI!")';
    }

    // Extract the tweet text by slicing off "Post: " (6 characters)
    const Text = Meesage.slice(6).trim();

    // Check if the tweet text is empty after extraction
    if (!Text) {
      return 'Meesage text cannot be empty. Please provide a message to telegram.';
    }

    // Fetch user credentials
    const credentials = await telegramService.getUserCredentials(globalEmail);
    if (!credentials) {
      return `📢 Before you can post a Message, please fill out the Telegram form on the left-side navbar to set up your account.`;
    }

    // Post the message to Telegram using the credentials (bot token and chatId)
    const result = await posttelegramMessage(Text, credentials.Token, credentials.chatId);
    if (result.startsWith('❌')) {
      return result; // If an error occurs while posting, return the error
    }

    // Successfully posted the message to Telegram
    return `🎉 Success! Your message: "${text}" has been posted to Telegram!`;
  },
  description: 'Posts a message to Telegram after verifying credentials. Input must be "Message: <message>".',
});




// const tweetTool = new DynamicTool({
//   name: 'PostTweet',
//   func: async () => { // Receive email and input (the full command)


//     // Check for email
//     if (!globalEmail) {
//       return '❌ Error: Email required for authentication. Please log in and try again.';
//     }


//     // Fetch user credentials
//     const credentials = await twitterService.getUserCredentials(globalEmail);
//     if (!credentials) {
//       return `📢 Before you can post a tweet, please fill out the Twitter form on the left-side navbar to set up your account.`;
//     }

  

//     // Successfully posted the tweet
//     return `🎉 Success! Your tweet: "${tweetText}" has been posted to Twitter!`;
//   },
//   description: 'Posts a tweet after verifying credentials. Input must be "Post: <tweet text>".',
// });



// Greeting Tool
const greetingTool = new DynamicTool({
  name: 'GreetUser',
  func: async () => null, // or async () => '',
  description: 'First message - do not repeat same this Please',
});

// General Chat Tool
const generalChatTool = new DynamicTool({
  name: 'GeneralChat',
  func: async ({ input }) => {
    const response = await grok.invoke(input);
    return response.content; // Use .content for ChatXAI response
  },
  description: 'Handles general queries not related to Twitter and Telegram.',
});

// Initialize LangChain Agent
const initializeAgent = async () => {
  return await initializeAgentExecutorWithOptions(
    [twitterSelectionTool,greetingTool,TelegramSelectionTool,generalChatTool,telegramTool],
    grok,
    {
      agentType: 'zero-shot-react-description',
      returnIntermediateSteps: true,
      verbose: true, // Enable for debugging
      maxIterations: 10, // Prevent infinite loops
      maxTokens: 1000, // Consistent with ChatXAI
      earlyStoppingMethod: 'force', // Stop cleanly if max iterations hit
    }
  );
};

// Chat Endpoint
app.post('/chat', async (req, res) => {
  const { message, email } = req.body || {};

  if (!message) {
    return res.status(400).json({ success: false, message: '❌ Error: No message provided.' });
  }

  if (email && !globalEmail) {
    globalEmail = email;
  }



  try {
    const agent = await initializeAgent();
    const response = await agent.invoke({ input: message, email });

    let fullResponse = `✨ ${response.output}`;
    if (response.intermediateSteps?.length > 0) {
      const toolOutput = response.intermediateSteps.map((step) => step.observation).join('\n');
      fullResponse += `\n\n${toolOutput}`;
    }
    fullResponse += `\n\n`;

    res.json({ success: true, message: fullResponse });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: `Sorry I have not idea about this question`,
    });
  }
});

// Save Twitter Credentials Endpoint
app.post('/save/twitter', async (req, res) => {
  try {
    const response = await twitterService.userTwitter(req.body);
    console.log('Save response:', response);
    res.status(response.statusCode || 200).json(response);
  } catch (error) {
    console.error('❌ Error in /save endpoint:', error);
    res.status(500).json({ success: false, message: `❌ Error: ${error.message}` });
  }
});



app.post('/user/login', async (req, res) => {
  try {
    const response = await userService.userLogin(req.body);

    res.status(response.statusCode || 200).json(response);
  } catch (error) {
    console.error('❌ Error in /save endpoint:', error);
    res.status(500).json({ success: false, message: `❌ Error: ${error.message}` });
  }
});


app.post('/user/register', async (req, res) => {
  try {
    const response = await userService.userRegister(req.body);

    res.status(response.statusCode || 200).json(response);
  } catch (error) {
    console.error('❌ Error in /save endpoint:', error);
    res.status(500).json({ success: false, message: `❌ Error: ${error.message}` });
  }
});


app.post('/save/telegram', async (req, res) => {
  try {
    const response = await telegramService.userTelegram(req.body);
    console.log('Save response:', response);
    res.status(response.statusCode || 200).json(response);
  } catch (error) {
    console.error('❌ Error in /save endpoint:', error);
    res.status(500).json({ success: false, message: `❌ Error: ${error.message}` });
  }
});


app.post('/tweet/data', async (req, res) => {
  try {
    const response = await twitterService.userTwitterData(req.body);
    console.log('Save response:', response);

    if (response.success) {
      const { email, schedule } = req.body;
      const cronSchedule = parseSchedule(schedule);

      if (!cronSchedule) {
        return res.status(400).json({ success: false, message: 'Invalid schedule. Select between 1 to 6 hours.' });
      }

      // Stop existing cron job if any
      if (scheduledJobs[email]) {
        scheduledJobs[email].stop();
      }

      // Start new cron job
      scheduledJobs[email] = cron.schedule(cronSchedule, async () => {
        console.log(`🕒 Running scheduled tweet for ${email}`);
        await postTweet(email);
      });

      console.log(`✅ Cron job scheduled for ${email} every ${schedule} hours.`);
    }

    res.status(response.statusCode || 200).json(response);
  } catch (error) {
    console.error('❌ Error in /tweet/data endpoint:', error);
    res.status(500).json({ success: false, message: `❌ Error: ${error.message}` });
  }
});

// Start Server
const PORT = 4001;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));