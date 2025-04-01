import { setToken } from "@/redux/actions";
import { getCookie, setCookie } from "@/utils/cookies";
import axios from "axios";

export const AxiosInstance = (dispatch) => {

    function isTokenExpired(token) {
        const payload = JSON.parse(atob(token.split('.')[1])); // Decodificar payload
        return payload.exp * 1000 < Date.now(); // Comparar con tiempo actual
    }
    
    async function refreshAccessToken() {
        try {
            const response = await axios.post('/auth/refresh-token', {
                refreshToken: getCookie('token'), // Recuperar el refresh token de la cookie
            });
            console.log("Token Renovano")

            const newAccessToken = response.data.accessToken;
            dispatch(setToken(newAccessToken))
            setCookie(newAccessToken); // Guardar el nuevo access token
            return newAccessToken;
        } catch (error) {
            console.error('Error al renovar el token:', error);
            logoutUser(); // Cerrar sesión si el refresh token no es válido
        }
    }    

    const instance = axios.create({
        headers: {
            Authorization: `Bearer ${getCookie('token')}`,
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest"
        }
    });

    instance.interceptors.request.use(async (config) => {
        const accessToken = getCookie('token');
    
        if (accessToken && isTokenExpired(accessToken)) {
            console.log("Token expirado......Renovando token......")
            const newAccessToken = await refreshAccessToken();
            config.headers.Authorization = `Bearer ${newAccessToken}`;
        } else if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
    
        return config;
    }, (error) => {
        return Promise.reject(error);
    });
    

    return {
        instance
    }
}

export default AxiosInstance