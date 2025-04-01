import { useState, useMemo } from "react";
import { Search, ArrowLeft } from "lucide-react";
import FormatearFecha from "./FormatearFecha";
import ChatsListItem from "./ChatsListItem";
import DataHooks from "@/functions/DataHooks";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import UserAvatar2 from "./UserAvatar2";

const SearchBar = ({
  placeholder,
  data,
  filterFunc,
  onSelect,
  searchQuery,
  setSearchQuery,
}) => {
  const [onFocus, setOnFocus] = useState(false);
  const useLoguer = useSelector((state) => state.user);
  const { setChats, setChatsSubscribe, setIsLoading, connectedRef } = useAuth();
  const router = useRouter();
  const dispatch = useDispatch();
  const { getOrCreateChat } = DataHooks(dispatch, connectedRef);

  // Función para dividir el mensaje con resaltado
  const highlightMatch = (text, query) => {
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;

    const before = text.slice(0, index);
    const match = text.slice(index, index + query.length);
    const after = text.slice(index + query.length);

    return (
      <>
        {before}
        <span
          className="text-black font-bold"
          style={{ backgroundColor: "var(--bg-chat)" }}
        >
          {match}
        </span>
        {after}
      </>
    );
  };

  const searchResults = useMemo(() => {
    if (searchQuery.trim() === "") return [];
    return filterFunc(data, searchQuery);
  }, [searchQuery, data]);

  return (
    <div className="relative">
      <div className="items-end flex search-container">
        {!onFocus ? (
          <Search className="ml-1 text-gray-400 m-auto" />
        ) : (
          <ArrowLeft className="ml-1 text-gray-400 m-auto" />
        )}
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onFocus={() => setOnFocus(true)}
          onBlur={() => setOnFocus(false)}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent pl-10 p-2 search-input"
        />
      </div>

      {searchResults.length > 0 && (
        <ul className="shadow-md absolute w-full z-10 search__list">
          {searchResults.map((item) => {
            return item.content ? (
              <li
                key={item.id}
                className="p-4 cursor-pointer border-t-[.05em] border-b-[.05em]"
                onClick={() => onSelect?.(item.id)}
                style={{
                  borderColor: "var(--bg-primary)",
                }}
              >
                <FormatearFecha createdAt={item.timestamp}></FormatearFecha>
                <p>{highlightMatch(item.content, searchQuery)}</p>
              </li>
            ) : item.username ? (
              <li
                key={item.id}
                className="flex items-center p-4 cursor-pointer border-t-[.05em] border-b-[.05em] mt-2"
                style={{
                  borderColor: "var(--bg-primary)",
                }}
                onClick={() =>
                  getOrCreateChat(
                    useLoguer.id,
                    item.id,
                    setChats,
                    router,
                    setIsLoading,
                    setChatsSubscribe
                  )
                }
              >
                <UserAvatar2
                  name={item.username}
                  idUser={item.id}
                  isConnected={item.active}
                  showInitials={true}
                />
                <p className="ml-2">{item.username}</p>
              </li>
            ) : (
              <div key={item.id}>
                <ChatsListItem chat={item}>
                  <div className="chat-list__item-info">
                    <span className="chat-list__item-name">
                      {highlightMatch(item.name, searchQuery)}
                    </span>
                    {item.lastMessage && (
                      <p className="chat-list__item-preview">
                        {highlightMatch(item.lastMessage.content, searchQuery)}
                      </p>
                    )}
                  </div>
                </ChatsListItem>
              </div>
            );
          })}
        </ul>
      )}

      {searchResults.length <= 0 && searchQuery.length > 0 && (
        <div className="h-[100px] flex justify-center items-center">
          <p>No se encontraron resultados</p>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
