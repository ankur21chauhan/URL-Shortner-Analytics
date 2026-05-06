import axios from "axios";

const API = axios.create({
  baseURL: "https://url-shortner-analytics-78yb.onrender.com"
});

export const createShortUrl = (data) => API.post("/short", data);

export const getAnalytics = (shortId) =>
  API.get(`/analytics/${shortId}`);