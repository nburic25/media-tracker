import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
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
      </div>

      {/* RIGHT */}
      <div>
        {user ? (
          <>
            <span style={{ marginRight: "10px" }}>{user.username}</span>
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