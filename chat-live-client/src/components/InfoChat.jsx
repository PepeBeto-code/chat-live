import React, { useState, useEffect } from "react";
import UserAvatar from "./UserAvatar";
import { useAuth } from "@/context/AuthContext";
import UserAvatar2 from "@/components/UserAvatar2";
const InfoChat = ({ chatInfo, userInfo }) => {
  // Formateo de la fecha
  const formatDate = (date) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };
    return new Date(date).toLocaleDateString("es-ES", options);
  };

  return (
    <div className="chat-sidebar">
      <div className="flex flex-col items-center justify-center ">
        <div className="user-avatar">
          <UserAvatar2
            name={userInfo.username}
            idUser={userInfo.id}
            isConnected={userInfo.active}
            showInitials={true}
            lg={true}
          />
        </div>
        <div className="text-center text-base font-sans">
          <p className=" ">{userInfo.username}</p>
          <span className={``}>
            {userInfo.active
              ? "En línea"
              : `Última conexión: ${formatDate(userInfo?.lastConnection)}`}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h4 className="mb-2">Información del chat</h4>
        <div className="text-xs">
          <p className="text-xs">
            <strong>Fecha de creación:</strong>{" "}
            {formatDate(chatInfo?.createdAt)}
          </p>
          <p>
            <strong>Archivado: </strong>
            {chatInfo.archived ? "Si" : "No"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InfoChat;
