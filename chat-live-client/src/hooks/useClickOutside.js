import { useEffect, useRef } from "react";

// Guardamos las referencias y sus callbacks
const refs = [];

const useClickOutside = (ref, callback) => {
  const savedCallback = useRef(callback);

  // Guardamos el callback en el ref para evitar que cambie
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    // Agregar la referencia y el callback a la lista
    refs.push({ ref, callback: savedCallback.current });

    const handleClickOutside = (event) => {
      // Iteramos sobre todas las referencias
      refs.forEach(({ ref, callback }) => {
        if (ref.current && !ref.current.contains(event.target)) {
          callback();
        }
      });
    };

    // Agregar un solo listener para todos los componentes
    document.addEventListener("mousedown", handleClickOutside);

    // Limpiar el listener cuando el componente se desmonte o ref se cambie
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      const index = refs.findIndex((item) => item.ref === ref);
      if (index !== -1) refs.splice(index, 1);
    };
  }, [ref]);  // Solo dependemos de la referencia, no del callback directamente.
};

export default useClickOutside;
