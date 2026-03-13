import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import configureAxios from "./config/axiosConfig.ts";

// Configure axios error handling
configureAxios();

createRoot(document.getElementById("root")!).render(<App />);
