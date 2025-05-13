import { useEffect, useRef, useState } from "react";
import DataHooks from "@/functions/DataHooks";
import { useSelector } from "react-redux";
import { useAuth } from "@/context/AuthContext";

/**
 * Hook personalizado para manejar la lógica del chat.
 *
 * @param {string} chatId - El ID del chat actual.
 * @param {Function} setChats - Función para actualizar la lista de chats.
 * @param {Array} chats - Lista de chats disponibles.
 * @param {Object} client - Cliente WebSocket o similar para enviar mensajes.
 * @param {boolean} connected - Indica si el cliente está conectado.
 * @param {Function} dispatch - Función para despachar acciones Redux.
 * @param {Object} connectedRef - Referencia para verificar el estado de conexión.
 *
 * @returns {Object} - Un objeto con diversas propiedades y funciones para interactuar con el chat.
 */
const useChat = (
  chatId,
  setChats,
  chats,
  client,
  connected,
  dispatch,
  connectedRef
) => {
  const {
    data: chat,
    fetcherGet,
    fetcherPost,
  } = DataHooks(dispatch, connectedRef);
  const useLoguer = useSelector((state) => state.user); // Obtiene el usuario autenticado
  const [messages, setMessages] = useState([]); // Estado para los mensajes del chat
  const [typingUser, setTypingUser] = useState(""); // Usuario que está escribiendo
  const [typingChats, setTypingChats] = useState({}); // Chats que están siendo escritos
  const [hiddenStatuses, setHiddenStatuses] = useState({}); // Mensajes cuyo estado "SENT" está oculto
  const messagesEndRef = useRef(null); // Referencia para el último mensaje,  usado para scroll automático
  const [sentRepliedMessage, setSentRepliedMessage] = useState(null); // Mensaje que está siendo respondido
  const lastSentMessageRef = useRef(null); // Referencia al último mensaje enviado
  const marktMessageRef = useRef(true); // Referencia para saber si se debe marcar el mensaje como leído
  const messagesRef = useRef(); // Referencia para guardar todos los mensajes
  const messageRefs = useRef({}); // Referencia para cada mensaje individual
  const chatsRef = useRef(); // Referencia para guardar todos los chats
  const [visibleDropdowns, setVisibleDropdowns] = useState({}); // Estados para dropdowns de opciones
  const chatNameref = useRef(null); // Referencia para almacenar el nombre del chat
  const [highlightedMessage, setHighlightedMessage] = useState(null); // Mensaje resaltado
  const [participant, setParticipan] = useState(); // Participante actual en el chat
  const { users } = useAuth(); // Hook para obtener la lista de usuarios

  // Marca los mensajes del chat como leídos si no han sido leídos aún
  const markMessagesAsRead = async () => {
    if (!chatsRef.current) return;

    const chat = chatsRef.current.find((ch) => ch.id == chatId);

    if (chat?.unreadMessages && chat?.unreadMessages != 0) {
      await fetcherPost("/api/chat-user/mark-as-read", {
        userId: useLoguer.id,
        chatId: chatId,
      });

      setChats((prevChats) =>
        prevChats.map((c) => {
          if (c.id === chatId) {
            return {
              ...c,
              unreadMessages: 0,
            };
          }
          return c;
        })
      );
    }
  };

  // Actualiza el estado de los mensajes a "SEEN" cuando se ven en el chat
  const updateStatusSeenMessages = () => {
    const msgIds = messagesRef.current
      .filter(
        (msg) =>
          (msg.senderId !== useLoguer.id ||
            chatNameref.current == useLoguer.username) &&
          (msg.status == "SENT" || msg.status == "DELIVERED")
      )
      .map((msg) => msg.id);
    if (msgIds.length !== 0) {
      client.publish({
        destination: `/app/chat/${chatId}/updateStatus/message`,
        body: JSON.stringify({
          messageIds: msgIds,
          newStatus: "SEEN",
        }),
      });
    }
  };

  // Envia un mensaje al chat
  const sendMessage = (message) => {
    const tempId = Date.now(); // ID temporal único para el mensaje

    const mensaje = {
      tempId: tempId,
      senderId: useLoguer.id,
      content: message,
    };

    setMessages((prevMessages) => [...prevMessages, mensaje]);
    lastSentMessageRef.current = mensaje; // Actualiza la ref

    if (client && connected) {
      client.publish({
        destination: `/app/chat/${chatId}`,
        body: JSON.stringify({
          senderId: useLoguer.id,
          content: message,
          repliedMessageId: sentRepliedMessage ? sentRepliedMessage.id : null,
        }),
      });

      // Si en 5 segundos no se confirma el mensaje, se marca como fallido
      setTimeout(() => {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.tempId && msg.tempId === tempId
              ? { ...msg, status: "FAILED" }
              : msg
          )
        );
      }, 5000);
    }
    setSentRepliedMessage(null);
  };

  // Función para resaltar mensaje y hacer scroll
  const highlightAndScrollToMessage = (msgId) => {
    const messageEl = messageRefs.current[msgId];
    if (messageEl) {
      messageEl.scrollIntoView({ behavior: "smooth", block: "center" });

      // Resaltar mensaje
      setHighlightedMessage(msgId);

      // Quitar resaltado después de 2 segundos
      setTimeout(() => setHighlightedMessage(null), 2000);
    }
  };

  // Muestra o oculta el dropdown de opciones de un mensaje
  const toggleDropdown = (msgId, isVisible) => {
    setVisibleDropdowns((prev) => ({
      ...prev,
      [msgId]: isVisible,
    }));
  };

  const setIsVisible = (msgId) => {
    return function (isVisible) {
      toggleDropdown(msgId, isVisible);
    };
  };

  // Actualiza el mensaje que se está respondiendo
  const updateRepliedMessage = (message) => {
    setSentRepliedMessage(message);
  };

  useEffect(() => {
    markMessagesAsRead();
  }, []);

  useEffect(() => {
    // Observa el último mensaje para actualizar el estado de "leído" y "visto"
    if (messages) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && marktMessageRef.current) {
            markMessagesAsRead();
            updateStatusSeenMessages();
            marktMessageRef.current = false;
          } else if (!entry.isIntersecting) {
            marktMessageRef.current = true; // Permitir marcar como visto nuevamente si el usuario deja de ver el último mensaje
          }
        },
        { threshold: 1.0 }
      );

      if (messagesEndRef.current) {
        observer.observe(messagesEndRef.current);
      }

      const currentMessagesEndRef = messagesEndRef.current;

      return () => {
        if (currentMessagesEndRef) observer.unobserve(currentMessagesEndRef);
      };
    }
  }, [messages, chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    marktMessageRef.current = true;
  }, [messages]);

  useEffect(() => {
    // Oculta el estado "SENT" después de un tiempo
    messages.forEach((msg) => {
      if (msg.status === "SENT") {
        setTimeout(() => {
          setHiddenStatuses((prev) => ({ ...prev, [msg.id]: true }));
        }, 1000); // Oculta el estado después de 3s cuando cambia de "SENT"
      }
    });
  }, [messages]);

  useEffect(() => {
    // Actualiza las referencias con los mensajes y chats actuales
    messagesRef.current = messages;
    chatsRef.current = chats;
  }, [messages, chats]);

  useEffect(() => {
    // Obtiene los datos del chat al cargar
    fetcherGet(`/api/chats/${chatId}`);
  }, []);

  useEffect(() => {
    if (chat) {
      setMessages(
        chat.messages.sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        )
      );
      setParticipan(chat.participants.find((u) => u.id != useLoguer.id));
      chatNameref.current = chat.name;
    }
  }, [chat]);

  useEffect(() => {
    if (users) {
      setParticipan(users.find((u) => u.id == participant?.id));
    }
  }, [users]);

  return {
    messages,
    setMessages,
    typingUser,
    setTypingUser,
    hiddenStatuses,
    setHiddenStatuses,
    sentRepliedMessage,
    setSentRepliedMessage,
    lastSentMessageRef,
    messagesRef,
    messageRefs,
    chatsRef,
    visibleDropdowns,
    chatNameref,
    highlightedMessage,
    messagesEndRef,
    setIsVisible,
    updateRepliedMessage,
    highlightAndScrollToMessage,
    sendMessage,
    chat,
    participant,
    typingChats,
    setTypingChats,
  };
};

export default useChat;
