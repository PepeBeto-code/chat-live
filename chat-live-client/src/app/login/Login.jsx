"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import DataHooks from "../../functions/DataHooks";
import { useDispatch, useSelector } from "react-redux";
import { setToken, setUser } from "../../redux/actions";
import { useRouter } from "next/navigation";
import { setCookie } from "../../utils/cookies";
import { Spinner } from "reactstrap";
import Swal from "sweetalert2";

const Login = () => {
  // Estado global de usuario autenticado
  const useLoguer = useSelector((state) => state.user);
  const router = useRouter();

  // Estado con los datos del formulario
  const [userData, setUserData] = useState({});

  // Estado para errores por campo
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();

  // Hook personalizado con funciones de login y loading
  const { login, isLoading } = DataHooks();

  // Maneja cambios en los campos del formulario
  const onChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    console.log(userData);
    setErrors({});
    e.preventDefault();
    try {
      const dataOut = await login("/auth/login", userData);
      console.log("LOLOLOGIN", dataOut.user);
      dispatch(
        setUser({
          ...dataOut.user,
          active: true,
        })
      );
      dispatch(setToken(dataOut.token));
      setCookie("token", dataOut.token);
      router.push("/dashboard/home");
    } catch (err) {
      if (err.response.status == 400) {
        setErrors(err.response.data);
      }
      if (err.response.status == 403) {
        setErrors({
          error: "Usuario y/o contraseña incorrectos",
        });
      }
      if ([500, 502, 503, 506].includes(err.response.status)) {
        Swal.fire(
          "Nuestros servidores están reiniciando debido a inactividad. Por favor, intenta de nuevo en unos minutos.",
          "",
          "info"
        );
      }
    }
  };

  // Redirige automáticamente si el usuario ya está autenticado
  useEffect(() => {
    if (useLoguer) {
      router.replace("/dashboard/home");
    }
  }, [useLoguer]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-white to-purple-100 px-4">
      <div className="w-full max-w-md p-8 bg-white/80 backdrop-blur rounded-2xl shadow-xl">
        <h2 className="text-center text-3xl font-bold text-gray-900">
          Bienvenido de nuevo
        </h2>
        <p className="text-center text-sm text-gray-500 mb-4">
          Ingresa con tus credenciales para acceder al chat.
        </p>

        {errors.error && (
          <div
            role="alert"
            className="p-3 mb-2 text-sm text-red-600 border border-red-500 rounded-md bg-red-50"
          >
            {errors.error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Email */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Usuario
            </label>
            <input
              id="username"
              type="text"
              name="username"
              autoFocus
              required
              onChange={onChange}
              aria-invalid={!!errors.username}
              aria-errormessage={errors.username ? "username-error" : undefined}
              placeholder="correo@ejemplo.com"
              className="mt-1 w-full px-4 text-black py-2 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {errors.username && (
              <p id="username-error" className="text-sm text-red-500 mt-1">
                {errors.username}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                required
                onChange={onChange}
                autoComplete="current-password"
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                aria-errormessage={
                  errors.password ? "password-error" : undefined
                }
                className="mt-1 w-full text-black px-4 py-2 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 text-sm focus:outline-none"
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="text-sm text-red-500 mt-1">
                {errors.password}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            aria-busy={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-xl transition duration-200"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Spinner size="sm" /> Iniciando...
              </div>
            ) : (
              "Ingresar"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            Regístrate
          </Link>
        </div>

        <div className="absolute bottom-4 right-0 w-full text-center  text-xs text-gray-500">
          <p>Hecho con amor por Pepe Miñón</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
