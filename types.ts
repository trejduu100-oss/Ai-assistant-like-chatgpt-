import { Modality } from "@google/genai";

export type ModelProvider = 'Gemini';

export interface Model {
  id: string;
  name: string;
  provider: ModelProvider;
  vision: boolean;
  context: number; // in tokens
  speed: 'Fast' | 'Average' | 'Slow' | 'Varies';
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  image?: {
    base64: string;
    mimeType: string;
  };
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  modelId: string;
  createdAt: number;
}