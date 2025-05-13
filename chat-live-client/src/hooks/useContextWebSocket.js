import { useState, useRef, useEffect } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { apiUrl } from "@/Variables/ApiVariables.mjs";

/**
 * Hook personalizado para manejar la conexión WebSocket con STOMP y SockJS.
 * Permite suscripción dinámica a canales y gestión de mensajes entrantes.
 *
 * @param {string} token - Token JWT de autenticación.
 * @param {function} fetcherPut - Función para hacer peticiones PUT.
 * @param {Array} chatsSubscribe - Lista de chats a los que suscribirse.
 * @param {object} userLoguer - Usuario logueado.
 * @param {React.MutableRefObject} chatsRef - Referencia mutable al estado de los chats.
 * @param {function} setChats - Función para actualizar el estado de los chats.
 * @returns {object} - Contiene estado de conexión, funciones de suscripción y desconexión.
 */
const useContextWebSocket = (
  token,
  fetcherPut,
  chatsSubscribe,
  userLoguer,
  chatsRef,
  setChats
) => {
  const [client, setClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [typingChats, setTypingChats] = useState({});
  const subscribersRef = useRef({});

  /**
   * Suscribe a canales de WebSocket según los chats activos
   */
  useEffect(() => {
    if (!client || !connected || !chatsSubscribe) return;

    if (client.connected) {
      console.log(" Nos suscribimos", client);

      // Suscripción al estado de usuarios activos
      const subscription1 = client.subscribe("/topic/users", (userActive) => {
        const user = JSON.parse(userActive.body);
        if (user.id == userLoguer.id) {
          dispatch(
            setUser({
              ...userLoguer,
              active: user.active,
            })
          );
        }

        setUsers((prev) => [user, ...prev.filter((u) => u.id != user.id)]);
      });

      // Suscripciones por chat
      const subscriptions = chatsSubscribe?.map((chat) => {
        const functionSubcription01 = (message) => {
          // Aquí se actualiza el contador de chats no leidos del usuario
          const unreadMessages = JSON.parse(message.body).find(
            (urm) => urm.userId == userLoguer.id
          );

          chatsRef.current = chatsRef.current.map((c) => {
            if (c.id === chat.id) {
              return {
                ...c,
                unreadMessages: unreadMessages.unreadMessages,
              };
            }
            return c;
          });

          setChats(chatsRef.current);
        };

        subscribeToChannel(
          `/topic/chat/unread/${chat.id}`,
          functionSubcription01
        );

        const functionSubcription02 = (message) => {
          const mensaje = JSON.parse(message.body);
          console.log("ESTE ES EL MENSAJE:", mensaje);

          if (mensaje.senderId == userLoguer.id) {
            chatsRef.current = chatsRef.current.map((c) => {
              if (c.id === chat.id) {
                return {
                  ...c,
                  lastMessage: mensaje,
                  visible: true,
                };
              }
              return c;
            });
          } else {
            const chatReceived = chatsRef.current.find(
              (ch) => ch.id == chat.id
            );

            const newChats = chatsRef.current.filter((ch) => ch.id != chat.id);

            chatsRef.current = [
              {
                ...chatReceived,
                lastMessage: mensaje,
                visible: true,
              },
              ...newChats,
            ];
          }

          setChats(chatsRef.current);

          if (
            mensaje.senderId != userLoguer.id ||
            chat.name == userLoguer.username
          ) {
            console.log("Mandamos modificacion de status DELIVERED ");

            // Enviar confirmación de entrega
            client.publish({
              destination: `/app/chat/${chat.id}/updateStatus/message`,
              body: JSON.stringify({
                messageIds: [mensaje.id],
                newStatus: "DELIVERED",
              }),
            });
          }
        };

        subscribeToChannel(`/topic/messages/${chat.id}`, functionSubcription02);

        return {
          unsubscribe: () => {
            unsubscribeFromChannel(
              `/topic/chat/unread/${chat.id}`,
              functionSubcription01
            );
            unsubscribeFromChannel(
              `/topic/messages/${chat.id}`,
              functionSubcription02
            );
          },
        };
      });

      return () => {
        console.log("🚫 Cancelando suscripción...");
        subscription1.unsubscribe(); // Evitar suscripciones duplicadas
        subscriptions.forEach((sub) => sub.unsubscribe());
      };
    }
  }, [client, connected, chatsSubscribe]); // Se ejecuta cada vez que `client` cambia

  /**
   * Establece conexión WebSocket usando STOMP sobre SockJS
   */
  const connectWebSocket = () => {
    if (client) {
      console.log(
        "🛑 Desuscribiendo de todos los canales antes de reconectar..."
      );

      // Desuscribirse de todos los canales antes de reconectar
      Object.keys(subscribersRef.current).forEach((channel) => {
        subscribersRef.current[channel].forEach(({ subscription }) => {
          subscription?.unsubscribe();
        });
      });

      // Limpiar referencias de suscriptores
      subscribersRef.current = {};

      console.log("🛑 Desactivando cliente anterior...");
      client.deactivate();
      setClient(null); // Limpiamos el estado antes de crear uno nuevo
    }

    // Crea el socket
    const socket = new SockJS(`${apiUrl}/chat-websocket?token=${token}`, null, {
      transports: ["websocket"], // Solo permite WebSockets
    });
    const stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`, // Token JWT
      },
      onConnect: () => {
        // Marca todos los mensajes como entregados
        const updateStatusDeliveredMessages = async () => {
          await fetcherPut("/api/messages/mark-all-messages-delivered");
        };
        updateStatusDeliveredMessages();
        setConnected(true);
        setClient(stompClient);
      },
      onStompError: (error) => {
        console.error("Error en STOMP:", error);
      },
    });

    stompClient.activate();
  };

  /**
   * Cierra la conexión WebSocket y limpia todas las suscripciones.
   */
  const disconnectWebSocket = () => {
    Object.keys(subscribersRef.current).forEach((channel) => {
      subscribersRef.current[channel].forEach(({ callback }) =>
        unsubscribeFromChannel(channel, callback)
      );
    });

    client?.deactivate();
  };

  /**
   * Se suscribe a un canal WebSocket y registra un callback.
   *
   * @param {string} channel - Canal al que suscribirse.
   * @param {function} callback - Función a ejecutar al recibir un mensaje.
   */
  const subscribeToChannel = (channel, callback) => {
    console.log("subscribersRe", subscribersRef.current);
    if (!client || !connected) return;

    if (!subscribersRef.current[channel]) {
      subscribersRef.current[channel] = []; //  Inicializar si no existe
    }

    if (subscribersRef.current[channel].length === 0) {
      // Crear suscripción si no existe
      console.log("Nos subscribimos a: ", channel);
      const subscription = client.subscribe(channel, (message) => {
        const parsedMessage = JSON.parse(message.body);
        console.log(
          `🔔 Mensaje recibido en ${channel}:`,
          parsedMessage,
          subscribersRef.current
        );

        // Notificar a todos los callbacks
        subscribersRef.current[channel]?.forEach(({ callback }) =>
          callback(message)
        );
      });

      subscribersRef.current[channel].push({ callback, subscription });
    } else {
      // Si ya existe la suscripción, solo agregar el callback
      console.log("Ya existe agregamos callback a: ", channel);

      subscribersRef.current[channel].push({ callback });
    }
  };

  /**
   * Elimina un callback de un canal y cancela la suscripción si es el último.
   *
   * @param {string} channel - Canal del que desuscribirse.
   * @param {function} callbackToRemove - Callback a eliminar.
   */
  const unsubscribeFromChannel = (channel, callbackToRemove) => {
    console.log("NOS DESSUSCRIBIMOS DEL CANAL: " + channel);
    if (!subscribersRef.current[channel]) return;

    // Filtrar los callbacks y eliminar el especificado
    subscribersRef.current[channel] = subscribersRef.current[channel].filter(
      ({ callback }) => callback !== callbackToRemove
    );

    if (subscribersRef.current[channel].length === 0) {
      // 🛑 Si no quedan callbacks, cancelar la suscripción STOMP
      subscribersRef.current[channel][0]?.subscription?.unsubscribe();
      delete subscribersRef.current[channel]; // Eliminar el canal
    }
  };

  return {
    client,
    connected,
    subscribeToChannel,
    unsubscribeFromChannel,
    connectWebSocket,
    disconnectWebSocket,
    typingChats,
    setTypingChats,
  };
};

export default useContextWebSocket;
