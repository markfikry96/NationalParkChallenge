import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set page title
document.title = "NPS Rank - Vote on National Parks";

createRoot(document.getElementById("root")!).render(<App />);
