"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setToken, setUser } from "../redux/actions";
import { removeCookie } from "@/utils/cookies";
import useContextWebSocket from "../hooks/useContextWebSocket";
import useContextChats from "../hooks/useContextChats";
import useContextUsers from "../hooks/useContextUsers";

const AuthContext = createContext();

/**
 * Contexto de autenticación y gestión global de datos del usuario, WebSocket y chats.
 * Proporciona lógica para conexión STOMP/WebSocket, gestión de usuarios y chats,
 * manejo de estado de escritura, autenticación y cierre de sesión.
 */
export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const connectedRef = useRef(false); // Usamos useRef para evitar problemas de estado
  const router = useRouter();
  const tokenDate = useSelector((state) => state.token);
  const userLoguer = useSelector((state) => state.user);
  const colors = useSelector((state) => state.colors);
  const chatsRef = useRef([]); // Versión mutable de chats
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState(false);

  const { users, setUsers, loadUsers, isLoading, setIsLoading } =
    useContextUsers(dispatch, connectedRef, colors);
  const {
    chats,
    setChats,
    chatsSubscribe,
    setChatsSubscribe,
    loadChats,
    fetcherPut,
  } = useContextChats(dispatch, connectedRef, setIsLoading);

  const {
    client,
    connected,
    subscribeToChannel,
    unsubscribeFromChannel,
    connectWebSocket,
    disconnectWebSocket,
    typingChats,
    setTypingChats,
  } = useContextWebSocket(
    tokenDate,
    fetcherPut,
    chatsSubscribe,
    userLoguer,
    chatsRef,
    setChats
  );

  useEffect(() => {
    setOpenMenu(true);
  }, []);

  // Guarda chats en referencia mutable
  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  // Carga usuarios
  useEffect(() => {
    loadUsers();
  }, []);

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
      loadChats();
    }
  }, [userLoguer]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Cargando...
      </div>
    );
  }

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
    disconnectWebSocket();
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
