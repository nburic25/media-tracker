import { useEffect, useState } from "react";

function AdminPanel() {
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    title: "",
    type_id: "",
    description: "",
    release_year: "",
    image: "",
    video_url: "",
  });

  const [mediaList, setMediaList] = useState([]);
  const [editId, setEditId] = useState(null);

  // LOAD MEDIA
  useEffect(() => {
    fetch("http://localhost:3000/media")
      .then((res) => res.json())
      .then((data) => setMediaList(data))
      .catch((err) => console.error(err));
  }, []);

  // ✍️ HANDLE INPUT
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // CREATE / EDIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editId) {
        // EDIT
        const res = await fetch(
          `http://localhost:3000/media/${editId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(form),
          }
        );

        const updated = await res.json();

        setMediaList((prev) =>
          prev.map((m) => (m.id === editId ? updated : m))
        );

        setEditId(null);
      } else {
        // CREATE
        const res = await fetch("http://localhost:3000/media", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        });

        const newMedia = await res.json();

        setMediaList((prev) => [newMedia, ...prev]);
      }

      // reset form
      setForm({
        title: "",
        type_id: "",
        description: "",
        release_year: "",
        image: "",
        video_url: "",
      });

    } catch (err) {
      console.error(err);
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this media?")) return;

    try {
      await fetch(`http://localhost:3000/media/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMediaList(mediaList.filter((m) => m.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // EDIT
  const handleEdit = (item) => {
    setEditId(item.id);

    setForm({
      title: item.title,
      type_id: item.type_id,
      description: item.description,
      release_year: item.release_year,
      image: item.image,
      video_url: item.video_url,
    });

    window.scrollTo(0, 0);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Panel</h1>

      {/* FORM */}
      <form onSubmit={handleSubmit} style={{ maxWidth: "400px" }}>
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
        />

        <input
          name="type_id"
          placeholder="Type (1=Movie, 2=Series, 3=Game)"
          value={form.type_id}
          onChange={handleChange}
          required
        />

        <input
          name="release_year"
          placeholder="Year"
          value={form.release_year}
          onChange={handleChange}
        />

        <input
          name="image"
          placeholder="Image URL"
          value={form.image}
          onChange={handleChange}
        />

        <input
          name="video_url"
          placeholder="YouTube URL"
          value={form.video_url}
          onChange={handleChange}
        />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />

        <button type="submit">
          {editId ? "Update Media" : "Add Media"}
        </button>
      </form>

      <hr style={{ margin: "40px 0" }} />

      {/* MEDIA LIST */}
      <h2>All Media</h2>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
        {mediaList.map((item) => (
          <div
            key={item.id}
            style={{
              width: "180px",
              border: "1px solid #ddd",
              padding: "10px",
              borderRadius: "10px",
            }}
          >
            <img
              src={item.image}
              alt={item.title}
              style={{
                width: "100%",
                height: "220px",
                objectFit: "cover",
                borderRadius: "5px",
              }}
            />

            <p style={{ fontWeight: "bold" }}>{item.title}</p>

            <div style={{ display: "flex", gap: "5px" }}>
              <button onClick={() => handleEdit(item)}>Edit</button>
              <button onClick={() => handleDelete(item.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminPanel;