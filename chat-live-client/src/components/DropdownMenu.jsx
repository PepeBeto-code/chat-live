import { useState, useRef, useEffect, useCallback } from "react";
import useClickOutside from "../hooks/useClickOutside";
const DropdownMenu = ({
  options,
  icon,
  right = true,
  isVisible,
  setIsVisible,
}) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState("bottom"); // 'bottom' o 'top'
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (open) setIsVisible?.(true);
  }, [open, isVisible]);

  useEffect(() => {
    if (open) {
      adjustPosition();
    }
  }, [open]);

  useClickOutside(menuRef, () => {
    setOpen(false);
    setIsVisible?.(false);
  }); // Se cerrará si se hace clic fuera

  const adjustPosition = useCallback(() => {
    if (!buttonRef.current || !menuRef.current) return;
    console.log("cuantas veces lo intentaron?");
    const buttonRect = buttonRef.current.getBoundingClientRect();

    setPosition(
      buttonRect.bottom + 100 > window.innerHeight - 100 ? "top" : "bottom"
    );
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Botón principal */}

      {isVisible && (
        <button
          ref={buttonRef}
          onClick={() => setOpen(!open)}
          className="flex items-center rounded-full transition-all duration-300"
        >
          {icon}
        </button>
      )}

      {/* Menú desplegable */}
      {open && (
        <div
          // onMouseLeave={() => setOpen(false)}
          className={`absolute ${right ? "right-0" : ""} ${
            position === "top" ? "bottom-full mb-2" : "mt-2"
          } w-48 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden transition-all duration-300 z-10`}
        >
          {options.map((option, index) => (
            <button
              key={index}
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
