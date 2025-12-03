// Defines backend interaction with LLM for Tiger Tix. Provides functionality to send structured
// prompts to model and receive AI generated responses. File serves as the communication layer between 
// backend logic and AI model to ensure consistent, machine readable responses that can be processed 
// by other parts of application.

//attempting to make compatable with Grok

const XAI_API_KEY = process.env.XAI_API_KEY;
const XAI_MODEL = process.env.XAI_MODEL || "grok-4-latest";

export const ollamaInteraction = async (prompt, opts = {}) => {
  if (!XAI_API_KEY) {
    throw new Error("XAI_API_KEY is not set in environment variables");
  }

  const systemInstruction = `You are an expert event planning assistant for our event booking platform, Tiger Tix. Your task is to PARSE
user input to extract structured information such as the specific event and the number of desired tickets.
Return ONLY a JSON object:
{
  "intent": "book" | "cancel" | "view",
  "event": "<event name>",
  "tickets": <number>
}`;

  const body = {
    model: XAI_MODEL,
    messages: [
      { role: "system", content: systemInstruction },
      { role: "user", content: prompt }
    ],
    temperature: 0,
    stream: false,
    max_tokens: 256
  };

  try {
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${XAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const msg = await response.text();
      console.error("xAI API error:", response.status, msg);
      throw new Error(msg);
    }

    const data = await response.json();
    console.log("grok.response:", JSON.stringify(data, null, 2));

    return data;
  } catch (err) {
    console.error("Error calling Grok:", err);
    throw err;
  }
};