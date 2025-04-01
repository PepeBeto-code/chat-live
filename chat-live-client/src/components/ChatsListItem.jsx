import React, { useCallback, useState } from "react";
import FormatearFecha from "./FormatearFecha";
import DropdownMenu from "./DropdownMenu";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import DataHooks from "../functions/DataHooks";

export default function ChatsListItem({ chat, children }) {
  const userLoguer = useSelector((state) => state.user);
  const { setChats, setIsLoading, typingChats, connectedRef } = useAuth();
  const dispatch = useDispatch();
  const { fetcherDeleted, fetcherPut, showConfirmationDialog } = DataHooks(
    dispatch,
    connectedRef
  );
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  const toggleArchived = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetcherPut(`/api/chat-user/${chat.id}/${userLoguer.id}/archived`, {
        value: !chat.archived,
      });
      setChats((prevChats) =>
        prevChats.map((c) =>
          c.id === chat.id ? { ...c, archived: !c.archived } : c
        )
      );
    } catch (error) {
      console.error("Error al cambiar estado de archivado:", error);
    } finally {
      setIsLoading(false);
    }
  }, [chat.id, chat.archived, userLoguer.id, fetcherPut, setChats]);

  const deletedChat = useCallback(async () => {
    showConfirmationDialog({
      confirmAction: async () => {
        setIsLoading(true);
        try {
          await fetcherDeleted(`/api/chat-user/${chat.id}/${userLoguer.id}`);
          setChats((prevChats) => prevChats.filter((c) => c.id !== chat.id));
          router.replace("/dashboard/home");
        } catch (error) {
          console.error("Error al eliminar chat:", error);
        } finally {
          setIsLoading(false);
        }
      },
    });
  }, [chat.id, userLoguer.id, fetcherDeleted, setChats, router]);

  const menuOptions = [
    {
      label: chat.archived ? "Desarchivar chat" : "Archivar chat",
      action: toggleArchived,
    },
    { label: "Eliminar chat", action: deletedChat, danger: true },
  ];

  return (
    <div
      className="chat-list__item"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onClick={() =>
        router.push(`/dashboard/chat/${chat.id}`, { shallow: true })
      }
    >
      {children ? (
        children
      ) : (
        <div className="chat-list__item-info">
          <span className="chat-list__item-name">{chat.name}</span>
          {chat.lastMessage && !typingChats[chat.id] && (
            <p className="chat-list__item-preview">
              {chat.lastMessage.content}
            </p>
          )}
          {typingChats[chat.id] && (
            <p className="chat-list__item-preview">
              {typingChats[chat.id]} está escribiendo...
            </p>
          )}
        </div>
      )}
      <div className="flex flex-col items-center">
        {chat.unreadMessages > 0 && (
          <div className="chat-list__item-unread">
            <span className="unread-badge">{chat.unreadMessages}</span>
          </div>
        )}
        {chat.lastMessage && (
          <FormatearFecha
            createdAt={chat.lastMessage.timestamp}
          ></FormatearFecha>
        )}
      </div>
      <div onClick={(event) => event.stopPropagation()}>
        <DropdownMenu
          icon={<ChevronDown />}
          options={menuOptions}
          isVisible={isVisible}
          setIsVisible={setIsVisible}
        />
      </div>
    </div>
  );
}
