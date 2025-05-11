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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Iniciar Sesión
        </h2>
        {errors.error && (
          <div
            role="alert"
            className="p-3 text-center text-red-600 border border-red-600 rounded"
          >
            {errors.error}
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Correo Electrónico
              </label>
              <input
                id="email"
                name="username"
                type="text"
                required
                aria-invalid={!!errors.username}
                aria-errormessage={
                  errors.username ? "username-error" : undefined
                }
                onChange={onChange}
                className="mt-1 block w-full px-3 py-2 border text-black rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="tucorreo@ejemplo.com.mx"
              />

              {errors.username && (
                <h6 id="username-error" className={"custom-error text-danger"}>
                  {errors.username}
                </h6>
              )}
            </div>
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                aria-invalid={!!errors.password}
                aria-errormessage={
                  errors.password ? "password-error" : undefined
                }
                onChange={onChange}
                className="mt-1 block w-full text-black px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="********"
              />
              {errors.password && (
                <h6 id="password-error" className={"custom-error text-danger"}>
                  {errors.password}
                </h6>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition duration-200"
            aria-busy={isLoading}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="sr-only">Iniciando sesión...</span>
                <span className="flex items-center gap-2">
                  Cargando <Spinner />
                </span>
              </>
            ) : (
              "Ingresar"
            )}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          ¿No tienes una cuenta?{" "}
          <Link
            href="/register"
            className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
