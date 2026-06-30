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

  // AUTO CLEAR MESSAGE
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => setMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  // LOAD MEDIA
  useEffect(() => {
    fetch(`http://localhost:3000/media/${id}`)
      .then((res) => res.json())
      .then((data) => setMedia(data))
      .catch((err) => console.error(err));
  }, [id]);

  // LOAD USER MEDIA
  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:3000/user-media", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const current = data.find((m) => m.media_id === Number(id));
        setUserMedia(current || null);
      })
      .catch((err) => console.error(err));
  }, [id, token]);

  // LOAD AVERAGE RATING
  useEffect(() => {
    fetch(`http://localhost:3000/media/${id}/rating`)
      .then((res) => res.json())
      .then((data) => setRatingData(data))
      .catch((err) => console.error(err));
  }, [id]);

  // LOAD COMMENTS
  useEffect(() => {
    fetch(`http://localhost:3000/comments/${id}`)
      .then((res) => res.json())
      .then((data) => setComments(data))
      .catch((err) => console.error(err));
  }, [id]);

  // ADD COMMENT
  const handleAddComment = async () => {
    if (!token) {
      setMessage("You must be logged in");
      return;
    }

    if (!newComment.trim()) {
      setMessage("Comment cannot be empty");
      return;
    }

    try {
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
      setMessage("Comment added");
    } catch (err) {
      console.error(err);
      setMessage("Error adding comment");
    }
  };

  // STATUS UPDATE
  const updateStatus = async (status_id) => {
    if (!token) {
      setMessage("You must be logged in");
      return;
    }

    try {
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
      setMessage("List updated");
    } catch (err) {
      console.error(err);
      setMessage("Error updating");
    }
  };

  // RATING
  const handleRating = async (rating) => {
    if (!token) {
      setMessage("You must be logged in");
      return;
    }

    if (!userMedia) {
      setMessage("Add to list first");
      return;
    }

    try {
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

      setMessage(`Rating saved: ${rating} ⭐`);
    } catch (err) {
      console.error(err);
      setMessage("Error saving rating");
    }
  };

  const getTypeName = (type_id) => {
    if (type_id === 1) return "Movie";
    if (type_id === 2) return "Series";
    if (type_id === 3) return "Game";
    return "Unknown";
  };

  const getEmbedUrl = (url) => {
    if (!url) return null;

    let videoId = "";

    if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1];
    }

    if (url.includes("watch?v=")) {
      videoId = url.split("watch?v=")[1];
    }

    return `https://www.youtube.com/embed/${videoId
      .split("?")[0]
      .split("&")[0]}`;
  };

  if (!media) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>{media.title}</h1>

      {/* IMAGE + VIDEO */}
      <div style={{ display: "flex", gap: "20px" }}>
        <div style={{ flex: "0 0 300px" }}>
          <img
            src={media.image}
            alt={media.title}
            style={{
              width: "100%",
              height: "400px",
              objectFit: "cover",
              borderRadius: "10px",
            }}
          />
        </div>

        <div style={{ flex: 1 }}>
          {media.video_url && (
            <iframe
              title="Trailer"
              src={getEmbedUrl(media.video_url)}
              style={{
                width: "100%",
                height: "400px",
                borderRadius: "10px",
              }}
              frameBorder="0"
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

      {/* AVERAGE RATING */}
      <div style={{ marginTop: "15px" }}>
        <h3>Average Rating</h3>
        <p>
          ⭐ {Number(ratingData.avg_rating).toFixed(1)} / 5 (
          {ratingData.total_ratings})
        </p>
      </div>

      {/* YOUR RATING */}
      <div style={{ marginTop: "10px" }}>
        <h3>Your Rating</h3>
        <p>
          {userMedia?.rating
            ? `⭐ ${userMedia.rating} / 5`
            : "You haven't rated this yet"}
        </p>
      </div>

      {/* STATUS */}
      <div style={{ marginTop: "20px" }}>
        <h3>Add To List</h3>

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => updateStatus(1)}>Wishlist</button>
          <button onClick={() => updateStatus(2)}>Watching</button>
          <button onClick={() => updateStatus(3)}>Completed</button>
        </div>
      </div>

      {/* RATING */}
      <div style={{ marginTop: "15px" }}>
        <h3>Rate This</h3>

        <div style={{ display: "flex", gap: "8px" }}>
          {[1, 2, 3, 4, 5].map((r) => (
            <button key={r} onClick={() => handleRating(r)}>
              {r} ⭐
            </button>
          ))}
        </div>
      </div>

      {/* COMMENTS */}
      <div style={{ marginTop: "30px" }}>
        <h3>Comments</h3>

        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            style={{ flex: 1, padding: "8px" }}
          />
          <button onClick={handleAddComment} disabled={!newComment.trim()}>
            Post
          </button>
        </div>

        <div style={{ marginTop: "20px" }}>
          {comments.length === 0 ? (
            <p>No comments yet</p>
          ) : (
            comments.map((c) => (
              <div
                key={c.id}
                style={{
                  borderBottom: "1px solid #ddd",
                  padding: "10px 0",
                }}
              >
                <strong>{c.username}</strong>
                <p style={{ margin: "5px 0" }}>{c.content}</p>
                <small style={{ color: "gray" }}>
                  {new Date(c.created_at).toLocaleString()}
                </small>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MESSAGE */}
      {message && <p style={{ color: "red" }}>{message}</p>}
    </div>
  );
}

export default MediaDetails;