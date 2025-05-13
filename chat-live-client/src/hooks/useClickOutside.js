import { useEffect, useRef } from "react";

// Guardamos las referencias y sus callbacks
const refs = [];

/**
 * Custom hook para detectar clics fuera de un elemento referenciado.
 *
 * @param {React.Ref} ref - La referencia del componente o elemento que se desea observar.
 * @param {Function} callback - La función que se ejecutará cuando se haga clic fuera del elemento.
 */
const useClickOutside = (ref, callback) => {
  // Utilizamos useRef para almacenar el callback de manera persistente durante el ciclo de vida del componente.
  const savedCallback = useRef(callback);

  // Este efecto asegura que siempre tengamos el callback más reciente.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    // Agregar la referencia y el callback a la lista
    refs.push({ ref, callback: savedCallback.current });

    /**
     * Función que maneja los clics fuera del área del ref.
     * Itera sobre todas las referencias almacenadas y ejecuta el callback
     * si el clic se realizó fuera del área del elemento.
     *
     * @param {MouseEvent} event - El evento de clic.
     */
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
  }, [ref]); // Solo dependemos de la referencia, no del callback directamente.
};

export default useClickOutside;
