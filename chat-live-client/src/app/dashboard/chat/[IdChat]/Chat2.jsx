"use client";

import React, { useState, useEffect, useRef } from "react";

import { Input, Button } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { usePathname } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import DataHooks from "../../../../functions/DataHooks";
import UserAvatar from "../../../../components/UserAvatar";
import { Spinner } from "reactstrap";
import FormatearFecha from "../../../../components/FormatearFecha";
import DropdownMenu from "../../../../components/DropdownMenu";
import { X, ChevronDown } from "lucide-react";
import ChatMessageSearch from "../../../../components/ChatMessageSearch";
import { slide as Menu } from "react-burger-menu";
import { Search } from "lucide-react";
import useClickOutside from "@/hooks/useClickOutside";

const Chat2 = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const dispatch = useDispatch();
  const [hiddenStatuses, setHiddenStatuses] = useState({});
  let typingTimeout; // Variable para el temporizador de inactividad
  const {
    subscribeToChannel,
    client,
    connected,
    unsubscribeFromChannel,
    setChats,
    chats,
    connectedRef,
  } = useAuth();
  const {
    data: chat,
    fetcherGet,
    fetcherPost,
  } = DataHooks(dispatch, connectedRef);
  const useLoguer = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const paths = usePathname().split("/");
  const pathname = paths.pop();
  const chatId = Number(pathname);
  const messagesEndRef = useRef(null); // Referencia para el último mensaje
  const [typingUser, setTypingUser] = useState("");
  const [sentRepliedMessage, setSentRepliedMessage] = useState(null);
  const lastSentMessageRef = useRef(null);
  const marktMessageRef = useRef(true);
  const messagesRef = useRef();
  const messageRefs = useRef({}); // Guarda los refs de los mensajes
  const chatsRef = useRef();
  const [visibleDropdowns, setVisibleDropdowns] = useState({});
  const menf = useRef(null);
  const chatNameref = useRef(null);
  const [highlightedMessage, setHighlightedMessage] = useState(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleStateChange = (state) => {
    setIsMenuOpen(state.isOpen);
  };

  useClickOutside(menf, () => setIsMenuOpen(false)); // Se cerrará si se hace clic fuera

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
    console.log("mensajid¿: ", message);
    setSentRepliedMessage(message);
  };

  const [paddingValues, setPaddingValues] = useState({}); // Estado para almacenar el padding de cada mensaje
  const refs = useRef({}); // Refs para cada icono de estado

  // useEffect(() => {
  //   const newPaddingValues = {};
  //   messages.forEach((msg) => {
  //     const span = refs.current[msg.id];
  //     if (span) {
  //       newPaddingValues[msg.id] = span.offsetWidth - 8; // Agrega margen de 8px
  //     }
  //   });
  //   setPaddingValues(newPaddingValues);
  // }, [messages]); // Se actualiza cuando cambian los mensajes

  const markMessagesAsRead = async () => {
    if (!chatsRef.current) return;

    const chat = chatsRef.current.find((ch) => ch.id == chatId);

    if (chat.unreadMessages && chat.unreadMessages != 0) {
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
    markMessagesAsRead();
  }, []);

  useEffect(() => {
    if (connected && token) {
      const fun1 = (message) => {
        const mensaje = JSON.parse(message.body);

        setMessages((prev) => {
          const msgIndex = prev.findIndex(
            (msg) =>
              msg.content === mensaje.content &&
              msg.senderId === mensaje.senderId &&
              !msg.id
          );

          if (msgIndex !== -1) {
            // Reemplaza el mensaje existente con el que llega del servidor
            const newMessages = [...prev];
            newMessages[msgIndex] = mensaje;
            return newMessages;
          } else {
            // Añade el nuevo mensaje
            return [...prev, mensaje];
          }
        });
      };

      subscribeToChannel(`/topic/messages/${chatId}`, fun1);

      const fun2 = (message) => {
        const mensaje = JSON.parse(message.body);
        console.log(`📝 El usuario ${mensaje.nombre} está escribiendo...`);
        if (mensaje.nombre != useLoguer.username) {
          setTypingUser(mensaje.nombre);
          clearTimeout(typingTimeout);
          typingTimeout = setTimeout(() => {
            setTypingUser("");
          }, 2000);
        }
      };

      subscribeToChannel(`/topic/chat/${chatId}/typing`, fun2);

      const fun3 = (message) => {
        const updatedMessages = JSON.parse(message.body);
        setMessages((prev) =>
          prev.map((msg) => {
            const msgUdt = updatedMessages.find(
              (message) => message.id === msg.id
            );
            return msgUdt ? msgUdt : msg;
          })
        );
      };

      subscribeToChannel(`/topic/chat/${chatId}/updateStatus/message`, fun3);

      return () => {
        unsubscribeFromChannel(`/topic/messages/${chatId}`, fun1);
        unsubscribeFromChannel(`/topic/chat/${chatId}/typing`, fun2);
        unsubscribeFromChannel(
          `/topic/chat/${chatId}/updateStatus/message`,
          fun3
        );
      };
    }
  }, [connected]);

  useEffect(() => {
    fetcherGet(`/api/chats/${chatId}`);
  }, []);

  useEffect(() => {
    if (chat) {
      setMessages(chat.messages);
      chatNameref.current = chat.name;
    }
  }, [chat]);

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

      return () => {
        if (messagesEndRef.current) observer.unobserve(messagesEndRef.current);
      };
    }
  }, [messages, chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    marktMessageRef.current = true;
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();

    const mensaje = {
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
    }
    setSentRepliedMessage(null);
    setMessage("");
  };

  if (!useLoguer) {
    return;
  }

  return (
    <div className="mx-auto shadow rounded-lg chat">
      <div className="chat__header">
        <UserAvatar imageSrc={useLoguer.img}></UserAvatar>
        {chat && useLoguer && <h1 className="chat__title">{chat.name}</h1>}
      </div>
      <div className="chat__messages">
        {messages.map((msg, index) => {
          const isSentByUser = msg.senderId === useLoguer.id;
          const repliedMessage = msg.repliedMessageId
            ? messages.find((m) => m.id === msg.repliedMessageId)
            : null; // Busca el mensaje original si es una respuesta

          const setIsVisibleMs = setIsVisible(msg.id);

          return (
            <div
              key={index}
              ref={(el) => (messageRefs.current[msg.id] = el)} // Guarda el ref del mensaje
              className={`chat__message ${
                isSentByUser ? "chat__message--sent" : "chat__message--received"
              }`}
            >
              <div
                className={`chat__text ${
                  highlightedMessage === msg.id
                    ? "chat__message--highlighted"
                    : ""
                }`}
                onMouseEnter={() => setIsVisibleMs(true)}
                onMouseLeave={() => setIsVisibleMs(false)}
              >
                {repliedMessage && (
                  <div
                    className="chat__replied-message cursor-pointer"
                    onClick={() =>
                      highlightAndScrollToMessage(repliedMessage.id)
                    }
                  >
                    <p className="chat__replied-text">
                      <strong>
                        {repliedMessage.senderId === useLoguer.id
                          ? "Tú"
                          : "Usuario"}
                      </strong>
                      : {repliedMessage.content}
                    </p>
                  </div>
                )}

                <div
                  className="flex justify-between mb-[0.3rem]"
                  // style={{ paddingRight: `${paddingValues[msg.id] || 0}px` }} // Aplica el padding dinámico
                >
                  <p className="text-start pr-8">{msg.content}</p>
                  {isSentByUser ? (
                    <DropdownMenu
                      icon={<ChevronDown />}
                      setIsVisible={setIsVisibleMs}
                      isVisible={visibleDropdowns[msg.id]}
                      options={[
                        {
                          label: "Responder",
                          action: updateRepliedMessage,
                          params: [msg],
                        },
                        {
                          label: "Eliminar",
                          action: updateRepliedMessage,
                          params: [msg],
                        },
                      ]}
                    />
                  ) : (
                    <DropdownMenu
                      icon={<ChevronDown />}
                      right={false}
                      setIsVisible={setIsVisibleMs}
                      isVisible={visibleDropdowns[msg.id]}
                      options={[
                        {
                          label: "Responder",
                          action: updateRepliedMessage,
                          params: [msg],
                        },
                      ]}
                    />
                  )}
                </div>

                {isSentByUser && (
                  <span
                    // ref={(el) => (refs.current[msg.id] = el)}
                    className={`chat__status-icon ${
                      msg.status === "SENT"
                        ? "sent"
                        : msg.status === "DELIVERED"
                        ? "delivered"
                        : msg.status === "SEEN"
                        ? "seen"
                        : ""
                    }`}
                  >
                    {msg.timestamp && (
                      <span>
                        <FormatearFecha
                          createdAt={msg.timestamp}
                        ></FormatearFecha>
                      </span>
                    )}
                    {msg.status === "SENT"
                      ? "✔"
                      : msg.status === "DELIVERED"
                      ? "✔✔"
                      : msg.status === "SEEN"
                      ? "✔✔"
                      : null}
                  </span>
                )}

                {!isSentByUser && (
                  <span className={`chat__status-icon`}>
                    {msg.timestamp && (
                      <span>
                        <FormatearFecha
                          createdAt={msg.timestamp}
                        ></FormatearFecha>
                      </span>
                    )}
                  </span>
                )}
              </div>

              {isSentByUser && (
                <div className="chat__status">
                  {!msg.status ? (
                    <Spinner size="sm" color="light" />
                  ) : msg.status === "SENT" && !hiddenStatuses[msg.id] ? (
                    <span className="chat__status-text">Enviado</span>
                  ) : null}
                </div>
              )}
            </div>
          );
        })}

        <div ref={messagesEndRef}></div>
      </div>

      {/* Mostrar quién está escribiendo */}
      {typingUser && (
        <div
          style={{ color: "#999", fontStyle: "italic", textAlign: "center" }}
        >
          {typingUser} está escribiendo...
        </div>
      )}

      {sentRepliedMessage && (
        <div className="chat__replied">
          <div
            className="chat__replied-message"
            style={{
              backgroundColor: "var(--bg-primary)",
              width: "95%",
              borderLeft: "4px solid var(--border-color)",
              borderRadius: "5px",
            }}
          >
            <p className="chat__replied-text">
              <strong>
                {sentRepliedMessage.senderId === useLoguer.id
                  ? "Tú"
                  : "Usuario"}
              </strong>
              : {sentRepliedMessage.content}
            </p>
          </div>
          <div
            className="chat__replied-close"
            onClick={() => setSentRepliedMessage(null)}
          >
            <X />
          </div>
        </div>
      )}

      <div className="chat__input">
        <Input
          className="chat__field"
          type="text"
          value={message}
          // onFocus={() => markMessagesAsRead()}
          onChange={(e) => {
            if (client && connected) {
              client.publish({
                destination: `/app/chat/${chatId}/typin`,
              });
            }

            clearTimeout(typingTimeout);

            // Establecemos un nuevo temporizador para desaparecer el mensaje de "está escribiendo"
            typingTimeout = setTimeout(() => {
              setTypingUser(""); // Restablecer el estado de quien está escribiendo después de 2 segundos
            }, 2000); // 2 segundos de inactividad

            setMessage(e.target.value);
          }}
          placeholder="Escribe un mensaje..."
        />
        <Button
          className="chat__send-button"
          onClick={(e) => sendMessage(e)}
          disabled={!connected}
        >
          Enviar
        </Button>
      </div>
      <div ref={menf}>
        <Menu
          right
          isOpen={isMenuOpen}
          onStateChange={handleStateChange}
          customBurgerIcon={<Search></Search>}
          width={"30rem"}
        >
          <h1 tabIndex="-1" style={{ padding: "1.2em 0.8em" }}>
            Buscar Mensajes
          </h1>
          <ChatMessageSearch
            messages={messages}
            onSelectMessage={highlightAndScrollToMessage}
          />
        </Menu>
      </div>
    </div>
  );
};

export default Chat2;
