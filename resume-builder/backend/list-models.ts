import * as dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

async function listModels() {
  console.log("Fetching available models...\n");

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
    );

    if (!response.ok) {
      console.error("Error:", response.status, response.statusText);
      const text = await response.text();
      console.error(text);
      return;
    }

    const data = await response.json();

    console.log("Available Gemini Models:");
    console.log("========================\n");

    data.models?.forEach((model: any) => {
      if (model.name.includes("gemini")) {
        console.log(`Name: ${model.name}`);
        console.log(`  Display: ${model.displayName}`);
        console.log(
          `  Methods: ${model.supportedGenerationMethods?.join(", ")}`,
        );
        console.log("");
      }
    });
  } catch (error) {
    console.error("Error fetching models:", error);
  }
}

listModels();
