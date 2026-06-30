import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      navigate(`/?search=${search}`);
    }
  };

  const handleSearchClick = () => {
    navigate(`/?search=${search}`);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "10px 20px",
        borderBottom: "1px solid #ddd",
        alignItems: "center",
      }}
    >
      {/* LEFT */}
      <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>Media Tracker</h3>

        <Link to="/">Home</Link>

        {user && <Link to="/my-list">My List</Link>}

        {/* 🔎 ADVANCED SEARCH
        <Link to="/advanced-search">Advanced</Link> */}

        {/* 🔥 ADMIN */}
        {user && Number(user.role_id) === 1 && (
          <Link to="/admin">Admin Panel</Link>
        )}

        {/* 🔍 QUICK SEARCH */}
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearch}
          style={{ padding: "5px" }}
        />

        <button onClick={handleSearchClick}>Search</button>

        {/* 🔎 ADVANCED SEARCH */}
        <Link to="/advanced-search">Advanced Search</Link>
      </div>

      {/* RIGHT */}
      <div>
        {user ? (
          <>
            <span style={{ marginRight: "10px" }}>
              {user.username}
            </span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>{" "}
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default Navbar;