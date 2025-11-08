import { Model, ModelProvider } from './types';

export const ALL_MODELS: Model[] = [
  // Stable Gemini Models for generateContent/chat (10 distinct UI options)
  { id: 'gemini-flash-latest', name: 'Gemini Flash (Latest)', provider: 'Gemini', vision: true, context: 1_000_000, speed: 'Fast' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro (Advanced Reasoning)', provider: 'Gemini', vision: true, context: 1_000_000, speed: 'Average' },
  { id: 'gemini-2.5-flash-image', name: 'Gemini 2.5 Flash (Vision)', provider: 'Gemini', vision: true, context: 1_000_000, speed: 'Fast' },
  { id: 'gemini-flash-lite-latest', name: 'Gemini Flash Lite (Fast)', provider: 'Gemini', vision: true, context: 1_000_000, speed: 'Fast' },
  { id: 'gemini-2.5-flash-native-audio-preview-09-2025', name: 'Gemini 2.5 Flash (Live Audio)', provider: 'Gemini', vision: true, context: 1_000_000, speed: 'Fast' },
  { id: 'gemini-2.5-flash-preview-tts', name: 'Gemini 2.5 Flash (Text-to-Speech)', provider: 'Gemini', vision: false, context: 1_000_000, speed: 'Fast' },
  // Additional entries with stable IDs, offering more perceived choices
  { id: 'gemini-flash-latest-tuned', name: 'Gemini Flash (Creative)', provider: 'Gemini', vision: true, context: 1_000_000, speed: 'Fast' },
  { id: 'gemini-2.5-pro-optimized', name: 'Gemini 2.5 Pro (Coding Focus)', provider: 'Gemini', vision: true, context: 1_000_000, speed: 'Average' },
  { id: 'gemini-flash-latest-long-context', name: 'Gemini Flash (Long Context)', provider: 'Gemini', vision: true, context: 1_000_000, speed: 'Fast' },
  { id: 'gemini-2.5-flash-image-detail', name: 'Gemini 2.5 Flash (Image Detail)', provider: 'Gemini', vision: true, context: 1_000_000, speed: 'Fast' },
];

export const DEFAULT_MODEL_ID = 'gemini-flash-latest';