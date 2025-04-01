import { useEffect, useRef, useState } from "react";
import DataHooks from "@/functions/DataHooks";
import { useSelector } from "react-redux";
import { useAuth } from "@/context/AuthContext";

const useChat = (chatId, setChats, chats, client, connected, dispatch, connectedRef) => {
  const { data: chat, fetcherGet, fetcherPost } = DataHooks(dispatch, connectedRef);
  const useLoguer = useSelector((state) => state.user);
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState("");
  const [typingChats, setTypingChats] = useState({});
  const [hiddenStatuses, setHiddenStatuses] = useState({});
  const messagesEndRef = useRef(null); // Referencia para el último mensaje
  const [sentRepliedMessage, setSentRepliedMessage] = useState(null);
  const lastSentMessageRef = useRef(null);
  const marktMessageRef = useRef(true);
  const messagesRef = useRef(); // Guarda los mensajes
  const messageRefs = useRef({}); // Guarda los refs de los mensajes
  const chatsRef = useRef();
  const [visibleDropdowns, setVisibleDropdowns] = useState({});
  const chatNameref = useRef(null);
  const [highlightedMessage, setHighlightedMessage] = useState(null);
  const [participant, setParticipan] = useState(); 
    const { users } = useAuth();
  
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

          // ⏳ Si en 5 segundos no se confirma el mensaje, se marca como fallido
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

  const updateRepliedMessage = (message) => {
    setSentRepliedMessage(message);
  };

  useEffect(() => {
    markMessagesAsRead();
  }, []);

  useEffect(() => {
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
    messages.forEach((msg) => {
      if (msg.status === "SENT") {
        setTimeout(() => {
          setHiddenStatuses((prev) => ({ ...prev, [msg.id]: true }));
        }, 1000); // Oculta el estado después de 3s cuando cambia de "SENT"
      }
    });
  }, [messages]);

  useEffect(() => {
    messagesRef.current = messages;
    chatsRef.current = chats;
  }, [messages, chats]);

  useEffect(() => {
    fetcherGet(`/api/chats/${chatId}`);
  }, []);

  useEffect(() => {
    if (chat) {
      setMessages(chat.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
      setParticipan(chat.participants.find(u => u.id != useLoguer.id))
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
    setTypingChats
  };
};

export default useChat;
