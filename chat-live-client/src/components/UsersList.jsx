"use client";

import React, { use, useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useRouter } from "next/navigation";
import DataHooks from "../functions/DataHooks";
import { useAuth } from "../context/AuthContext";
import { useDispatch, useSelector } from "react-redux";
import { Tooltip } from "reactstrap";
import UserAvatar2 from "./UserAvatar2";
import { Spinner } from "reactstrap";
import { UncontrolledTooltip } from "reactstrap";

const UsersList = ({ actives = false }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(); // Configuración del carrusel
  const {
    setChats,
    users: data,
    setIsLoading,
    isLoading,
    setChatsSubscribe,
    connectedRef,
    setOpenMenu,
  } = useAuth();
  const dispatch = useDispatch();
  const { getOrCreateChat } = DataHooks(dispatch, connectedRef);
  const [users, setUsers] = useState();
  const userLoguer = useSelector((state) => state.user);
  const router = useRouter();
  const [tooltipState, setTooltipState] = useState({}); // Estado para manejar los tooltips

  const toggleTooltip = (userId) => {
    setTooltipState((prevState) => ({
      ...prevState,
      [userId]: !prevState[userId], // Cambiar el estado del tooltip específico
    }));
  };

  useEffect(() => {
    if (actives) {
      setUsers(data.filter((e) => e.active));
    } else {
      setUsers(data);
    }
  }, [data]);

  return (
    <div
      className="overflow-hidden "
      style={{
        padding: "1rem 0rem",
      }}
      ref={emblaRef}
    >
      <div className="flex">
        {!isLoading &&
          users
            ?.filter((user) => user.id != userLoguer?.id)
            .sort((a, b) => b.active - a.active)
            .map((user, index) => (
              <div
                key={index}
                className="pt-2 pb-2 pr-4 pl-4 cursor-pointer"
                onClick={() =>
                  getOrCreateChat(
                    userLoguer.id,
                    user.id,
                    setChats,
                    router,
                    setIsLoading,
                    setChatsSubscribe,
                    setOpenMenu
                  )
                }
                id={`tooltip-${user.id}`} // Asegurar ID único
              >
                <UserAvatar2
                  name={user.username}
                  showInitials={true}
                  idUser={user.id}
                  isConnected={user.active}
                ></UserAvatar2>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: " x-small",
                    textAlign: "center",
                  }}
                >
                  {user.username}
                </p>
                {document.getElementById(`tooltip-${user.id}`) && (
                  <Tooltip
                    isOpen={tooltipState[user.id] || false}
                    target={`tooltip-${user.id}`}
                    toggle={() => toggleTooltip(user.id)}
                  >
                    Enviar Mensaje a {user.username}
                  </Tooltip>
                )}
              </div>
            ))}
        {isLoading && (
          <>
            {" "}
            Cargando ... <Spinner />
          </>
        )}
      </div>
    </div>
  );
};

export default UsersList;
