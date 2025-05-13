import { setColors } from "@/redux/actions";
import DataHooks from "@/functions/DataHooks";
import { useEffect, useState } from "react";

/**
 * Hook personalizado para gestionar usuarios y asignarles colores únicos.
 *
 * @param {function} dispatch - Función de dispatch de Redux para actualizar el estado global.
 * @param {React.MutableRefObject<boolean>} connectedRef - Referencia mutable que indica si ya se hizo la conexión WebSocket.
 * @param {object} existingColors - Objeto que contiene los colores ya asignados por usuario (por ID).
 * @returns {object} - Objeto con el estado y métodos para manejar la lista de usuarios y su carga.
 */
const useContextUsers = (dispatch, connectedRef, existingColors) => {
  const {
    data: users,
    setData: setUsers,
    fetcherGet: getUsers,
  } = DataHooks(dispatch, connectedRef);

  const [isLoading, setIsLoading] = useState(false);

  const loadUsers = () => {
    getUsers("/api/users", setIsLoading);
  };

  /**
   * Efecto que se ejecuta cuando cambia la lista de usuarios.
   * Asigna colores aleatorios a los usuarios que no tienen uno aún,
   * y actualiza el estado global (Redux) con los nuevos colores.
   */
  useEffect(() => {
    const colorsObj = users?.reduce((acc, user) => {
      if (existingColors && !existingColors[user.id]) {
        acc[user.id] = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
      }
      return acc;
    }, {});

    dispatch(setColors({ ...existingColors, ...colorsObj }));
  }, [users]);

  return {
    users,
    setUsers,
    isLoading,
    setIsLoading,
    loadUsers,
  };
};

export default useContextUsers;
