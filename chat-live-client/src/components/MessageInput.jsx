// components/MessageInput.js
import React, { useState } from "react";
import { Input, Button } from "reactstrap";
import { Send } from "lucide-react"; // Importar el ícono X de Lucide React

const MessageInput = ({
  onSendMessage,
  connected,
  client,
  chatId,
  setTypingUser,
}) => {
  const [message, setMessage] = useState("");
  let typingTimeout; // Variable para el temporizador de inactividad

  const handleSendMessage = (e) => {
    e.preventDefault();
    onSendMessage(message.trim());
    setMessage("");
  };

  return (
    <div className="chat__input">
      <input
        className="chat__field"
        type="text"
        value={message}
        // onFocus={() => markMessagesAsRead()}
        onChange={(e) => {
          if (client && connected) {
            client.publish({
              destination: `/app/chat/${chatId}/typing`,
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
        onClick={(e) => handleSendMessage(e)}
        disabled={!connected || message.trim() == ""}
      >
        <Send />
      </Button>
    </div>
  );
};

export default MessageInput;
