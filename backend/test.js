// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const { TwitterApi } = require('twitter-api-v2');
// const { initializeAgentExecutorWithOptions, OpenApiToolkit } = require("langchain/agents");
// const { Tool, DynamicTool } = require("langchain/tools");
// const { ChatOpenAI } = require('@langchain/openai');
// const config = require('./config');
// const app = express();

// app.use(express.json());
// app.use(cors({ origin: "http://localhost:3000", credentials: true }));
// // OpenAI Model
// const openai = new ChatOpenAI({ 
//   model: "gpt-4",
//   temperature: 0.4,
//   maxTokens: 2000,
//   timeout: undefined,
//   maxRetries: 2,
//   apiKey: config.GPT_CHAT_KEY});

// // Twitter API Setup
// const twitterClient = new TwitterApi({
//   appKey: '8a2yBKEJPz9Sh2ZodpcXM4cZi',
//   appSecret: 'I95bdABZiLM8F4RsKtdt4fbwdwgmEmvMs8nigPGn6XiR3gkBFz',
//   accessToken: '1872884586834771968-J347y239eDmGpdkjb4aOnSPf0taMJu',
//   accessSecret: 'CZbAs4GFtaasFqlZKjpzx7YAcmLDRMGWclqU294uB0DtI'
// });

// // Function to Post a Tweet

// const postTweet = async (text) => {
//   try {
//       await twitterClient.v2.tweet(text);
//       return "✅ Your tweet has been posted successfully!";
//   } catch (error) {
//       return `❌ Error: ${error.message}`;
//   }
// };

// // Function to Fetch Latest Tweets
// const getLatestTweets = async (username, count = 5) => {
//   try {
//       const user = await twitterClient.v2.userByUsername(username);
//       const tweets = await twitterClient.v2.userTimeline(user.data.id, { max_results: count });
//       return tweets.data.map(tweet => tweet.text);
//   } catch (error) {
//       return `❌ Error: ${error.message}`;
//   }
// };

// // Twitter Selection Tool (First Ask What to Do)
// const twitterSelectionTool = new DynamicTool({
//   name: "TwitterSelection",
//   func: async () => {
//       return `📢 What would you like to do?\n\n
//       - ** Post a tweet** (Example: *"I love AI!"*)\n
//       - ** Get latest tweets** (Example: *"Show latest tweets from @OpenAI"*)\n\n
//       `;
//   },
//   description: "When the user asks about Twitter, this prompts them to choose an action before proceeding."
// });


// // Twitter Post Tool
// const tweetTool = new DynamicTool({
//   name: "PostTweet",
//   func: postTweet,
//   description: "Posts tweets. Input should be the tweet text.",
// });

// // Twitter Fetch Tool
// const getTweetsTool = new DynamicTool({
//   name: "GetLatestTweets",
//   func: getLatestTweets,
//   description: "Fetches the latest tweets from a specified user. Input should be the Twitter username.",
// });

// // General Chat Tool (Handles Everything Else)
// const generalChatTool = new DynamicTool({
//   name: "GeneralChat",
//   func: async (query) => {
//       const response = await openai.call(query);
//       return response.text;
//   },
//   description: "Handles general chat queries, including Q&A, fun facts, and conversations."
// });

// // Greeting Tool (First Time Users)
// const greetingTool = new DynamicTool({
//   name: "WelcomeUser",
//   func: async () => {
//       return `👋 Hi! Welcome to the AI Chatbot.\n\nHere’s what I can do:\n
//       - **Use Twitter** (post tweets, get tweet details)\n
//       - **Chat with me** (ask me anything, jokes, science, history)`;
//   },
//   description: "Responds to greetings and provides general chatbot instructions."
// });

// // Initialize LangChain Agent
// const initializeAgent = async () => {
//   return await initializeAgentExecutorWithOptions(
//       [greetingTool, twitterSelectionTool, generalChatTool, tweetTool, getTweetsTool], // All tools included
//       openai,
//       { agentType: "zero-shot-react-description", verbose: true }
//   );
// };

// // Chat Endpoint (Handles Everything Dynamically)
// app.post('/chat', async (req, res) => {
//   const { message } = req.body;
//   console.log(`User Message: ${message}`);

//   try {
//       const agent = await initializeAgent();
//       const response = await agent.call({ input: message });
//       res.json({ response: response.output });

//   } catch (error) {
//       res.status(500).json({ response: "❌ Error processing request" });
//   }
// });

// app.listen(3001, () => console.log("Backend running on http://localhost:3001"));