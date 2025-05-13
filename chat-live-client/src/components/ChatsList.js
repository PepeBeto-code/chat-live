"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ArchiveRestore, MoveLeft } from "lucide-react";
import ChatsListItem from "./ChatsListItem";
import ChatSearch from "./ChatSearch";
import { MessageCircleX } from "lucide-react";

/**
 * Componente ChatsList
 * Renderiza la lista de chats del usuario, incluyendo:
 * - Chats visibles y no archivados
 * - Chats archivados
 * - Barra de búsqueda de chats
 * - Alternancia entre chats activos y archivados
 */
function ChatsList() {
  const { chats = [] } = useAuth();
  const [view, setView] = useState(true); // true: ver chats visibles, false: ver archivados
  const [isVisible, setIsVisible] = useState(true); // Controla si se muestra el contenido de la lista

  /**
   * Separar los chats en visibles y archivados usando useMemo
   * Se recalcula solo cuando 'chats' cambia.
   */
  const { chatsVisible, chatsArchived } = useMemo(
    () => ({
      chatsVisible: chats.filter((c) => c.visible && !c.archived),
      chatsArchived: chats.filter((c) => c.archived),
    }),
    [chats]
  );

  /**
   * Siempre que no haya chats archivados, se forza la vista de chats visibles.
   */
  useEffect(() => {
    if (chatsArchived.length === 0) setView(true);
  }, [chatsArchived]);

  return (
    <div className="chat-list mt-2 h-full">
      {/* Componente de búsqueda de chats */}
      <div className="mb-2 mt-3">
        <ChatSearch chats={chats} setIsVisible={setIsVisible}></ChatSearch>
      </div>

      {/* Renderizado condicional de la lista de chats según la visibilidad */}
      {isVisible && (
        <div>
          {/* Botón para alternar entre chats visibles y archivados (si hay archivados) */}
          {chatsArchived.length > 0 && (
            <div
              className="chat-list__item bg-transparent !justify-start"
              onClick={() => setView(!view)}
              aria-pressed={!view}
              aria-label={
                view ? "Ver chats archivados" : "Volver a chats activos"
              }
            >
              {view ? (
                <ArchiveRestore aria-hidden="true" />
              ) : (
                <MoveLeft aria-hidden="true" />
              )}
              <span className="pl-4">Chats Archivados</span>
            </div>
          )}

          {/* Muestra la lista de chats: visibles o archivados según el estado 'view' */}
          <div role="list" aria-live="polite" aria-label="Lista de chats">
            {(view ? chatsVisible : chatsArchived).map((chat) => (
              <ChatsListItem key={chat.id} chat={chat} />
            ))}
          </div>

          {/* Mensaje de estado cuando no hay chats disponibles */}
          {chatsArchived.length <= 0 && chatsVisible.length <= 0 && (
            <div
              role="status"
              aria-live="polite"
              className="flex flex-col items-center justify-center w-full mt-6"
            >
              <MessageCircleX />
              <p>No tienes chats aún.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ChatsList;
