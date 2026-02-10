import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";

config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function listModels() {
  try {
    const models = await genAI.listModels();
    console.log("Available Gemini Models:");
    models.models.forEach((m) => {
      console.log(`- ${m.name} (${m.displayName})`);
      console.log(
        `  Supported Actions: ${m.supportedGenerationMethods.join(", ")}`,
      );
    });
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();
