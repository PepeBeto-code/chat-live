import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useSelector } from "react-redux";

const useChatSuscribe = (chatId, setMessages, setTypingUser, setTypingChats, typingChats) => {
  const { subscribeToChannel, unsubscribeFromChannel, client } = useAuth();
  const useLoguer = useSelector((state) => state.user);
  let typingTimeout; // Variable para el temporizador de inactividad

  useEffect(() => {
    if (client?.connected) {
      const handleNewMessage = (message) => {
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

      const handleTypingStatus = (message) => {
        const mensaje = JSON.parse(message.body);
        console.log(`📝 El usuario ${mensaje.nombre} está escribiendo...`);
        if (mensaje.nombre != useLoguer.username) {
          setTypingChats({
            ...typingChats,
            [chatId]: mensaje.nombre
          })
          setTypingUser(mensaje.nombre);
          clearTimeout(typingTimeout);
          typingTimeout = setTimeout(() => {
            setTypingUser("");
            setTypingChats({
              ...typingChats,
              [chatId]: ""
            })
          }, 2000);
        }
      };

      const handleStatusUpdate = (message) => {
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

      // Suscribir a los canales
      subscribeToChannel(`/topic/messages/${chatId}`, handleNewMessage);
      subscribeToChannel(`/topic/chat/${chatId}/typing`, handleTypingStatus);
      subscribeToChannel(`/topic/chat/${chatId}/updateStatus/message`, handleStatusUpdate);

      // Cleanup de suscripciones
      return () => {
        unsubscribeFromChannel(`/topic/messages/${chatId}`, handleNewMessage);
        unsubscribeFromChannel(`/topic/chat/${chatId}/typing`, handleTypingStatus);
        unsubscribeFromChannel(`/topic/chat/${chatId}/updateStatus/message`, handleStatusUpdate);
      };
    }
  }, [client]);
};

export default useChatSuscribe;
