import { useState } from "react";
import { getAnalytics } from "../services/api";

function Dashboard() {
  const [shortId, setShortId] = useState("");
  const [data, setData] = useState(null);

  const fetchData = async () => {
    try {
      const res = await getAnalytics(shortId);
      setData(res.data);
    } catch {
      alert("Not found");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>📊 Analytics Dashboard</h1>

      <input
        placeholder="Enter shortId"
        value={shortId}
        onChange={(e) => setShortId(e.target.value)}
        style={{ padding: "10px", width: "300px" }}
      />

      <br />

      <button
        onClick={fetchData}
        style={{
          marginTop: "10px",
          padding: "10px 20px",
          backgroundColor: "black",
          color: "white",
        }}
      >
        Get Analytics
      </button>

      {data && (
        <div style={{ marginTop: "20px" }}>
          <h3>Total Clicks: {data.totalClicks}</h3>
          <p>Visits: {data.visitHistory.length}</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;