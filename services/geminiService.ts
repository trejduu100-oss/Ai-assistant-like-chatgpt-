import { GoogleGenAI, Chat } from "@google/genai";
import { Message } from '../types';

// The API key is assumed to be pre-configured, valid, and accessible from the environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export async function* streamChatResponse(
  provider: string, // This parameter is now redundant but kept for interface consistency.
  modelId: string,
  history: Message[],
  prompt: string,
  image?: { base64: string; mimeType: string; }
): AsyncGenerator<string, void, unknown> {

  // All calls are now directed to Gemini. The mock response for other providers is removed.
  // The API_KEY is assumed to be present and valid as per guidelines, so no warning is needed.

  try {
    const geminiHistory = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));

    const chat: Chat = ai.chats.create({
      model: modelId,
      history: geminiHistory,
    });

    const messageParts: ({ text: string } | { inlineData: { data: string; mimeType: string; } })[] = [{ text: prompt }];

    if (image) {
      messageParts.unshift({
        inlineData: {
          data: image.base64,
          mimeType: image.mimeType
        }
      });
    }

    const result = await chat.sendMessageStream({
      message: messageParts
    });

    for await (const chunk of result) {
      yield chunk.text;
    }
  } catch (error) {
    console.error("Error streaming from Gemini:", error);
    yield "An error occurred while communicating with the Gemini API. Please check the console for details.";
  }
}