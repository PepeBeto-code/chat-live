import { useDispatch, useSelector } from "react-redux";
import { Spinner } from "reactstrap";
import DropdownMenu from "./DropdownMenu";
import FormatearFecha from "./FormatearFecha";
import { ChevronDown } from "lucide-react";
import { X, Check, CircleX } from "lucide-react"; // Importar el ícono X de Lucide React
import toast from "react-hot-toast";
import { Tooltip } from "reactstrap";
import { useAuth } from "@/context/AuthContext";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Col,
  FormGroup,
  Input,
  Label,
} from "reactstrap";
import { useEffect, useState } from "react";
import DataHooks from "@/functions/DataHooks";

const ChatMessage = ({
  msg,
  repliedMessage,
  highlightedMessage,
  isVisible,
  updateRepliedMessage,
  highlightAndScrollToMessage,
  setIsVisibleMs,
  messageRefs,
  hiddenStatuses,
  setMessages,
  infoMessage,
  userReceivername,
}) => {
  const useLoguer = useSelector((state) => state.user);
  const isSentByUser = msg.senderId === useLoguer.id;
  const [deletedAll, setDeletedAll] = useState(true);
  const [deleteForAll, setDeleteForAll] = useState(false);
  const [selectMessage, setSelectMessage] = useState(null);
  const [modal, setModal] = useState(false);
  const dispatch = useDispatch();
  const toggle = () => setModal(!modal);
  const [isEditable, setIsEditable] = useState(true);
  const [edit, setEdit] = useState(false);
  const [editedContent, setEditedContent] = useState(msg.content);
  const [tooltipErr, setTooltipErr] = useState(false);
  const { setIsLoading, connectedRef } = useAuth();
  const { fetcherDeleted, fetcherPut } = DataHooks(dispatch, connectedRef);

  const toggleModal = (canDeleteForAll, msg) => {
    setDeleteForAll(canDeleteForAll && isEditable); // Si el mensaje es del usuario, permitir eliminar para todos
    setDeletedAll(canDeleteForAll && isEditable);
    setSelectMessage(msg);
    setModal(!modal);
  };

  const deletedMessage = async () => {
    setIsLoading(true);
    try {
      if (deletedAll) {
        await fetcherDeleted(
          `/api/messages/${selectMessage.id}/user/${useLoguer.id}/all`
        );
      } else {
        await fetcherDeleted(
          `/api/messages/${selectMessage.id}/user/${useLoguer.id}`
        );
      }
      setMessages((prevMsgs) =>
        prevMsgs.filter((msg) => msg.id !== selectMessage.id)
      );
      setSelectMessage(null);
      toast.success(`Mensaje eliminado`, {
        reverseOrder: true, // Nuevas notificaciones aparecerán encima de las anteriores
        position: "top-left",
      });
      console.log("Mensaje eliminado con exito");
    } catch (error) {
    } finally {
      setModal(false);
      setIsLoading(false);
    }
  };

  const editMessage = async () => {
    try {
      if (editedContent == msg.content) {
        setEdit(false);
        return;
      }
      const data = await fetcherPut(
        `/api/messages/editMessage/${msg.id}/user/${useLoguer.id}`,
        {
          content: editedContent,
        }
      );

      console.log(data);
      setMessages((prevMsgs) =>
        prevMsgs.map((msg) => {
          return msg.id == data.id ? data : msg;
        })
      );

      toast.success(`Mensaje editado`, {
        reverseOrder: true, // Nuevas notificaciones aparecerán encima de las anteriores
        position: "top-right",
      });
    } catch (error) {
      toast.error("Ocurrio un error!", {
        reverseOrder: true,
        position: "top-left",
      });
    } finally {
      setEdit(false);
    }
  };

  useEffect(() => {
    const timeElapsed =
      new Date().getTime() - new Date(msg.timestamp).getTime();
    if (timeElapsed > 5 * 60 * 1000) {
      setIsEditable(false);
    }
  }, [isVisible]);

  return (
    <div
      ref={(el) => (messageRefs.current[msg.id] = el)}
      className={`chat__message ${
        isSentByUser ? "chat__message--sent" : "chat__message--received"
      }`}
    >
      <div
        className={`chat__text ${
          highlightedMessage === msg.id ? "chat__message--highlighted" : ""
        }`}
        onMouseEnter={() => setIsVisibleMs(true)}
        onMouseLeave={() => setIsVisibleMs(false)}
      >
        {repliedMessage && (
          <RepliedMessage
            repliedMessage={repliedMessage}
            useLoguer={useLoguer}
            highlightAndScrollToMessage={highlightAndScrollToMessage}
            userReceivername={userReceivername}
          />
        )}
        <MessageContent
          msg={msg}
          isSentByUser={isSentByUser}
          isVisible={isVisible}
          setIsVisible={setIsVisibleMs}
          updateRepliedMessage={updateRepliedMessage}
          toggle={toggleModal}
          infoMessage={infoMessage}
          isEditable={isEditable}
          edit={edit}
          setEdit={setEdit}
          setEditedContent={setEditedContent}
          editedContent={editedContent}
          editMessage={editMessage}
          tooltipErr={tooltipErr}
          setTooltipErr={setTooltipErr}
        />
        <MessageStatus
          msg={msg}
          isSentByUser={isSentByUser}
          hiddenStatuses={hiddenStatuses}
        />
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

      <Modal isOpen={modal} toggle={toggle} centered>
        <ModalHeader toggle={toggle} className="font-bold text-xl">
          {deleteForAll
            ? "¿Para quién quieres anular el envío de este mensaje?"
            : "Eliminar para mí"}
        </ModalHeader>
        <ModalBody>
          {deleteForAll ? (
            <Col sm={10}>
              <FormGroup check>
                <Input
                  name="radio2"
                  type="radio"
                  checked={deletedAll}
                  onChange={() => setDeletedAll(true)}
                />{" "}
                <Label check>Anular el envío para todos</Label>
                <p
                  style={{
                    color: "rgb(107 114 128 / var(--tw-text-opacity, 1))",
                    padding: "0.2rem 0px 1.5rem 0px",
                  }}
                >
                  Se anulará el envío de este mensaje para todas las personas
                  del chat. Es posible que los demás ya lo hayan visto o
                  reenviado. Los mensajes anulados se pueden incluir en reportes
                  de todos modos.
                </p>
              </FormGroup>
              <FormGroup check>
                <Input
                  name="radio2"
                  type="radio"
                  checked={!deletedAll}
                  onChange={() => setDeletedAll(false)}
                />{" "}
                <Label check>Anular el envío para ti</Label>
                <p
                  style={{
                    color: "rgb(107 114 128 / var(--tw-text-opacity, 1))",
                    padding: "0.2rem 0px 1.5rem 0px",
                  }}
                >
                  Se eliminará el mensaje de tus dispositivos, pero los demás
                  miembros del chat podrán seguir viéndolo.
                </p>
              </FormGroup>
            </Col>
          ) : (
            <p className="text-gray-500">
              Se eliminará el mensaje para ti, pero los demás miembros del chat
              podrán seguir viéndolo.{" "}
            </p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            style={{
              border: "0",
              color: "var(--text-primary)",
            }}
            onClick={toggle}
          >
            Cancelar
          </Button>{" "}
          <Button color="primary" onClick={deletedMessage}>
            Eliminar
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

const RepliedMessage = ({
  repliedMessage,
  useLoguer,
  highlightAndScrollToMessage,
  userReceivername,
}) => (
  <div
    className="chat__replied-message cursor-pointer"
    onClick={() => highlightAndScrollToMessage(repliedMessage.id)}
  >
    <p className="chat__replied-text">
      <strong>
        {repliedMessage.senderId === useLoguer.id ? "Tú" : userReceivername}
      </strong>
      : {repliedMessage.content}
    </p>
  </div>
);

const MessageContent = ({
  msg,
  isSentByUser,
  isVisible,
  setIsVisible,
  updateRepliedMessage,
  toggle,
  infoMessage,
  isEditable,
  edit,
  setEdit,
  setEditedContent,
  editedContent,
  editMessage,
  tooltipErr,
  setTooltipErr,
}) => (
  <>
    {edit ? (
      <div className="flex items-center space-x-2">
        <input
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          className="focus:outline-none"
          style={{
            backgroundColor: "inherit",
          }}
          autoFocus
        />
        <Check className="cursor-pointer" onClick={() => editMessage()} />
        <X
          className="cursor-pointer"
          onClick={() => {
            setEditedContent(msg.content);
            setEdit(false);
          }}
        />
      </div>
    ) : (
      <div className="flex justify-between mb-[0.3rem]">
        <p className="text-start pr-8">
          <span>{msg.content} </span>
          <span className="italic text-xs">
            {msg.edited ? "(Editado)" : ""}
          </span>
        </p>
        {msg.status == "FAILED" ? (
          <div id="TooltipErr">
            <CircleX
              style={{
                color: "var(--notification-color)",
              }}
            />
            <Tooltip
              isOpen={tooltipErr}
              target={"TooltipErr"}
              toggle={() => setTooltipErr(!tooltipErr)}
            >
              Error al enviar
            </Tooltip>
          </div>
        ) : msg.id ? (
          <DropdownMenu
            icon={<ChevronDown />}
            right={isSentByUser}
            setIsVisible={setIsVisible}
            isVisible={isVisible}
            options={[
              ...(isSentByUser && infoMessage
                ? [
                    {
                      label: "Info. del mensaje",
                      action: infoMessage,
                      params: [msg],
                    },
                  ]
                : []),
              ...(isSentByUser && isEditable
                ? [
                    {
                      label: "Editar",
                      action: () => setEdit(true),
                    },
                  ]
                : []),
              {
                label: "Responder",
                action: updateRepliedMessage,
                params: [msg],
              },
              {
                label: "Eliminar",
                action: (msg) => toggle(isSentByUser, msg),
                params: [msg],
              },
            ]}
          />
        ) : (
          <></>
        )}
      </div>
    )}
  </>
);

const MessageStatus = ({ msg, isSentByUser, hiddenStatuses }) => (
  <span
    className={`chat__status-icon ${
      isSentByUser ? getStatusClass(msg.status) : ""
    }`}
  >
    {msg.timestamp && (
      <FormatearFecha
        createdAt={isSentByUser ? getStatusDate(msg) : msg.timestamp}
      />
    )}
    {isSentByUser && getStatusSymbol(msg.status)}
  </span>
);

const getStatusClass = (status) => {
  switch (status) {
    case "SENT":
      return "sent";
    case "DELIVERED":
      return "delivered";
    case "SEEN":
      return "seen";
    default:
      return "";
  }
};

const getStatusDate = (msg) => {
  switch (msg.status) {
    case "SENT":
      return msg.sentAt;
    case "DELIVERED":
      return msg.deliveredAt;
    case "SEEN":
      return msg.seenAt;
    default:
      return msg.timestamp;
  }
};

const getStatusSymbol = (status) => {
  switch (status) {
    case "SENT":
      return "✔";
    case "DELIVERED":
      return "✔✔";
    case "SEEN":
      return "✔✔";
    default:
      return null;
  }
};

export default ChatMessage;
