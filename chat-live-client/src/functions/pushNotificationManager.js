import DataHooks from "@/functions/DataHooks";

function pushNotificationManager(dispatch, connectedRef) {
  const PUBLIC_VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
  const { fetcherPost } = DataHooks(dispatch, connectedRef);

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

  function encodeUint8Array(array) {
    const binaryString = Array.from(array)
      .map((byte) => String.fromCharCode(byte))
      .join("");
    return btoa(binaryString);
  }

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
