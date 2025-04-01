import { useEffect, useState } from "react";
import SearchBar from "./SearchBar";
const ChatSearch = ({ chats, setIsVisible }) => {
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (searchQuery.length > 0) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  }, [searchQuery]);

  return (
    <SearchBar
      placeholder="Buscar chat..."
      data={chats}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      filterFunc={(chats, query) =>
        chats.filter(
          (chat) =>
            chat.name.toLowerCase().includes(query) ||
            chat.lastMessage.content.toLowerCase().includes(query)
        )
      }
      onSelect={(chatId) => console.log(`Chat seleccionado: ${chatId}`)}
    />
  );
};

export default ChatSearch;
