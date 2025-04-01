'use client'

import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArchiveRestore, MoveLeft  } from "lucide-react";
import ChatsListItem from './ChatsListItem';
import ChatSearch from './ChatSearch';
import { MessageCircleX } from 'lucide-react';

function ChatsList() {
  const { chats = []} = useAuth();
  const [view, setView] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const { chatsVisible, chatsArchived } = useMemo(() => ({
    chatsVisible: chats.filter(c => c.visible && !c.archived),
    chatsArchived: chats.filter(c => c.archived),
  }), [chats]);

  useEffect(() => {
    if (chatsArchived.length === 0) setView(true);
  }, [chatsArchived]);

  return (
    <div className="chat-list mt-2 h-full">
      <div className='mb-2 mt-3'>
        <ChatSearch chats={chats} setIsVisible={setIsVisible}></ChatSearch>
      </div>
      {
        isVisible && 
        <div>
          { 
          chatsArchived.length > 0 &&
            <div className="chat-list__item bg-transparent !justify-start"
                onClick={() => setView(!view)}>
            {view ? <ArchiveRestore /> : <MoveLeft />}
            <span className='pl-4'>Chats Archivados</span>
            </div>
          }
          {(view ? chatsVisible : chatsArchived).map(chat => (
            <ChatsListItem key={chat.id} chat={chat} />
          ))}
          {
            chatsArchived.length <= 0 && chatsVisible.length <= 0 && <div className='flex flex-col items-center justify-center w-full mt-6'>
              <MessageCircleX/>
              <p>No tienes chats aún.</p>
            </div>
          }
        </div>
      }
    </div>

  );
}

export default ChatsList;