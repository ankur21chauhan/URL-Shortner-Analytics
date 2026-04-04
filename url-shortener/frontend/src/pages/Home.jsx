import { useState } from "react";
import { createShortUrl } from "../services/api";

function Home() {
  const [url, setUrl] = useState("");
  const [customId, setCustomId] = useState("");
  const [shortUrl, setShortUrl] = useState("");

  const handleSubmit = async () => {
    try {
      const res = await createShortUrl({ url, customId });
      setShortUrl(res.data.shortUrl);
    } catch (err) {
      alert(err.response?.data?.error || "Error");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>🔗 URL Shortener</h1>

      <input
        placeholder="Enter URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{ padding: "10px", width: "300px", margin: "10px" }}
      />

      <br />

      <input
        placeholder="Custom ID (optional)"
        value={customId}
        onChange={(e) => setCustomId(e.target.value)}
        style={{ padding: "10px", width: "300px", margin: "10px" }}
      />

      <br />

      <button
        onClick={handleSubmit}
        style={{
          padding: "10px 20px",
          backgroundColor: "black",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Shorten
      </button>

      {shortUrl && (
        <div style={{ marginTop: "20px" }}>
          <p>✅ Short URL:</p>
          <a href={shortUrl} target="_blank">{shortUrl}</a>
        </div>
      )}
    </div>
  );
}

export default Home;