import axios from "axios";

const api = axios.create({
    baseURL: "https://planificador-backend-fast.onrender.com",
    headers: { "Content-Type": "application/json" },
});

export default api;