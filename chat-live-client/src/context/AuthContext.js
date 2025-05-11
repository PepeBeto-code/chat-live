"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setColors, setToken, setUser } from "../redux/actions";
import SockJS from "sockjs-client"; // Importa SockJS
import { Client } from "@stomp/stompjs";
import DataHooks from "../functions/DataHooks";
import { removeCookie } from "@/utils/cookies";
import { apiUrl } from "@/Variables/ApiVariables.mjs";

const AuthContext = createContext();

/**
 * Contexto de autenticación y gestión global de datos del usuario, WebSocket y chats.
 * Proporciona lógica para conexión STOMP/WebSocket, gestión de usuarios y chats,
 * manejo de estado de escritura, autenticación y cierre de sesión.
 */
export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const connectedRef = useRef(false); // Usamos useRef para evitar problemas de estado
  const {
    data: chats,
    setData: setChats,
    fetcherGet: getChats,
    fetcherPut,
  } = DataHooks(dispatch, connectedRef);
  const {
    data: chatsSubscribe,
    setData: setChatsSubscribe,
    fetcherGet: getChatsSubscribe,
  } = DataHooks(dispatch, connectedRef);
  const router = useRouter();
  const [connected, setConnected] = useState(false);
  const tokenDate = useSelector((state) => state.token);
  const userLoguer = useSelector((state) => state.user);
  const colors = useSelector((state) => state.colors);
  const [client, setClient] = useState(null);
  const [typingChats, setTypingChats] = useState({});
  const subscribersRef = useRef({}); // Almacena callbacks y suscripciones por canal
  const chatsRef = useRef([]); // Versión mutable de chats
  const [loading, setLoading] = useState(true);
  const {
    data: users,
    setData: setUsers,
    fetcherGet: getUsers,
  } = DataHooks(dispatch, connectedRef);
  const [isLoading, setIsLoading] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);

  useEffect(() => {
    setOpenMenu(true);
  }, []);

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
    const socket = new SockJS(
      `${apiUrl}/chat-websocket?token=${tokenDate}`,
      null,
      {
        transports: ["websocket"], // Solo permite WebSockets
      }
    );
    const stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${tokenDate}`, // Token JWT
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

  // Guarda chats en referencia mutable
  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  // Obtiene chats del usuario logueado
  useEffect(() => {
    getChatsSubscribe(`/api/chats`, setIsLoading);
  }, []);

  // Carga usuarios
  useEffect(() => {
    getUsers("/api/users", setIsLoading);
  }, []);

  // Asigna colores únicos a usuarios sin color
  useEffect(() => {
    // Asignar colores a cada usuario
    const colorsObj = users?.reduce((acc, user) => {
      // Si no tiene color asignado, genera uno
      if (colors && !colors[user.id]) {
        acc[user.id] = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
      }
      return acc;
    }, {});

    dispatch(
      setColors({
        ...colors,
        ...colorsObj,
      })
    );
  }, [users]); // Cuando users cambie, asignamos colores

  // Valida autenticación y conecta WebSocket si es necesario
  useEffect(() => {
    if (!tokenDate) {
      router.replace("/login"); // Usa `replace` para no permitir "atrás"
    } else {
      setLoading(false); // Solo renderiza cuando haya validación
    }

    //  Solo conectar si no hay un cliente activo
    if (!connectedRef.current) {
      connectedRef.current = true;
      connectWebSocket();
    }

    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, [tokenDate]);

  // Si hay usuario logueado, carga sus chats
  useEffect(() => {
    if (userLoguer) {
      getChats(`/api/chats`);
    }
  }, [userLoguer]);

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

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Cargando...
      </div>
    );
  }

  /**
   * Suscribe a un canal WebSocket y asocia un callback
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
   * Elimina un callback de un canal, y cancela suscripción si es el último
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

  const login = () => {
    router.push("/dashboard"); // Redirige después del login
  };

  /**
   * Cierra sesión:
   * - Desuscribe de canales
   * - Desactiva WebSocket
   * - Limpia Redux y cookies
   */
  const logout = () => {
    // Primero desuscribirse de todos los canales
    Object.keys(subscribersRef.current).forEach((channel) => {
      // Recorrer todos los canales activos y desuscribir
      subscribersRef.current[channel].forEach(({ callback }) => {
        unsubscribeFromChannel(channel, callback);
      });
    });

    // Ahora se puede proceder a desactivar el cliente STOMP
    client?.deactivate();

    // Limpiar estado del usuario
    dispatch(setUser(null));
    dispatch(setToken(null));
    removeCookie("token");

    // Redirigir al login
    router.replace(`/login`);
  };

  return (
    <AuthContext.Provider
      value={{
        client,
        connected,
        subscribeToChannel,
        login,
        users,
        setUsers,
        isLoading,
        setIsLoading,
        logout,
        chats,
        setChats,
        unsubscribeFromChannel,
        typingChats,
        setTypingChats,
        setChatsSubscribe,
        connectedRef,
        openMenu,
        setOpenMenu,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook personalizado para consumir el contexto
 */
export const useAuth = () => useContext(AuthContext);
