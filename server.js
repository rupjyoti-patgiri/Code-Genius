// server.js

// 1. Import required packages
require('dotenv').config(); // Loads variables from .env into process.env
const express = require('express');

// 2. Initialize Express app
const app = express();
const port = process.env.PORT || 3000; // Use PORT from .env or default to 3000

// 3. Get your secrets from the .env file
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = process.env.MODEL_NAME;

// 4. Set up middleware
app.use(express.json()); // To parse JSON bodies from requests
app.use(express.static('public')); // To serve your HTML, CSS, and client-side JS from the 'public' folder

// 5. Create the API endpoint that the browser will call
app.post('/api/ask', async (req, res) => {
    try {
        const { question } = req.body; // Get the question from the browser's request

        if (!question) {
            return res.status(400).json({ error: 'Question is required.' });
        }

        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;

        const systemInstructionText = "You are a world-class coding expert named Code Genius. Your sole purpose is to answer coding-related questions with clarity, accuracy, and well-formatted code examples. If a user asks a non-coding question, politely guide them back by saying something like, 'My expertise is in the world of code. How can I help you with programming?' Provide answers in Markdown, and use code fences for all code snippets.";
        
        const geminiResponse = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: question }] }],
                systemInstruction: { parts: [{ text: systemInstructionText }] }
            }),
        });

        if (!geminiResponse.ok) {
            const errorData = await geminiResponse.json();
            throw new Error(errorData.error.message);
        }

        const data = await geminiResponse.json();
        const answer = data.candidates[0]?.content?.parts[0]?.text;
        
        // Send the answer back to the browser
        res.json({ answer });

    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 6. Start the server
app.listen(port, () => {
    console.log(`✅ Server is running at http://localhost:${port}`);
});