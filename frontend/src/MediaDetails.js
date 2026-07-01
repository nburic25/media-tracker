import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function MediaDetails() {
  const { id } = useParams();

  const [media, setMedia] = useState(null);
  const [userMedia, setUserMedia] = useState(null);
  const [message, setMessage] = useState("");

  const [ratingData, setRatingData] = useState({
    avg_rating: 0,
    total_ratings: 0,
  });

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 3000);
    return () => clearTimeout(t);
  }, [message]);

  useEffect(() => {
    fetch(`http://localhost:3000/media/${id}`)
      .then((res) => res.json())
      .then(setMedia)
      .catch(console.error);
  }, [id]);

  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:3000/user-media", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const current = data.find((m) => m.media_id === Number(id));
        setUserMedia(current || null);
      })
      .catch(console.error);
  }, [id, token]);

  useEffect(() => {
    fetch(`http://localhost:3000/media/${id}/rating`)
      .then((res) => res.json())
      .then(setRatingData)
      .catch(console.error);
  }, [id]);

  useEffect(() => {
    fetch(`http://localhost:3000/comments/${id}`)
      .then((res) => res.json())
      .then(setComments)
      .catch(console.error);
  }, [id]);

  const handleAddComment = async () => {
    if (!token) return setMessage("Login required");
    if (!newComment.trim()) return setMessage("Empty comment");

    const res = await fetch("http://localhost:3000/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        media_id: Number(id),
        content: newComment,
      }),
    });

    const data = await res.json();
    setComments((prev) => [data, ...prev]);
    setNewComment("");
  };

  const updateStatus = async (status_id) => {
    if (!token) return setMessage("Login required");

    let updated;

    if (userMedia) {
      const res = await fetch(
        `http://localhost:3000/user-media/${userMedia.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status_id }),
        }
      );
      updated = await res.json();
    } else {
      const res = await fetch("http://localhost:3000/user-media", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          media_id: Number(id),
          status_id,
          rating: null,
        }),
      });
      updated = await res.json();
    }

    setUserMedia(updated);
  };

  const handleRating = async (rating) => {
    if (!token) return setMessage("Login required");
    if (!userMedia) return setMessage("Add to list first");

    const res = await fetch(
      `http://localhost:3000/user-media/${userMedia.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating }),
      }
    );

    const updated = await res.json();
    setUserMedia(updated);
  };

  if (!media) return <p style={{ padding: "20px" }}>Loading...</p>;

  return (
    <div style={{ padding: "30px", maxWidth: "1100px", margin: "0 auto" }}>
      <h1>{media.title}</h1>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <img
          src={media.image}
          alt={media.title}
          style={{
            width: "300px",
            borderRadius: "10px",
          }}
        />

        <div style={{ flex: 1 }}>
          {media.video_url && (() => {
            const getYoutubeId = (url) => {
              if (!url) return null;

              if (url.includes("youtu.be/")) {
                return url.split("youtu.be/")[1].split("?")[0];
              }

              if (url.includes("watch?v=")) {
                return url.split("watch?v=")[1].split("&")[0];
              }

              if (url.includes("embed/")) {
                return url.split("embed/")[1].split("?")[0];
              }

              return null;
            };

            const videoId = getYoutubeId(media.video_url);

            return (
              videoId && (
                <iframe
                  title={`${media.title} trailer`}
                  src={`https://www.youtube.com/embed/${videoId}`}
                  style={{ width: "100%", height: "300px" }}
                  frameBorder="0"
                  allowFullScreen
                />
              )
            );
          })()}
        </div>
      </div>

      <div style={{ marginTop: "20px" }}>{media.description}</div>

      <div style={{ marginTop: "20px" }}>
        <button onClick={() => updateStatus(1)}>Wishlist</button>
        <button onClick={() => updateStatus(2)}>Watching</button>
        <button onClick={() => updateStatus(3)}>Completed</button>
      </div>

      <div style={{ marginTop: "20px", background: "#1a1a1a", padding: "15px", borderRadius: "10px" }}>
        ⭐ Avg: {Number(ratingData.avg_rating).toFixed(1)} / 5
      </div>

      <div style={{ marginTop: "10px" }}>
        Your rating: {userMedia?.rating || "Not rated"}
      </div>

      <div style={{ marginTop: "20px" }}>
        {[1, 2, 3, 4, 5].map((r) => (
          <button key={r} onClick={() => handleRating(r)}>
            {r}⭐
          </button>
        ))}
      </div>

      <div style={{ marginTop: "30px" }}>
        <h3>Comments</h3>

        <div style={{ display: "flex", gap: "10px" }}>
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            style={{ flex: 1 }}
          />
          <button onClick={handleAddComment}>Post</button>
        </div>

        <div style={{ marginTop: "15px" }}>
          {comments.map((c) => (
            <div key={c.id} style={{ marginBottom: "10px" }}>
              <b>{c.username}</b>
              <p>{c.content}</p>
            </div>
          ))}
        </div>
      </div>

      {message && <p style={{ color: "red" }}>{message}</p>}
    </div>
  );
}

export default MediaDetails;