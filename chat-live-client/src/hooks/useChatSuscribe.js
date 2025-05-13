import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useSelector } from "react-redux";

/**
 * Hook personalizado para suscribirse a los canales WebSocket de un chat.
 * Maneja la recepción de nuevos mensajes, el estado de escritura de otros usuarios
 * y la actualización del estado de los mensajes (SENT, DELIVERED, SEEN).
 *
 * @param {string} chatId - ID del chat al que se va a suscribir.
 * @param {Function} setMessages - Setter del estado de los mensajes del chat.
 * @param {Function} setTypingUser - Setter para mostrar quién está escribiendo.
 * @param {Function} setTypingChats - Setter para el estado global de escritura por chat.
 * @param {Object} typingChats - Objeto con los usuarios que están escribiendo por chat.
 *
 * @returns {void}
 *
 * Suscripciones que se establecen:
 * - `/topic/messages/${chatId}`: Recibe nuevos mensajes y actualiza el estado.
 * - `/topic/chat/${chatId}/typing`: Muestra cuando otro usuario está escribiendo.
 * - `/topic/chat/${chatId}/updateStatus/message`: Actualiza el estado de entrega de los mensajes.
 *
 * Uso:
 * Este hook se debe usar junto al hook `useChat`, para gestionar tanto los datos como la interacción en tiempo real.
 */
const useChatSuscribe = (
  chatId,
  setMessages,
  setTypingUser,
  setTypingChats,
  typingChats
) => {
  const { subscribeToChannel, unsubscribeFromChannel, client } = useAuth();
  const useLoguer = useSelector((state) => state.user);
  let typingTimeout; // Variable para el temporizador de inactividad

  useEffect(() => {
    if (client?.connected) {
      /**
       * Maneja la recepción de un nuevo mensaje desde el servidor.
       * Si el mensaje coincide con uno existente (por contenido y senderId, pero sin ID),
       * se asume que es la confirmación de un mensaje enviado y se reemplaza.
       * Si no existe coincidencia, se agrega como nuevo.
       *
       * @param {Object} message - Mensaje recibido desde el WebSocket.
       * @param {string} message.body - Cuerpo del mensaje en formato JSON.
       */
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

      /**
       * Maneja el evento de estado de escritura (typing) de otros usuarios.
       * Actualiza los estados `typingUser` y `typingChats` para mostrar visualmente
       * que un usuario está escribiendo, y luego limpia el estado tras 2 segundos de inactividad.
       *
       * @param {Object} message - Mensaje recibido desde el WebSocket.
       * @param {string} message.body - Cuerpo del mensaje en formato JSON.
       */
      const handleTypingStatus = (message) => {
        const mensaje = JSON.parse(message.body);
        console.log(`📝 El usuario ${mensaje.nombre} está escribiendo...`);
        if (mensaje.nombre != useLoguer.username) {
          setTypingChats({
            ...typingChats,
            [chatId]: mensaje.nombre,
          });
          setTypingUser(mensaje.nombre);
          clearTimeout(typingTimeout);
          typingTimeout = setTimeout(() => {
            setTypingUser("");
            setTypingChats({
              ...typingChats,
              [chatId]: "",
            });
          }, 2000);
        }
      };

      /**
       * Maneja la actualización de estado de uno o más mensajes.
       * Reemplaza en el estado local los mensajes cuya ID coincida con los actualizados.
       * Usado típicamente para actualizar de "SENT" a "DELIVERED" o "SEEN".
       *
       * @param {Object} message - Mensaje recibido desde el WebSocket.
       * @param {string} message.body - Cuerpo del mensaje en formato JSON con un array de mensajes.
       */
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
      subscribeToChannel(
        `/topic/chat/${chatId}/updateStatus/message`,
        handleStatusUpdate
      );

      // Cleanup de suscripciones
      return () => {
        unsubscribeFromChannel(`/topic/messages/${chatId}`, handleNewMessage);
        unsubscribeFromChannel(
          `/topic/chat/${chatId}/typing`,
          handleTypingStatus
        );
        unsubscribeFromChannel(
          `/topic/chat/${chatId}/updateStatus/message`,
          handleStatusUpdate
        );
      };
    }
  }, [client]);
};

export default useChatSuscribe;
