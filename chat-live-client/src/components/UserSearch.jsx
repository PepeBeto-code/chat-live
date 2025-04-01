import { useState } from "react";
import SearchBar from "./SearchBar";
import { useAuth } from "../context/AuthContext";

const UserSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { users } = useAuth();

  return (
    <div>
      <h2 tabIndex="-1" style={{ padding: "1.2em 0.8em" }}>
        Nuevo chat
      </h2>
      <SearchBar
        placeholder="Buscar usuario..."
        data={users}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterFunc={(users, query) =>
          users.filter((user) => user.username.toLowerCase().includes(query))
        }
      />
    </div>
  );
};

export default UserSearch;
