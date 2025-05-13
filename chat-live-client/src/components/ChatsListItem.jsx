import React, { useCallback, useState } from "react";
import FormatearFecha from "./FormatearFecha";
import DropdownMenu from "./DropdownMenu";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import DataHooks from "../functions/DataHooks";

/**
 * Componente que representa un ítem en la lista de chats.
 * Muestra información básica del chat, y permite acciones como archivar/desarchivar o eliminar.
 * También muestra el número de mensajes no leídos y el estado de escritura en tiempo real.
 *
 * Props:
 * - chat: Objeto con los datos del chat actual.
 * - children: Contenido personalizado opcional que puede sustituir el contenido por defecto.
 */
export default function ChatsListItem({ chat, children }) {
  const userLoguer = useSelector((state) => state.user); // Usuario logueado desde Redux
  const { setChats, setIsLoading, typingChats, connectedRef, setOpenMenu } =
    useAuth(); // Funciones y estado global desde el contexto de autenticación

  const dispatch = useDispatch();
  const router = useRouter();

  // Hook personalizado que devuelve funciones para actualizar/eliminar datos y mostrar diálogos
  const { fetcherDeleted, fetcherPut, showConfirmationDialog } = DataHooks(
    dispatch,
    connectedRef
  );
  const [isVisible, setIsVisible] = useState(false); // Controla visibilidad del menú desplegable

  /**
   * Alterna el estado de archivado del chat (archivar/desarchivar)
   */
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

  /**
   * Muestra un diálogo de confirmación para eliminar el chat.
   * Si se confirma, elimina el chat de la base de datos y del estado local.
   */
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

  // Opciones del menú contextual (archivar o eliminar chat)
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
      role="link"
      tabIndex={0}
      aria-label={`Abrir chat con ${chat.name}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setOpenMenu(false);
          router.push(`/dashboard/chat/${chat.id}`, { shallow: true });
        }
      }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onClick={() => {
        setOpenMenu(false);
        router.push(`/dashboard/chat/${chat.id}`, { shallow: true });
      }}
    >
      {/* Renderiza contenido personalizado si se pasa como children, si no, muestra info del chat */}
      {children ? (
        children
      ) : (
        <div className="chat-list__item-info">
          <span className="chat-list__item-name">{chat.name}</span>
          {/* Muestra el último mensaje o el estado de escritura en tiempo real */}
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

      {/* Muestra número de mensajes no leídos y la fecha del último mensaje */}
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

      {/* Menú contextual con opciones (archivar / eliminar) */}
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
