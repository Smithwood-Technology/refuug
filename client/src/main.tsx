import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set page title
document.title = "Urban Nomad - Resource Finder";

// Add meta description for SEO
const metaDescription = document.createElement('meta');
metaDescription.name = 'description';
metaDescription.content = 'Find essential resources for unhoused individuals including shelters, food banks, wifi, water fountains, and more.';
document.head.appendChild(metaDescription);

createRoot(document.getElementById("root")!).render(<App />);
