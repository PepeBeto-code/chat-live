import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import UserAvatar2 from "./UserAvatar2";
import { Input } from "reactstrap";
import { X, Check, Pencil } from "lucide-react"; // Importar el ícono X de Lucide React
import DataHooks from "../functions/DataHooks";
import { setToken, setUser } from "../redux/actions";
import { setCookie } from "../utils/cookies";
import toast from "react-hot-toast";
import pushNotificationManager from "../functions/pushNotificationManager";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function Configuration() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const router = useRouter();
  // Estados locales para los switches
  const [isOnline, setIsOnline] = useState(user.active);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(user.notifications);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user.username || "Usuario");
  const [errors, setErrors] = useState({});
  const { setIsLoading, logout, connectedRef } = useAuth();
  const { fetcherPut, fetcherDeleted, showConfirmationDialog } = DataHooks(
    dispatch,
    connectedRef
  );

  const { checkNotificationPermission } = pushNotificationManager(
    dispatch,
    connectedRef
  );
  const onDarkMode = () => {
    document.body.classList.toggle("light-mode");
    setDarkMode(!darkMode);
  };

  const onIsOnline = async (isOnline) => {
    try {
      await fetcherPut(`/api/users/${user.id}/active`, {
        active: isOnline,
      });
      toast.success(`Estado Actualizado`, {
        reverseOrder: true, // Nuevas notificaciones aparecerán encima de las anteriores
        position: "top-left",
      });
      setIsOnline(isOnline);
    } catch (error) {
      toast.error("Ocurrio un error!", {
        reverseOrder: true,
        position: "top-left",
      });
    }
  };

  const onNotifications = async (notification) => {
    try {
      if (notification) {
        await checkNotificationPermission();
      } else {
        await fetcherDeleted("/api/push/unsubscribe");
      }
      if (Notification.permission === "granted") {
        dispatch(
          setUser({
            ...user,
            notifications: notification,
          })
        );
        setNotifications(notification);
        toast.success(
          `Notificaciones ${notification ? "Activadas" : "Desactivadas"}`,
          {
            reverseOrder: true, // Nuevas notificaciones aparecerán encima de las anteriores
            position: "top-left",
          }
        );
      } else {
        Swal.fire("Porfavor, activa las notificaciones.", "", "info");
      }
    } catch (error) {
      toast.error("Ocurrio un error!", {
        reverseOrder: true,
        position: "top-left",
      });
    }
  };

  // Función para actualizar el nombre (puedes adaptarlo a Redux)
  const handleSaveName = () => {
    setErrors({});

    showConfirmationDialog({
      confirmAction: async () => {
        setIsLoading(true);

        try {
          const data = await fetcherPut(`/api/users/${user.id}`, {
            username: newName,
          });
          connectedRef.current = false;
          dispatch(setUser(data.user));
          dispatch(setToken(data.token));
          setCookie("token", data.token);
          setNewName("");
          setIsEditing(false);
          toast.success("Usuario actualizado!", {
            reverseOrder: true, // Nuevas notificaciones aparecerán encima de las anteriores
            position: "top-left",
          });
          console.log("Usuario actualizado!", data);
        } catch (err) {
          if (err.response.status == 400) {
            setErrors(err.response.data);
          }
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  return (
    <div className="p-4 space-y-4">
      {/* Título */}
      <p className="font-bold text-2xl text-center">Configuración</p>

      {/* Perfil del usuario */}
      <div className="flex items-center space-x-4 p-4">
        <UserAvatar2
          isConnected={user.active}
          idUser={user.id}
          name={user.username}
          showInitials={true}
        ></UserAvatar2>
        <div className="relative">
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-40"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)",
                }}
                autoFocus
              />
              <Check className="cursor-pointer" onClick={handleSaveName} />
              <X
                className="cursor-pointer"
                onClick={() => {
                  setErrors({});
                  setNewName(user.username);
                  setIsEditing(false);
                }}
              />
            </div>
          ) : (
            <div
              className="flex items-center space-x-2 group cursor-pointer"
              onClick={() => setIsEditing(true)}
            >
              <p className="text-lg font-semibold">{user.username}</p>
              <Pencil className={`w-5 h-5 text-gray-500 transition-opacity`} />
            </div>
          )}
          {errors.username && (
            <h6 className={"custom-error text-danger"}>{errors.username}</h6>
          )}
          <p className="text-gray-500 text-sm">{user.email || "Sin correo"}</p>
        </div>
      </div>

      {/* Opciones */}
      <div className="space-y-4">
        {/* Activar estado */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <span className="text-lg">
            Estado: {isOnline ? "En línea 🟢" : "Desconectado ⚫"}
          </span>
          <Switch
            checked={isOnline}
            onCheckedChange={() => onIsOnline(!isOnline)}
          />
        </div>

        {/* Tema Oscuro */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <span className="text-lg">Modo oscuro</span>
          <Switch checked={darkMode} onCheckedChange={onDarkMode} />
        </div>

        {/* Notificaciones */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <span className="text-lg">Notificaciones</span>
          <Switch
            checked={notifications}
            onCheckedChange={() => onNotifications(!notifications)}
          />
        </div>
      </div>

      {/* Botón Cerrar Sesión */}
      <div
        className="text-center"
        onClick={() => {
          router.replace("/login");
          logout();
        }}
      >
        <Button variant="destructive" className="w-full">
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}
