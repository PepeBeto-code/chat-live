"use client";

import React, { useState, useRef, useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import { usePathname } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import { X } from "lucide-react";
import ChatMessageSearch from "../../../../components/ChatMessageSearch";
import { push as Menu } from "react-burger-menu";
import { Search } from "lucide-react";
import useClickOutside from "@/hooks/useClickOutside";
import MessageInput from "@/components/MessageInput";
import useChatSuscribe from "@/hooks/useChatSuscribe";
import useChat from "@/hooks/useChat";
import ChatMessage from "@/components/ChatMessage";
import FormatearFecha from "@/components/FormatearFecha";
import { Tooltip } from "reactstrap";
import InfoChat from "@/components/InfoChat";
import UserAvatar2 from "@/components/UserAvatar2";
import { Info } from "lucide-react";

const Chat = () => {
  const {
    client,
    connected,
    setChats,
    chats,
    setTypingChats,
    typingChats,
    connectedRef,
  } = useAuth();
  const useLoguer = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const paths = usePathname().split("/");
  const pathname = paths.pop();
  const chatId = Number(pathname);
  const [tooltipOpenMenu, setTooltipOpenMenu] = useState(false);
  const [tooltipOpenSearch, setTooltipOpenSearch] = useState(false);
  const dispatch = useDispatch();
  const {
    messages,
    setMessages,
    typingUser,
    setTypingUser,
    hiddenStatuses,
    messagesEndRef,
    sentRepliedMessage,
    setSentRepliedMessage,
    messageRefs,
    visibleDropdowns,
    highlightedMessage,
    setIsVisible,
    updateRepliedMessage,
    highlightAndScrollToMessage,
    sendMessage,
    chat,
    participant,
  } = useChat(
    chatId,
    setChats,
    chats,
    client,
    connected,
    dispatch,
    connectedRef
  );

  useChatSuscribe(
    chatId,
    setMessages,
    setTypingUser,
    setTypingChats,
    typingChats
  );

  const [selectMessage, setSelectMessage] = useState(null);
  const [selectMessageDmIsVisible, setSelectMessageDmIsVisible] =
    useState(true);

  // Agregado para el control del menu
  const menf = useRef(null);
  const [isSearch, setIsSearch] = useState(false);
  const [isInfoChat, setIsInfoChat] = useState(false);
  const [isInfo, setIsInfo] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const handleStateChange = (state) => {
    setIsMenuOpen(state.isOpen);
  };
  useClickOutside(menf, () => setIsMenuOpen(false)); // Se cerrará si se hace clic fuera

  const infoMessage = (msg) => {
    setIsSearch(false);
    setIsInfoChat(false);
    setSelectMessage(msg);
    setIsInfo(true);
    setIsMenuOpen(true);
  };

  if (!useLoguer) return;

  let lastTimestamp = null;

  return (
    <div id="outer-container">
      <div ref={menf}>
        <Menu
          pageWrapId={"page-wrap"}
          outerContainerId={"outer-container"}
          right
          isOpen={isMenuOpen}
          onStateChange={handleStateChange}
          customBurgerIcon={false}
          width={"30rem"}
        >
          <h2 tabIndex="-1" style={{ padding: "1.2em 0.8em" }}>
            {isSearch && "Buscar Mensajes"}
            {isInfo && "Info. del mensaje"}
            {isInfoChat && "Info. del chat"}
          </h2>
          <div>
            {isSearch && (
              <ChatMessageSearch
                messages={messages}
                onSelectMessage={highlightAndScrollToMessage}
              />
            )}{" "}
            {isInfoChat && (
              <InfoChat
                chatInfo={{
                  createdAt: chat.createdAt,
                  archived: chat.archived,
                }}
                userInfo={participant}
              />
            )}{" "}
            {isInfo && (
              <div>
                <div
                  className="h-[20%] flex justify-end p-4 items-end"
                  style={{
                    backgroundColor: "var(--bg-chat)",
                  }}
                >
                  <ChatMessage
                    msg={selectMessage}
                    repliedMessage={
                      selectMessage.repliedMessageId
                        ? messages.find(
                            (m) => m.id === selectMessage.repliedMessageId
                          )
                        : null
                    }
                    highlightedMessage={highlightedMessage}
                    isVisible={selectMessageDmIsVisible}
                    updateRepliedMessage={updateRepliedMessage}
                    highlightAndScrollToMessage={highlightAndScrollToMessage}
                    setIsVisibleMs={setSelectMessageDmIsVisible}
                    messageRefs={messageRefs}
                    hiddenStatuses={hiddenStatuses}
                    setMessages={setMessages}
                    userReceivername={chat.name}
                  />
                </div>

                <div className="p-4 shadow-xl">
                  <div
                    className="p-2"
                    style={{
                      borderBottom: "1px solid var(--bg-chat)",
                    }}
                  >
                    <div>
                      {" "}
                      <span
                        style={{
                          marginLeft: "0",
                        }}
                        className="chat__status-icon float-none seen"
                      >
                        ✔✔
                      </span>{" "}
                      Leído
                    </div>
                    <div>
                      {selectMessage.seenAt ? (
                        <FormatearFecha createdAt={selectMessage.seenAt} />
                      ) : (
                        "-"
                      )}
                    </div>
                  </div>
                  <div className="p-2">
                    <div className="pt-2">
                      {" "}
                      <span
                        style={{
                          marginLeft: "0",
                        }}
                        className="chat__status-icon float-none delivered"
                      >
                        ✔✔
                      </span>{" "}
                      Entregado
                    </div>
                    <div>
                      {" "}
                      {selectMessage.deliveredAt ? (
                        <FormatearFecha createdAt={selectMessage.deliveredAt} />
                      ) : (
                        "-"
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Menu>
      </div>
      <div id="page-wrap" className="mx-auto shadow rounded-lg chat">
        <div className="chat__header">
          <div className="flex">
            {" "}
            {participant && (
              <UserAvatar2
                isConnected={participant?.active}
                name={participant?.username}
                idUser={participant?.id}
                showInitials={true}
              />
            )}
            {chat && <h1 className="chat__title">{chat.name}</h1>}
          </div>
          <div className="flex">
            <div
              id="TooltipSearch"
              className="cursor-pointer !mr-[2rem] hover"
              onClick={() => {
                setIsInfo(false);
                setIsInfoChat(false);
                setIsSearch(true);
                setIsMenuOpen(true);
              }}
            >
              <Search />{" "}
              <Tooltip
                isOpen={tooltipOpenSearch}
                target={"TooltipSearch"}
                toggle={() => setTooltipOpenSearch(!tooltipOpenSearch)}
              >
                Buscar mensaje
              </Tooltip>
            </div>
            <div
              className="m-auto cursor-pointer hover"
              id="TooltipMenu"
              onClick={() => {
                setIsInfo(false);
                setIsSearch(false);
                setIsInfoChat(true);
                setIsMenuOpen(true);
              }}
            >
              <Info />
              <Tooltip
                isOpen={tooltipOpenMenu}
                target={"TooltipMenu"}
                toggle={() => setTooltipOpenMenu(!tooltipOpenMenu)}
              >
                Menu
              </Tooltip>
            </div>
          </div>
        </div>

        <div className="chat__messages">
          {messages.map((msg, index) => {
            const repliedMessage = msg.repliedMessageId
              ? messages.find((m) => m.id === msg.repliedMessageId)
              : null; // Busca el mensaje original si es una respuesta
            const setIsVisibleMs = setIsVisible(msg.id);

            const messageDate = new Date(msg.timestamp);
            const prevDate = lastTimestamp ? new Date(lastTimestamp) : null;
            lastTimestamp = msg.timestamp;

            // Si la diferencia entre mensajes es mayor a 1 hora, mostrar un separador
            const showDateSeparator =
              !prevDate || (messageDate - prevDate) / (1000 * 60 * 60) >= 1;

            return (
              <div key={index}>
                {showDateSeparator && (
                  <div className="date-separator">
                    {messageDate.toLocaleDateString()}{" "}
                    {messageDate.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                )}
                <ChatMessage
                  msg={msg}
                  repliedMessage={repliedMessage}
                  highlightedMessage={highlightedMessage}
                  isVisible={visibleDropdowns[msg.id]}
                  updateRepliedMessage={updateRepliedMessage}
                  highlightAndScrollToMessage={highlightAndScrollToMessage}
                  setIsVisibleMs={setIsVisibleMs}
                  messageRefs={messageRefs}
                  hiddenStatuses={hiddenStatuses}
                  setMessages={setMessages}
                  infoMessage={infoMessage}
                  userReceivername={chat.name}
                />
              </div>
            );
          })}

          <div ref={messagesEndRef}></div>
        </div>

        {/* Mostrar quién está escribiendo */}
        {typingUser && (
          <div
            style={{
              color: "#999",
              fontStyle: "italic",
              textAlign: "center",
              backgroundColor: "var(--bg-chat)",
            }}
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
                    : chat.name}
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

        <MessageInput
          onSendMessage={sendMessage}
          connected={connected}
          client={client}
          chatId={chatId}
          setTypingUser={setTypingUser}
        />
      </div>
    </div>
  );
};

export default Chat;
