"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import DataHooks from "../../functions/DataHooks";
import { useRouter } from "next/navigation";
import { getCookie } from "@/utils/cookies";
import Swal from "sweetalert2";

const Register = () => {
  // Estado para almacenar los datos del formulario
  const [userData, setUserData] = useState({});

  // Estados para manejar errores globales y específicos por campo
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  // Verifica si ya existe un token (usuario logueado) y redirige si es necesario
  const token = getCookie("token");
  useEffect(() => {
    if (token) {
      router.replace("/dashboard/home"); // ⚡ Redirigir solo después del primer render
    }
  }, [token]); // Se ejecuta solo cuando cambia `tokenDate`

  const { login, isLoading } = DataHooks();

  // Maneja los cambios en los inputs del formulario
  const onChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  // Envía los datos del formulario y realiza validaciones básicas del lado del cliente
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setErrors({});
    console.log(userData);

    if (
      !userData.username ||
      !userData.password ||
      !userData.confirmPassword
      // !userData.invitationCode
    ) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    if (userData.password !== userData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      const dataOut = await login("auth/register", userData);
      console.log(dataOut.user);
      router.push("/login");
    } catch (err) {
      if (err.response.status == 400) {
        setErrors(err.response.data);
      }
      if ([500, 502, 503, 506].includes(err.response.status)) {
        Swal.fire(
          "Nuestros servidores están reiniciando debido a inactividad. Por favor, intenta de nuevo en unos minutos.",
          "",
          "info"
        );
      }
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-white to-purple-100 px-4">
      <div className="w-full max-w-md p-8 bg-white/80 backdrop-blur rounded-2xl shadow-xl">
        <h2 className="text-center text-3xl font-bold text-gray-900">
          Crear Cuenta
        </h2>
        <p className="text-center text-sm text-gray-500 mb-4">
          Regístrate para acceder al chat
        </p>

        {error && (
          <div
            role="alert"
            className="p-3 mb-2 text-sm text-red-600 border border-red-500 rounded-md bg-red-50 text-center"
          >
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Username */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Nombre de usuario
            </label>
            <input
              id="username"
              type="text"
              name="username"
              required
              onChange={onChange}
              aria-invalid={!!errors.username}
              aria-errormessage={errors.username ? "username-error" : undefined}
              placeholder="Tu nombre"
              className="mt-1 w-full text-black px-4 py-2 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                placeholder="••••••••"
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

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirmar contraseña
            </label>
            <input
              type="password"
              name="confirmPassword"
              required
              onChange={onChange}
              placeholder="••••••••"
              className="mt-1 w-full text-black px-4 py-2 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            aria-busy={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-xl transition duration-200"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Spinner size="sm" /> Cargando...
              </div>
            ) : (
              "Registrarse"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Inicia sesión
          </Link>
        </div>

        <div className="absolute bottom-4 right-0 w-full text-center  text-xs text-gray-500">
          <p>Hecho con amor por Pepe Miñón</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
