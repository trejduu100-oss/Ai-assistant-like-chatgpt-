import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Chat, Message as MessageType, Model, ModelProvider } from '../types';
import { ALL_MODELS, DEFAULT_MODEL_ID } from '../constants';
import Message from './Message';
import ModelSelector from './ModelSelector';
import { streamChatResponse } from '../services/geminiService';
import { SendIcon, MicIcon, PaperclipIcon, XIcon } from './icons';

interface ChatViewProps {
  chat: Chat | null;
  onUpdateChat: (chat: Chat) => void;
  theme: 'light' | 'dark';
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });
};

const ChatView: React.FC<ChatViewProps> = ({ chat, onUpdateChat, theme }) => {
  const [prompt, setPrompt] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<{ file: File, preview: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null); // SpeechRecognition instance

  // State to track if SpeechRecognition API is available
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(false);
  // State to track if microphone permission has been explicitly granted
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [chat?.messages, isStreaming]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSpeechRecognitionSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setHasMicrophonePermission(true); // Confirmed permission
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setPrompt(prev => prev + transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setHasMicrophonePermission(false);
          alert('Microphone access was denied. Please enable it in your browser settings to use voice input.');
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      // Proactively check permission status on mount
      if (navigator.mediaDevices && (navigator.mediaDevices as any).permissions) { // Added null checks here
        (navigator.mediaDevices as any).permissions.query({ name: 'microphone' as PermissionName })
          .then((permissionStatus: PermissionStatus) => {
            if (permissionStatus.state === 'granted') {
              setHasMicrophonePermission(true);
            } else if (permissionStatus.state === 'denied') {
              setHasMicrophonePermission(false);
            }
            permissionStatus.onchange = () => {
              setHasMicrophonePermission(permissionStatus.state === 'granted');
            };
          })
          .catch((error: any) => {
            console.warn('Unable to query microphone permission:', error);
            setHasMicrophonePermission(false);
          });
      } else {
        console.warn('Permissions API or MediaDevices API not fully supported in this browser.');
        // If permissions API is not available, assume permission is needed upon first use.
        // setHasMicrophonePermission(false) is default, so no explicit action needed.
      }

    } else {
      setIsSpeechRecognitionSupported(false);
      console.warn('Speech Recognition API is not supported in this browser.');
    }
  }, []);

  const handleModelChange = (modelId: string) => {
    if (chat) {
      onUpdateChat({ ...chat, modelId });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedImage({ file, preview: URL.createObjectURL(file) });
    }
  };

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim() || !chat || isStreaming) return;

    const currentModel = ALL_MODELS.find(m => m.id === chat.modelId) || ALL_MODELS.find(m => m.id === DEFAULT_MODEL_ID)!;

    let imageForMessage: { base64: string; mimeType: string; } | undefined = undefined;
    if (uploadedImage && currentModel.vision) {
        imageForMessage = {
            base64: await fileToBase64(uploadedImage.file),
            mimeType: uploadedImage.file.type
        };
    }

    const userMessage: MessageType = { role: 'user', content: prompt.trim(), image: imageForMessage };
    const updatedMessages = [...chat.messages, userMessage];

    onUpdateChat({ ...chat, messages: updatedMessages });
    setPrompt('');
    setUploadedImage(null);
    setIsStreaming(true);

    let fullResponse = '';
    const responseStream = streamChatResponse(
      currentModel.provider,
      chat.modelId,
      chat.messages,
      prompt.trim(),
      imageForMessage,
    );

    for await (const chunk of responseStream) {
      fullResponse += chunk;
      onUpdateChat({
        ...chat,
        messages: [...updatedMessages, { role: 'model', content: fullResponse }],
      });
    }

    setIsStreaming(false);
  }, [prompt, chat, isStreaming, onUpdateChat, uploadedImage]);


  const toggleListening = useCallback(async () => {
    if (isStreaming) return; // Cannot listen while streaming

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    if (!isSpeechRecognitionSupported) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    // Request permission if not already granted
    if (!hasMicrophonePermission) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasMicrophonePermission(true);
      } catch (err: any) {
        console.error('Failed to get microphone access:', err);
        setHasMicrophonePermission(false); // Explicitly set to false on denial
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          alert('Microphone access was denied. Please enable it in your browser settings to use voice input.');
        } else {
          alert('Could not access your microphone. Please check your device settings.');
        }
        return; // Stop here if permission failed
      }
    }

    // Start recognition only if permission is granted
    if (hasMicrophonePermission) { // Check again after potential getUserMedia call
        recognitionRef.current?.start();
    }

  }, [isListening, isStreaming, isSpeechRecognitionSupported, hasMicrophonePermission]);


  if (!chat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-light-text-secondary dark:text-dark-text-secondary">
        <h1 className="text-2xl font-bold mb-2">OmniChat</h1>
        <p>Select a chat or start a new one to begin.</p>
      </div>
    );
  }

  const currentModel = ALL_MODELS.find(m => m.id === chat.modelId) || ALL_MODELS.find(m => m.id === DEFAULT_MODEL_ID)!;

  // Determine if mic button should be disabled and its title
  const isMicDisabled = isStreaming || !isSpeechRecognitionSupported || (isSpeechRecognitionSupported && !hasMicrophonePermission && !isListening);
  let micButtonTitle = 'Start voice input';
  if (isStreaming) {
      micButtonTitle = 'Cannot use microphone while AI is responding.';
  } else if (!isSpeechRecognitionSupported) {
      micButtonTitle = 'Speech recognition is not supported in this browser.';
  } else if (!hasMicrophonePermission) {
      micButtonTitle = 'Click to request microphone access.';
  } else if (isListening) {
      micButtonTitle = 'Stop listening';
  }

  return (
    <div className="flex-1 flex flex-col bg-light-main dark:bg-dark-main">
      <header className="flex-shrink-0 p-4 border-b border-light-border dark:border-dark-border w-full max-w-4xl mx-auto">
        <ModelSelector selectedModelId={chat.modelId} onModelChange={handleModelChange} />
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          {chat.messages.map((msg, index) => (
            <Message key={index} message={msg} theme={theme} isStreaming={isStreaming && index === chat.messages.length - 1} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>
      <footer className="flex-shrink-0 p-4 bg-light-main dark:bg-dark-main">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            {uploadedImage && currentModel.vision && (
              <div className="absolute bottom-full mb-2 bg-light-model-msg dark:bg-dark-model-msg p-2 rounded-lg">
                <img src={uploadedImage.preview} alt="upload preview" className="h-20 w-20 object-cover rounded-md" />
                <button onClick={() => setUploadedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><XIcon className="w-4 h-4" /></button>
              </div>
            )}
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Message OmniChat..."
              className="w-full p-3 pr-32 border border-light-border dark:border-dark-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-light-bg dark:bg-dark-bg text-light-text-primary dark:text-dark-text-primary"
              rows={1}
              disabled={isStreaming}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {currentModel.vision &&
                <>
                  <input type="file" id="file-upload" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  <label htmlFor="file-upload" className="p-2 rounded-full hover:bg-light-hover dark:hover:bg-dark-hover cursor-pointer">
                    <PaperclipIcon className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
                  </label>
                </>
              }
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2 rounded-full hover:bg-light-hover dark:hover:bg-dark-hover ${isListening ? 'bg-red-500 text-white' : ''} ${isMicDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isMicDisabled}
                title={micButtonTitle}
              >
                <MicIcon className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
              </button>
              <button type="submit" disabled={!prompt.trim() || isStreaming} className="p-2 rounded-full bg-indigo-500 text-white disabled:bg-indigo-300 disabled:cursor-not-allowed">
                <SendIcon className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </footer>
    </div>
  );
};

export default ChatView;