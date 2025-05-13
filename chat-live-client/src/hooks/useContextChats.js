import DataHooks from "@/functions/DataHooks";

/**
 * Hook personalizado para gestionar la lógica relacionada con los chats en la aplicación.
 * Provee acceso a los chats y chats suscritos, así como funciones para cargarlos y actualizarlos.
 *
 * @param {function} dispatch - Función de dispatch de Redux para actualizar el estado global.
 * @param {React.MutableRefObject<boolean>} connectedRef - Referencia mutable que indica si ya se hizo la conexión WebSocket.
 * @param {function} setIsLoading - Función para manejar el estado de carga durante la obtención de datos.
 * @returns {object} - Objeto con los datos de los chats, setters y funciones para obtener y actualizar los datos.
 */
const useContextChats = (dispatch, connectedRef, setIsLoading) => {
  // Hook para gestionar los datos de los chats generales
  const {
    data: chats,
    setData: setChats,
    fetcherGet: getChats,
    fetcherPut,
  } = DataHooks(dispatch, connectedRef);

  // Hook para gestionar los datos de los chats con suscripción (WebSocket)
  const {
    data: chatsSubscribe,
    setData: setChatsSubscribe,
    fetcherGet: getChatsSubscribe,
  } = DataHooks(dispatch, connectedRef);

  /**
   * Carga los chats desde la API.
   * - chatsSubscribe: normalmente vinculados a la suscripción WebSocket.
   * - chats: datos generales de los chats (por ejemplo, historial).
   */
  const loadChats = () => {
    getChatsSubscribe(`/api/chats`, setIsLoading);
    getChats(`/api/chats`);
  };

  return {
    chats,
    setChats,
    chatsSubscribe,
    setChatsSubscribe,
    loadChats,
    fetcherPut, // útil para actualizar datos de chats (PUT requests)
  };
};

export default useContextChats;
