import React from "react";
import Avatar from "boring-avatars";
import { useSelector } from "react-redux";

function UserAvatar2({
  name,
  idUser,
  showInitials = true,
  isConnected = true,
  lg = false,
}) {
  const userColors = useSelector((state) => state.colors);

  const getInitials = (fullName) => {
    // Obtén las iniciales del nombre, separando por espacios
    return fullName
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="relative">
      <div
        className={`${lg ? "w-[12rem] h-[12rem]" : "w-[50px] h-[50px]"}`}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          overflow: "hidden",
          backgroundColor: userColors[idUser],
        }}
      >
        {showInitials ? (
          <div className="inline-block">
            <span
              className={`${lg ? "text-[6.5rem]" : "text-[1.5rem]"}`}
              style={{ fontWeight: "bold", color: "#fff" }}
            >
              {getInitials(name)}
            </span>
            <div
              className={`absolute ${
                lg
                  ? "bottom-[1.5rem] right-[1rem]"
                  : "bottom-[3px] right-[-3px]"
              } w-4 h-4 ${
                isConnected ? "bg-green-500" : "bg-gray-500"
              } border-2 rounded-full`}
            ></div>
          </div>
        ) : (
          <Avatar name={name} variant="marble" colors={colors} />
        )}
      </div>
    </div>
  );
}

export default UserAvatar2;
