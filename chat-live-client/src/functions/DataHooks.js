import { useState } from "react";
import axios from "axios";
import AxiosInstance from "./AxiosInstance";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

/**
 * Hook personalizado que centraliza funciones comunes de interacción con API
 * (GET, POST, PUT, DELETE, login) y utilidades de UX como confirmaciones de acción.
 *
 * @param {Function} dispatch - Función opcional de Redux para manejo global (por defecto función vacía).
 * @param {RefObject} connectedRef - Referencia opcional para mantener estado de conexión persistente.
 * @returns {Object} Funciones reutilizables para operaciones HTTP, login, estado de carga, y mensajes visuales.
 */
export const DataHooks = (
  dispatch = () => {},
  connectedRef = { current: "" }
) => {
  const [isLoading, setIsLoading] = useState(false); // Estado global de carga
  const { instance } = AxiosInstance(dispatch, connectedRef); // Instancia de Axios personalizada
  const [data, setData] = useState(); // Estado para guardar respuesta GET

  /**
   * Diálogo de confirmación reutilizable usando SweetAlert2.
   * Ejecuta `confirmAction` si el usuario confirma la acción.
   */
  const showConfirmationDialog = ({
    title = "¿Estas seguro?",
    text = "¡No podrás revertir esto!",
    icon = "warning",
    confirmButtonText = "Si, continuar!",
    cancelButtonText = "Cancelar",
    confirmAction = () => {},
  }) => {
    Swal.fire({
      title,
      text,
      icon,
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText,
      cancelButtonText,
    }).then((result) => {
      if (result.isConfirmed) {
        confirmAction();
        // Swal.fire("Success!", "Action completed successfully.", "success");
      }
    });
  };

  /**
   * Función para obtener (o crear) un chat entre dos usuarios.
   * Navega automáticamente al nuevo chat.
   */
  const getOrCreateChat = async (
    senderId,
    receiverId,
    setChats,
    router,
    setIsLoading,
    setChatsSubscribe,
    setOpenMenu
  ) => {
    setIsLoading(true);
    try {
      const chat = await fetcherPost("/api/chats/start", {
        senderId: senderId,
        receiverId: receiverId,
      });
      console.log("chat", chat);
      setOpenMenu(false);
      setChatsSubscribe((prevChats) => [...prevChats, chat]);
      setChats((prevChats) => [...prevChats, chat]);
      router.push(`/dashboard/chat/${chat.id}`, { shallow: true });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Función para login.
   * Devuelve token de acceso si es exitoso, o lanza error con mensaje visible.
   */
  const login = async (url, data) => {
    setIsLoading(true);
    let token = "";
    await axios
      .post(url, data)
      .then((data) => {
        token = data.data;
      })
      .catch((err) => {
        toast.error("Ocurrio un error!", {
          reverseOrder: true,
          position: "top-left",
        });
        throw err;
      })
      .finally(() => {
        setIsLoading(false);
      });
    return token;
  };

  /**
   * Función POST reutilizable con instancia protegida de Axios.
   */
  const fetcherPost = async (url, data) => {
    let token = "";
    await instance
      .post(url, data)
      .then((data) => {
        token = data.data;
      })
      .catch((err) => {
        throw err;
      })
      .finally(() => {});
    return token;
  };

  /**
   * Función DELETE reutilizable.
   */
  const fetcherDeleted = async (url, data) => {
    console.log("Deleted", url);

    let deleted = "";
    await instance
      .delete(url, data)
      .then((data) => {
        deleted = data.data;
      })
      .catch((err) => {
        throw err;
      });
    return deleted;
  };

  const fetcherPut = async (url, data) => {
    console.log("Put: ", url);

    let put = "";
    await instance
      .put(url, data)
      .then((data) => {
        put = data.data;
      })
      .catch((err) => {
        throw err;
      });

    return put;
  };

  /**
   * Función GET reutilizable.
   * Actualiza el estado interno `data` con la respuesta recibida.
   */
  const fetcherGet = async (url, setIsLoading = () => {}) => {
    console.log("Get: ", url);
    setIsLoading(true);
    await instance
      .get(url)
      .then((data) => {
        console.log("Get: ", url, data.data);

        setData(data.data);
      })
      .catch((err) => {
        if ([500, 502, 503, 506].includes(err.response.status)) {
          Swal.fire(
            "Nuestros servidores están reiniciando debido a inactividad. Por favor, intenta de nuevo en unos minutos.",
            "",
            "info"
          );
        }
        throw err;
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return {
    setData,
    data,
    fetcherPost,
    fetcherGet,
    fetcherPut,
    fetcherDeleted,
    login,
    getOrCreateChat,
    showConfirmationDialog,
    isLoading,
  };
};

export default DataHooks;
