import React, { useContext, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import PreMeeting from "./PreMeeting";
import Meeting from "./Meeting";
import { socketContext } from "./SocketContext";
import AuthForm from "./AuthForm";

const App = () => {
  const socket = useContext(socketContext);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Socket connected.");
    });

    socket.emit("join_room_socket");

    return () => {
      socket.off("connect");
    };
  }, []);

  return (
    <Routes>
      <Route path="/" element={<PreMeeting />} />
      <Route path="/signup" element={<AuthForm />} />
      <Route path="/room/:id" element={<Meeting />} />
    </Routes>
  );
};

export default App;
