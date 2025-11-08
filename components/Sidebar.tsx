
import React from 'react';
import { Chat } from '../types';
import { PlusIcon, SunIcon, MoonIcon, TrashIcon, EditIcon, DownloadIcon } from './icons';

interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, newTitle: string) => void;
  onExportChat: (id: string) => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  chats,
  activeChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onRenameChat,
  onExportChat,
  theme,
  onThemeToggle,
}) => {

  const handleRename = (id: string) => {
    const newTitle = prompt("Enter new chat title:");
    if (newTitle) {
      onRenameChat(id, newTitle);
    }
  };
  
  return (
    <div className="w-full h-full bg-light-sidebar dark:bg-dark-sidebar flex flex-col p-2 text-light-text-primary dark:text-dark-text-primary">
      <div className="flex-shrink-0 p-2">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-between p-2 rounded-md border border-light-border dark:border-dark-border hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
        >
          <span>New Chat</span>
          <PlusIcon className="w-5 h-5" />
        </button>
      </div>
      <nav className="flex-grow overflow-y-auto mt-4">
        <ul>
          {chats.sort((a,b) => b.createdAt - a.createdAt).map(chat => (
            <li key={chat.id} className="px-2 mb-1">
              <div className={`group flex items-center justify-between rounded-md transition-colors ${activeChatId === chat.id ? 'bg-indigo-500 text-white' : 'hover:bg-light-hover dark:hover:bg-dark-hover'}`}>
                <button onClick={() => onSelectChat(chat.id)} className="flex-grow text-left p-2 truncate">
                  {chat.title}
                </button>
                <div className={`flex-shrink-0 flex items-center gap-1 pr-2 ${activeChatId === chat.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <button onClick={() => handleRename(chat.id)} className="p-1 rounded hover:bg-white/20"><EditIcon className="w-4 h-4"/></button>
                    <button onClick={() => onExportChat(chat.id)} className="p-1 rounded hover:bg-white/20"><DownloadIcon className="w-4 h-4"/></button>
                    <button onClick={() => onDeleteChat(chat.id)} className="p-1 rounded hover:bg-white/20"><TrashIcon className="w-4 h-4"/></button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </nav>
      <div className="flex-shrink-0 p-2">
        <button
          onClick={onThemeToggle}
          className="w-full flex items-center justify-between p-2 rounded-md hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
        >
          <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
