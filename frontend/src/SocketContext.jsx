import { createContext, useMemo } from "react";
import { io } from "socket.io-client";

export const socketContext = createContext();

const SocketContextProvider = ({ children }) => {
  const socket = useMemo(() =>
    io(import.meta.env.VITE_SERVER_URL, { withCredentials: true }),
  );
  console.log(socket);

  return (
    <socketContext.Provider value={socket}>{children}</socketContext.Provider>
  );
};
export default SocketContextProvider;
