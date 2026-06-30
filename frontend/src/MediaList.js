import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MediaList() {
const [media, setMedia] = useState([]);
const navigate = useNavigate();

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

return (
<div style={{ padding: "20px" }}> <h1>Media List</h1>
  <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
    {media.map((item) => (
      <div
        key={item.id}
        onClick={() => navigate(`/media/${item.id}`)}
        style={{
          border: "1px solid #ccc",
          borderRadius: "10px",
          overflow: "hidden",
          width: "220px",
          cursor: "pointer"
        }}
      >
        <img
          src={item.image}
          alt={item.title}
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/220x300";
          }}
          style={{
            width: "100%",
            height: "300px",
            objectFit: "cover",
          }}
        />

        <div style={{ padding: "10px" }}>
          <h3>{item.title}</h3>
          <p style={{ color: "gray" }}>
            {getTypeName(item.type_id)} • {item.release_year}
          </p>
        </div>
      </div>
    ))}
  </div>
</div>
);
}

export default MediaList;
