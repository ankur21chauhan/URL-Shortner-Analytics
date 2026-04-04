import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000"
});

export const createShortUrl = (data) => API.post("/short", data);

export const getAnalytics = (shortId) =>
  API.get(`/analytics/${shortId}`);