import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function MediaList() {
  const [media, setMedia] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const search = params.get("search") || "";
  const type = params.get("type") || "";

  useEffect(() => {
    fetch("http://localhost:3000/media")
      .then((res) => res.json())
      .then((data) => setMedia(data))
      .catch((err) => console.error(err));
  }, []);

  const getTypeName = (type_id) => {
    if (type_id === 1) return "Movie";
    if (type_id === 2) return "Series";
    if (type_id === 3) return "Game";
    return "Unknown";
  };

  const filteredMedia = media.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesType = type ? item.type_id === Number(type) : true;

    return matchesSearch && matchesType;
  });

  return (
    <div style={{ padding: "30px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "10px" }}>Media List</h1>

      {search && <p style={{ opacity: 0.7 }}>Search: "{search}"</p>}
      {type && (
        <p style={{ opacity: 0.7 }}>
          Filter: {getTypeName(Number(type))}
        </p>
      )}

      {filteredMedia.length === 0 ? (
        <p style={{ marginTop: "20px" }}>No results found</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/media/${item.id}`)}
              // className="media-card"
              style={{
                backgroundColor: "#212121",
                borderRadius: "10px",
                overflow: "hidden",
                cursor: "pointer",
                transition: "0.2s",
                boxShadow: "0 4px 10px rgba(94, 93, 93, 0.5)",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.transform = "scale(1.03)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              <img
                src={item.image}
                alt={item.title}
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/220x300";
                }}
                style={{
                  width: "100%",
                  height: "280px",
                  objectFit: "cover",
                }}
              />

              <div style={{ padding: "10px" }}>
              {/* <div className="media-card-content"> */}
                {/* <h3 className="media-card-title">{item.title}</h3> */}
                <h3 style={{ margin: "5px 0" }}>{item.title}</h3>
                {/* <p className="media-card-sub"> */}
                <p style={{ color: "#aaa", fontSize: "13px" }}>
                  {getTypeName(item.type_id)} • {item.release_year}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MediaList;