import React from "react";
import { useAuth } from "@/context/AuthContext";
const LoadingOverlay = () => {
  const { isLoading } = useAuth();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md z-50">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-white"></div>
        <p className="text-white mt-4">Cargando...</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
