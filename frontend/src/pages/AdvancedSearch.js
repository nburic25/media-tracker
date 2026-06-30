import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdvancedSearch() {
  const [media, setMedia] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [filters, setFilters] = useState({
    type: "",
    year: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3000/media")
      .then((res) => res.json())
      .then((data) => {
        setMedia(data);
        setFiltered(data);
      })
      .catch((err) => console.error(err));
  }, []);

  const getTypeName = (type_id) => {
    if (type_id === 1) return "Movie";
    if (type_id === 2) return "Series";
    if (type_id === 3) return "Game";
    return "Unknown";
  };

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const applyFilters = () => {
    let result = media;

    if (filters.type) {
      result = result.filter(
        (m) => m.type_id === Number(filters.type)
      );
    }

    if (filters.year) {
      result = result.filter(
        (m) => String(m.release_year) === filters.year
      );
    }

    setFiltered(result);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Advanced Search</h1>

      {/* FILTERS */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <select name="type" onChange={handleChange}>
          <option value="">All Types</option>
          <option value="1">Movie</option>
          <option value="2">Series</option>
          <option value="3">Game</option>
        </select>

        <input
          name="year"
          placeholder="Year (e.g. 2020)"
          onChange={handleChange}
        />

        <button onClick={applyFilters}>Apply</button>
      </div>

      {/* RESULTS */}
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => navigate(`/media/${item.id}`)}
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              width: "200px",
              cursor: "pointer",
            }}
          >
            <img
              src={item.image}
              alt={item.title}
              style={{
                width: "100%",
                height: "250px",
                objectFit: "cover",
              }}
            />

            <div style={{ padding: "10px" }}>
              <h3>{item.title}</h3>
              <p>
                {getTypeName(item.type_id)} • {item.release_year}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdvancedSearch;