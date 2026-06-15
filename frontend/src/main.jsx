import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import SocketContext from "./SocketContext";
import ConnectionsContext from "./contexts/ConnectionsContext";
import { ThemeProvider } from "./components/ThemeProvider";

createRoot(document.getElementById("root")).render(
    <BrowserRouter>
        <SocketContext>
            <ConnectionsContext>
                <ThemeProvider>
                    <App />
                </ThemeProvider>
            </ConnectionsContext>
        </SocketContext>
        <Toaster />
    </BrowserRouter>,
);
