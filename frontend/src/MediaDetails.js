import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function MediaDetails() {
  const { id } = useParams();

  const [media, setMedia] = useState(null);
  const [userMedia, setUserMedia] = useState(null);

  const token = localStorage.getItem("token");

  // LOAD MEDIA
  useEffect(() => {
    fetch(`http://localhost:3000/media/${id}`)
      .then((res) => res.json())
      .then((data) => setMedia(data))
      .catch((err) => console.error(err));
  }, [id]);

  // LOAD USER MEDIA STATUS
  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:3000/user-media", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const current = data.find((m) => m.media_id === id);
        setUserMedia(current);
      })
      .catch((err) => console.error(err));
  }, [id, token]);

  const getTypeName = (type_id) => {
    if (type_id === 1) return "Movie";
    if (type_id === 2) return "Series";
    if (type_id === 3) return "Game";
    return "Unknown";
  };

  // YouTube embed fix
  const getEmbedUrl = (url) => {
    if (!url) return null;

    let videoId = "";

    if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1];
    }

    if (url.includes("watch?v=")) {
      videoId = url.split("watch?v=")[1];
    }

    videoId = videoId.split("?")[0];
    videoId = videoId.split("&")[0];

    return `https://www.youtube.com/embed/${videoId}`;
  };

  // USER ACTIONS (wishlist / watching / completed)
  const updateStatus = async (status_id) => {
    if (!token) return alert("Login required");

    try {
      if (userMedia) {
        await fetch(`http://localhost:3000/user-media/${userMedia.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status_id }),
        });
      } else {
        await fetch("http://localhost:3000/user-media", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            media_id: id,
            status_id,
            rating: null,
          }),
        });
      }

      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  if (!media) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>{media.title}</h1>

      <h3 style={{ margin: "0 0 10px 0" }}>Trailer</h3>

      {/* IMAGE + VIDEO */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          alignItems: "stretch",
        }}
      >
        {/* IMAGE */}
        <div style={{ flex: "0 0 300px" }}>
          <img
            src={media.image || "https://via.placeholder.com/300"}
            alt={media.title}
            style={{
              width: "100%",
              height: "400px",
              objectFit: "cover",
              borderRadius: "10px",
            }}
          />
        </div>

        {/* VIDEO */}
        <div style={{ flex: 1 }}>
          {media.video_url && (
            <iframe
              title="Trailer"
              style={{
                width: "100%",
                height: "400px",
                borderRadius: "10px",
                display: "block",
              }}
              src={getEmbedUrl(media.video_url)}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      </div>

      {/* INFO */}
      <div style={{ marginTop: "20px" }}>
        <p>
          <strong>{getTypeName(media.type_id)}</strong> •{" "}
          {media.release_year}
        </p>

        <p>{media.description}</p>
      </div>

      {/* USER ACTIONS */}
      <div style={{ marginTop: "20px" }}>
        <h3>Add To Your List</h3>
        
        <div style={{ display: "flex", gap: "10px" }}>  
            <button onClick={() => updateStatus(1)}>➕ Add to wishlist</button>
            <button onClick={() => updateStatus(2)}>▶️ Mark as watching</button>
            <button onClick={() => updateStatus(3)}>✔ Mark as completed</button>
        </div>
      </div>

      {/* RATING (frontend only for now) */}
      <div style={{ marginTop: "10px" }}>
        <h3>Add Rating</h3>

        <div style={{ display: "flex", gap: "8px" }}>
            {[1, 2, 3, 4, 5].map((r) => (
            <button key={r} onClick={() => alert(`Rating: ${r}`)}>
                {r} ⭐
            </button>
            ))}
        </div>
      </div>
    </div>
  );
}

export default MediaDetails;