import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { getInitialTheme, applyTheme } from "./services/themeService";

applyTheme(getInitialTheme());

ReactDOM.createRoot(document.getElementById("app")!).render(<App />);
