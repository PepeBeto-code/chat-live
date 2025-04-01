"use client";

import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { routes } from "../Variables/RoutesVariables";
import { useSelector } from "react-redux";
import UserAvatar from "./UserAvatar";
import ChatsList from "./ChatsList";
import UsersList from "./UsersList";
import DropdownMenu from "./DropdownMenu";
import { MessageSquareDiff } from "lucide-react";
import { slide as Menu } from "react-burger-menu";
import useClickOutside from "../hooks/useClickOutside";
import UserSearch from "./UserSearch";
import { Tooltip } from "reactstrap";
import Configuration from "./Configuration";
import { Switch } from "@/components/ui/switch";

const SideNav = () => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname().split("/")[2];
  const { logout, usersActive, users } = useAuth();
  const user = useSelector((state) => state.user);
  const router = useRouter();
  const [widthImg, setWidthImg] = useState("");
  const [heightImg, setHeightImg] = useState("");
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navRef = useRef(null);
  const [tooltipOpenMenu, setTooltipOpenMenu] = useState(false);
  const toggleMenu = () => setTooltipOpenMenu(!tooltipOpenMenu);
  const [tooltipOpenNewM, setTooltipOpenNewM] = useState(false);
  const toggleNewM = () => setTooltipOpenNewM(!tooltipOpenNewM);
  // useClickOutside(menuRef, () => setIsMenuOpen(false)); // Se cerrará si se hace clic fuera
  const [menuContent, setMenuContent] = useState("chat"); // 'chat' o 'settings'
  const handleStateChange = (state) => {
    setIsMenuOpen(state.isOpen);
  };

  const openChatMenu = () => {
    setMenuContent("chat");
    setIsMenuOpen(true);
  };

  const openSettingsMenu = () => {
    setMenuContent("settings");
    setIsMenuOpen(true);
  };

  const toggleTheme = () => {
    document.body.classList.toggle("light-mode");
    setIsDark(!isDark);
  };

  useEffect(() => {
    if (open) {
      setWidthImg("w-[6rem]");
      setHeightImg("h-[6rem]");
    } else {
      setWidthImg("w-[2rem]");
      setHeightImg("h-[2rem]");
    }
  }, [open]);

  if (!user) {
    return;
  }

  return (
    <div className={`duration-300 chat__sidebar w-[34rem]`} ref={navRef}>
      <div className="flex justify-between pr-2 pt-2">
        <Switch checked={isDark} onCheckedChange={toggleTheme} />
        <div className="flex w-[25%]">
          <div
            className="cursor-pointer m-auto hover"
            onClick={() => openChatMenu()}
            id="TooltipNewMessage"
          >
            <MessageSquareDiff></MessageSquareDiff>
            <Tooltip
              isOpen={tooltipOpenNewM}
              target={"TooltipNewMessage"}
              toggle={toggleNewM}
            >
              Nuevo mensaje
            </Tooltip>
          </div>
          <div className="m-auto hover" id="TooltipMenu">
            <DropdownMenu
              icon={<FontAwesomeIcon icon={faEllipsisVertical} />}
              isVisible={true}
              options={[
                {
                  label: "⚙️ Configuración",
                  action: () => openSettingsMenu(),
                },
                {
                  label: "🚪 Cerrar sesión",
                  action: () => logout(),
                  danger: true,
                },
              ]}
            />
            <Tooltip
              isOpen={tooltipOpenMenu}
              target={"TooltipMenu"}
              toggle={toggleMenu}
            >
              Menu
            </Tooltip>
          </div>
        </div>
      </div>
      <div className={`flex flex-col gap-x-4 items-center duration-300 h-full`}>
        {/* <UserAvatar
          imageSrc={user?.image}
          width="w-[6rem]"
          height="h-[6rem]"
        ></UserAvatar>
        <p className="chat__username origin-left font-medium text-xl duration-300">
          {user ? user.username : "Sin Usiario"}
        </p> */}
        {users?.some((u) => u.active && u.id != user.id) && (
          <p
            style={{ color: "var(--text-secondary)" }}
            className="w-full font-bold text-xl"
          >
            Usuarios Activos
          </p>
        )}
        {users?.some((u) => u.active && u.id != user.id) && (
          <UsersList actives={true}></UsersList>
        )}
        <p
          style={{ color: "var(--text-secondary)" }}
          className="w-full font-bold text-xl"
        >
          Chats
        </p>
        <ChatsList></ChatsList>
      </div>

      <div ref={menuRef}>
        <Menu
          isOpen={isMenuOpen}
          onStateChange={handleStateChange}
          customBurgerIcon={false}
          width={navRef?.current?.offsetWidth}
        >
          {menuContent === "chat" ? (
            <UserSearch></UserSearch>
          ) : (
            <Configuration></Configuration>
          )}
        </Menu>
      </div>
    </div>
  );
};

export default SideNav;
