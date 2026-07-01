import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState("");

  const params = new URLSearchParams(location.search);
  const activeType = params.get("type");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      const type = params.get("type");
      let url = `/?search=${search}`;
      if (type) url += `&type=${type}`;
      navigate(url);
    }
  };

  const linkStyle = (type) => ({
    padding: "6px 10px",
    borderRadius: "6px",
    textDecoration: "none",
    backgroundColor:
      String(activeType) === String(type) ? "#333" : "transparent",
    color: "white",
  });

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "10px 20px",
        background: "#5d2828",
        color: "white",
        alignItems: "center",
        boxShadow: "0 2px 10px rgba(217, 209, 209, 0.5)"
      }}
    >
      {/* LEFT */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>MediaTracker</h3>

        <Link to="/" style={{ color: "white" }}>All</Link>

        <Link style={linkStyle(1)} to="/?type=1">Movies</Link>
        <Link style={linkStyle(2)} to="/?type=2">Series</Link>
        <Link style={linkStyle(3)} to="/?type=3">Games</Link>

        {/* USER LINKS */}
        {user && (
          <>
            <Link to="/my-list" style={{ color: "white" }}>
              My List
            </Link>
          </>
        )}

        {/* ADMIN ONLY */}
        {user && Number(user.role_id) === 1 && (
          <Link to="/admin" style={{ color: "white" }}>
            Admin Panel
          </Link>
        )}

      </div>

      <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginLeft: "10px",
  }}
>
  {/* SEARCH */}
  <input
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    onKeyDown={handleSearch}
    placeholder="Search..."
    style={{
      padding: "5px",
      borderRadius: "4px",
      border: "1px solid #444",
    }}
  />

  {/* ADVANCED SEARCH */}
  <Link to="/advanced-search" style={{ color: "white" }}>
    Advanced
  </Link>
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
            <Link to="/login" style={{ color: "white" }}>Login</Link>

            <Link to="/register" style={{ color: "white", marginLeft: "10px" }}>
              Register
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default Navbar;