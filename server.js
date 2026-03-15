import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// CORS configuration - allows requests from your Netlify domain
app.use(cors({
  origin: '*', // Allow all origins for now, can be restricted later
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));

app.use(express.json());

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ message: "Sehat-Saathi AI server running" });
});

// Main chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const { message, language } = req.body;

    // Validate input
    if (!message) {
      return res.status(400).json({
        reply: "Please provide a message."
      });
    }

    // Check if API key is set
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set");
      return res.status(500).json({
        reply: "AI service configuration error. Please try again later."
      });
    }

    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.0-flash"
    });

    const prompt = `You are Sehat-Saathi, an AI healthcare assistant for rural India.

Respond in ${language || "English"}.

Rules:
• Use simple language
• Give preventive health tips
• Encourage visiting a doctor for serious symptoms
• If the question is not health-related, politely redirect to health topics

User question:
${message}`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    res.json({ reply });

  } catch (error) {
    console.error("GENAI ERROR:", error.message);
    console.error("Full error:", error);

    res.status(500).json({
      reply: "AI service error. Please try again."
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    reply: "Server error. Please try again."
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
