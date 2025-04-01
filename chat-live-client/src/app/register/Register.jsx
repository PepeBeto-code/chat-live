"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import DataHooks from "../../functions/DataHooks";
import { useRouter } from "next/navigation";
import { getCookie } from "@/utils/cookies";
import Swal from "sweetalert2";

const Register = () => {
  const [userData, setUserData] = useState({});
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  const router = useRouter();

  const token = getCookie("token");

  useEffect(() => {
    if (token) {
      router.replace("/dashboard/home"); // ⚡ Redirigir solo después del primer render
    }
  }, [token]); // Se ejecuta solo cuando cambia `tokenDate`

  const { login } = DataHooks();
  const onChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setErrors({});
    console.log(userData);

    if (
      !userData.username ||
      !userData.password ||
      !userData.confirmPassword ||
      !userData.invitationCode
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Crear Cuenta
        </h2>
        {error && (
          <div className="p-3 text-center text-red-600 border border-red-600 rounded">
            {error}
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Nombre Completo
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              onChange={onChange}
              className="mt-1 block w-full  text-black px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tu nombre"
            />
            {errors.username && (
              <h6 className={"custom-error text-danger"}>{errors.username}</h6>
            )}
          </div>

          {/* <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Correo Electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              onChange={onChange}
              className="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="correo@ejemplo.com"
            />
          </div> */}

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
              required
              onChange={onChange}
              className="mt-1 block  text-black w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="********"
            />
            {errors.password && (
              <h6 className={"custom-error text-danger"}>{errors.password}</h6>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirmar Contraseña
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              onChange={onChange}
              className="mt-1 block  text-black w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="********"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Codigo de invitacion
            </label>
            <input
              id="invitationCode"
              name="invitationCode"
              type="text"
              required
              onChange={onChange}
              className="mt-1 block  text-black w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="aDfrhYTH"
            />
            {errors.invitationCode && (
              <h6 className={"custom-error text-danger"}>
                {errors.invitationCode}
              </h6>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 transition duration-200"
            >
              Registrarse
            </button>
          </div>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login">
            <span className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
              Inicia sesión
            </span>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
