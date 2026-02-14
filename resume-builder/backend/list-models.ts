import { config } from "dotenv";

config();

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("Error: GEMINI_API_KEY not found in .env file.");
  process.exit(1);
}

async function listModels() {
  console.log(`Fetching models for API Key: ${API_KEY!.slice(0, 5)}...`);
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status} ${response.statusText}`,
      );
    }
    const data = (await response.json()) as any;

    console.log("\n=== Available Gemini Models ===");
    if (data.models) {
      // Filter for generateContent support
      const contentModels = data.models.filter((m: any) =>
        m.supportedGenerationMethods?.includes("generateContent"),
      );

      contentModels.forEach((model: any) => {
        // model.name usually looks like "models/gemini-1.5-flash"
        console.log(`ID: ${model.name.replace("models/", "")}`);
        console.log(`Name: ${model.displayName}`);
        console.log(`-----------------------------------`);
      });

      if (contentModels.length === 0) {
        console.log("No models found that support 'generateContent'");
      }
    } else {
      console.log("No models found in response:", data);
    }
  } catch (error) {
    console.error("Failed to list models:", error);
  }
}

listModels();
