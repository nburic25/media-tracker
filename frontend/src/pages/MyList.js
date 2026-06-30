import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MyList() {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  console.log("TOKEN:", token);

  // DEBUG
  useEffect(() => {
    console.log("MY LIST DATA:", items);
  }, [items]);

  // FETCH USER LIST
  useEffect(() => {
  if (!token) return;

  fetch("http://localhost:3000/user-media", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("API RESPONSE:", data);

      // ✅ SIGURNOSNA PROVJERA
      if (Array.isArray(data)) {
        setItems(data);
      } else {
        console.error("Backend error response:", data);
        setItems([]); // fallback da ne puca filter
      }
    })
    .catch((err) => {
      console.error("Fetch error:", err);
      setItems([]); // fallback
    });
}, [token]);

  // FILTERS (STRING STATUS - BACKEND FORMAT)
  const wishlist = items.filter((i) => i.status === "wishlist");
  const watching = items.filter((i) => i.status === "watching");
  const completed = items.filter((i) => i.status === "completed");

  const renderSection = (title, data) => (
    <div style={{ marginBottom: "30px" }}>
      <h2>{title}</h2>

      {data.length === 0 ? (
        <p>No items</p>
      ) : (
        <div
          style={{
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
          }}
        >
          {data.map((item) => {
            // // DEBUG IMAGE
            // console.log("IMAGE:", item.image);

            return (
              <div
                key={item.id}
                onClick={() => navigate(`/media/${item.media_id}`)}
                style={{
                  width: "150px",
                  border: "1px solid #ddd",
                  borderRadius: "10px",
                  padding: "10px",
                  cursor: "pointer",
                  transition: "0.2s",
                  backgroundColor: "#fff",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.05)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                {/* IMAGE SAFE RENDER */}
                <img
                  src={
                    item.image
                      ? item.image
                      : "https://placehold.co/300x450?text=No+Image"
                  }
                  alt={item.title}
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
                    borderRadius: "5px",
                  }}
                />

                <p
                  style={{
                    marginTop: "5px",
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                >
                  {item.title}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ padding: "20px" }}>
      <h1>My List</h1>

      {renderSection("⭐ Wishlist", wishlist)}
      {renderSection("▶️ Watching", watching)}
      {renderSection("✔ Completed", completed)}
    </div>
  );
}

export default MyList;