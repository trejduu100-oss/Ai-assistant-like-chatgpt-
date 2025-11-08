
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import { Chat } from './types';
import { DEFAULT_MODEL_ID } from './constants';
import { MenuIcon, XIcon } from './components/icons';

const App: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>(() => {
    try {
      const savedChats = localStorage.getItem('omnichat_chats');
      return savedChats ? JSON.parse(savedChats) : [];
    } catch (error) {
      console.error("Failed to parse chats from localStorage", error);
      return [];
    }
  });

  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('omnichat_theme');
    return (savedTheme === 'dark' || (savedTheme === null && window.matchMedia('(prefers-color-scheme: dark)').matches)) ? 'dark' : 'light';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    localStorage.setItem('omnichat_chats', JSON.stringify(chats));
  }, [chats]);
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('omnichat_theme', theme);
  }, [theme]);
  
  const handleNewChat = useCallback(() => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      modelId: DEFAULT_MODEL_ID,
      createdAt: Date.now(),
    };
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
  }, []);

  const handleUpdateChat = useCallback((updatedChat: Chat) => {
    setChats(prevChats => prevChats.map(c => (c.id === updatedChat.id ? updatedChat : c)));
  }, []);

  const handleDeleteChat = (id: string) => {
    setChats(prev => prev.filter(c => c.id !== id));
    if (activeChatId === id) {
      setActiveChatId(null);
    }
  };

  const handleRenameChat = (id: string, newTitle: string) => {
    setChats(prev => prev.map(c => c.id === id ? {...c, title: newTitle} : c));
  };
  
  const handleExportChat = (id: string) => {
    const chat = chats.find(c => c.id === id);
    if (!chat) return;

    const content = chat.messages.map(msg => `${msg.role.toUpperCase()}:\n${msg.content}`).join('\n\n---\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chat.title.replace(/ /g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const activeChat = chats.find(c => c.id === activeChatId) || null;

  return (
    <div className="h-screen w-screen flex antialiased text-light-text-primary dark:text-dark-text-primary overflow-hidden">
      <div className={`absolute top-2 left-2 z-20 md:hidden`}>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-md bg-light-main/80 dark:bg-dark-main/80 backdrop-blur-sm">
          {isSidebarOpen ? <XIcon className="w-6 h-6"/> : <MenuIcon className="w-6 h-6"/>}
        </button>
      </div>

      <aside className={`absolute md:relative z-10 h-full transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 w-64 md:w-72 flex-shrink-0`}>
        <Sidebar
          chats={chats}
          activeChatId={activeChatId}
          onNewChat={handleNewChat}
          onSelectChat={id => setActiveChatId(id)}
          onDeleteChat={handleDeleteChat}
          onRenameChat={handleRenameChat}
          onExportChat={handleExportChat}
          theme={theme}
          onThemeToggle={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
        />
      </aside>

      <div className="flex-1 flex flex-col">
        <ChatView chat={activeChat} onUpdateChat={handleUpdateChat} theme={theme} />
      </div>
    </div>
  );
};

export default App;
