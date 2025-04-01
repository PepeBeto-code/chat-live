import { useState } from "react";
import axios from 'axios';
import AxiosInstance from './AxiosInstance';
import Swal from "sweetalert2";
import toast from "react-hot-toast";

export const DataHooks = (dispatch = () => {},connectedRef = { current: ""}) => {
  const [isLoading, setIsLoading] = useState(false);
  const {instance} = AxiosInstance(dispatch,connectedRef);
 const [data , setData] = useState();

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

 const getOrCreateChat = async (senderId, receiverId, setChats, router, setIsLoading, setChatsSubscribe) => {
  setIsLoading(true);
  try {
    const chat = await fetcherPost('/api/chats/start', {
      senderId: senderId,
      receiverId: receiverId
    })
    setChatsSubscribe(prevChats => [...prevChats, chat])
    setChats(prevChats => [...prevChats, chat] )
    router.push(`/dashboard/chat/${chat.id}`, { shallow: true });
  } catch (error) {
    console.log(error)
  } finally {
    setIsLoading(false);
  }
}

 const login = async (url,data) =>  {
  setIsLoading(true)
  let token = "";
  await axios.post(url, data)
      .then((data) => {
          token = data.data;
      })
      .catch(err => {
        toast.error("Ocurrio un error!", {
          reverseOrder: true,
          position: "top-left",
        });
        throw err;
      })
      .finally(
          () => {
            setIsLoading(false)
          }
      );
      return token;
}

  const fetcherPost = async (url,data) =>  {
    let token = "";
    await instance.post(url, data)
        .then((data) => {
            token = data.data;
        })
        .catch(err => {
          throw err;
        })
        .finally(
            () => {

            }
        );
        return token;
  }

  const fetcherDeleted = async (url,data) =>  {
    console.log("Deleted", url)

    let deleted = "";
    await instance.delete(url, data)
        .then((data) => {
          deleted = data.data;
        })
        .catch(err => {
          throw err;
        });
        return deleted;
  }

  const fetcherPut = async (url,data) =>  {
    console.log("Put: ", url)

    let put = "";
    await instance.put(url, data)
        .then((data) => {
          put = data.data;
        })
        .catch(err => {
          throw err;
        });

        return put;
  }

  const fetcherGet = async (url, setIsLoading = () => {}) =>  {
    console.log("Get: ", url)
    setIsLoading(true)
    await instance.get(url)
        .then((data) => {
          console.log("Get: ", url,data.data)

            setData( data.data);
        })
        .catch(err => {
                if ([500, 502, 503, 506].includes(err.response.status)) {
                  Swal.fire(
                    "Nuestros servidores están reiniciando debido a inactividad. Por favor, intenta de nuevo en unos minutos.",
                    "",
                    "info"
                  );
                }
          throw err;
        })
        .finally(
            () => {
              setIsLoading(false)
            }
        );
  }

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
    isLoading
  };
};

export default DataHooks
