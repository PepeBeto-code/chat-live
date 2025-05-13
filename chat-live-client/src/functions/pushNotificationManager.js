import DataHooks from "@/functions/DataHooks";

/**
 * Gestor de notificaciones push para suscribirse a Web Push Notifications.
 *
 * @param {Function} dispatch - Función dispatch de Redux para usar con DataHooks.
 * @param {React.MutableRefObject<boolean>} connectedRef - Referencia al estado de conexión WebSocket.
 * @returns {{
 *   checkNotificationPermission: () => Promise<void>
 * }} Funciones públicas para gestionar permisos y suscripción.
 */
function pushNotificationManager(dispatch, connectedRef) {
  const PUBLIC_VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
  const { fetcherPost } = DataHooks(dispatch, connectedRef);

  /**
   * Convierte una clave VAPID en base64 a un Uint8Array.
   *
   * @param {string} base64String - Clave VAPID en base64.
   * @returns {Uint8Array} Clave decodificada como Uint8Array.
   */
  function urlB64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");
    const rawData = window.atob(base64);
    const uint8Array = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      uint8Array[i] = rawData.charCodeAt(i);
    }

    return uint8Array;
  }

  /**
   * Codifica un Uint8Array en base64.
   *
   * @param {Uint8Array} array - Arreglo de bytes.
   * @returns {string} Cadena en base64.
   */
  function encodeUint8Array(array) {
    const binaryString = Array.from(array)
      .map((byte) => String.fromCharCode(byte))
      .join("");
    return btoa(binaryString);
  }

  /**
   * Suscribe al usuario al servicio de notificaciones push.
   *
   * - Si ya existe una suscripción, se elimina y se crea una nueva.
   * - Envía la suscripción al backend para su almacenamiento.
   *
   * @returns {Promise<void>}
   */
  async function subscribeToPush() {
    const registration = await navigator.serviceWorker.ready;

    // Obtener suscripción actual
    const existingSubscription =
      await registration.pushManager.getSubscription();

    if (existingSubscription) {
      console.log("Eliminando suscripción existente...");
      await existingSubscription.unsubscribe(); // Desuscribirse antes de registrar una nueva
    }

    const newSubscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlB64ToUint8Array(PUBLIC_VAPID_KEY),
    });

    console.log("Nueva suscripción creada:", newSubscription, PUBLIC_VAPID_KEY);

    const keyArray = newSubscription.getKey("p256dh");
    const authArray = newSubscription.getKey("auth");

    if (keyArray && authArray) {
      const encodedKey = encodeUint8Array(new Uint8Array(keyArray));
      const encodedAuth = encodeUint8Array(new Uint8Array(authArray));

      const requestData = {
        p256dh: encodedKey,
        auth: encodedAuth,
        endpoint: newSubscription.endpoint,
      };

      console.log("requestData", requestData);
      // Enviar suscripción al backend
      await fetcherPost("/api/push/subscribe", requestData);
    }
  }

  /**
   * Verifica el permiso de notificaciones y solicita suscripción si es necesario.
   *
   * - Si ya está concedido, suscribe directamente.
   * - Si no está denegado, solicita permiso y suscribe si es aceptado.
   *
   * @returns {Promise<void>}
   */
  async function checkNotificationPermission() {
    if (Notification.permission === "granted") {
      await subscribeToPush();
    } else if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        await subscribeToPush();
      }
    }
  }

  return {
    checkNotificationPermission,
  };
}

export default pushNotificationManager;
