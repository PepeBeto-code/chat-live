import { useState } from "react";
import SearchBar from "./SearchBar";
const ChatMessageSearch = ({ messages, onSelectMessage }) => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <SearchBar
      placeholder="Buscar mensaje..."
      data={messages}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      filterFunc={(messages, query) =>
        messages.filter((msg) => msg.content.toLowerCase().includes(query))
      }
      onSelect={onSelectMessage}
    />
  );
};

export default ChatMessageSearch;
