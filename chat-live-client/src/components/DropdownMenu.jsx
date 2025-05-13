import { useState, useRef, useEffect, useCallback } from "react";
import useClickOutside from "../hooks/useClickOutside";

/**
 * Componente accesible de menú desplegable.
 * Permite mostrar una lista de opciones con navegación por teclado (flechas, Enter, Escape)
 * y control con el mouse. Usa ARIA roles para mejorar la accesibilidad con lectores de pantalla.
 *
 * Props:
 * @param {Array} options - Lista de opciones del menú. Cada opción debe tener:
 *   - label: Texto a mostrar.
 *   - action: Función a ejecutar al seleccionar.
 *   - icon: (opcional) Ícono a mostrar junto al texto.
 *   - danger: (opcional) Si es true, aplica estilo de advertencia.
 *   - params: (opcional) Array de argumentos para la acción.
 * @param {ReactNode} icon - Ícono o contenido del botón que activa el menú.
 * @param {boolean} right - Si es true, el menú se alinea a la derecha del botón. (default: true)
 * @param {boolean} isVisible - Determina si se debe mostrar el botón (por hover externo).
 * @param {function} setIsVisible - Función para cambiar el estado visible externo.
 */
const DropdownMenu = ({
  options,
  icon,
  right = true,
  isVisible,
  setIsVisible,
}) => {
  const [open, setOpen] = useState(false); // Estado local del menú (abierto/cerrado)
  const [position, setPosition] = useState("bottom"); // Posición del menú ('bottom' o 'top')
  const [focusedIndex, setFocusedIndex] = useState(null); // Índice del ítem enfocado al navegar con teclado

  const menuRef = useRef(null); // Referencia al contenedor del menú (para cerrar al hacer click afuera)
  const buttonRef = useRef(null); // Referencia al botón principal
  const itemRefs = useRef([]); // Referencias a los botones del menú (para enfocar con teclado)

  // Abre el menú y marca como visible externamente
  useEffect(() => {
    if (open) {
      if (!isVisible) {
        setIsVisible?.(true);
      }
      // Solo si el índice no ha sido tocado aún
      if (focusedIndex === null) {
        setFocusedIndex(0);
      }
    }
  }, [open, setIsVisible]);

  // Ajusta la posición del menú según el espacio disponible
  useEffect(() => {
    if (open) {
      adjustPosition();
    }
  }, [open]);

  // Cierra el menú si se hace clic fuera
  useClickOutside(menuRef, () => {
    setOpen(false);
    setIsVisible?.(false);
  });

  /**
   * Determina si se debe abrir el menú hacia arriba o abajo según el espacio disponible
   */
  const adjustPosition = useCallback(() => {
    if (!buttonRef.current || !menuRef.current) return;
    const buttonRect = buttonRef.current.getBoundingClientRect();

    setPosition(
      buttonRect.bottom + 100 > window.innerHeight - 100 ? "top" : "bottom"
    );
  }, []);

  /**
   * Maneja la navegación del menú con teclado
   */
  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1) % options.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev - 1 + options.length) % options.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      options[focusedIndex].action?.(...(options[focusedIndex].params || []));
      setOpen(false);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  // Cambia el foco al elemento actual si cambia el índice
  useEffect(() => {
    if (open && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex].focus();
    }
  }, [focusedIndex, open]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Botón que abre/cierra el menú */}
      {isVisible && (
        <button
          ref={buttonRef}
          onClick={() => setOpen(!open)}
          className="flex items-center rounded-full transition-all duration-300"
          aria-haspopup="true"
          aria-expanded={open}
          aria-controls="dropdown-menu"
        >
          {icon}
        </button>
      )}

      {/* Menú desplegable */}
      {open && (
        <div
          id="dropdown-menu"
          role="menu"
          aria-label="Opciones del menú"
          // onMouseLeave={() => setOpen(false)}
          className={`absolute ${right ? "right-0" : ""} ${
            position === "top" ? "bottom-full mb-2" : "mt-2"
          } w-48 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden transition-all duration-300 z-10`}
          onKeyDown={handleKeyDown}
        >
          {options.map((option, index) => (
            <button
              key={index}
              ref={(el) => (itemRefs.current[index] = el)}
              role="menuitem"
              tabIndex={-1}
              onClick={() => {
                option.action?.(...(option.params || []));
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-800 ${
                option.danger ? "hover:bg-red-100 text-red-600" : ""
              }`}
            >
              {option.icon} {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
