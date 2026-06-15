import React, { createContext, useState } from "react";

export const connectionsContext = createContext();

const ConnectionsContext = ({ children }) => {
  const [connections, setConnections] = useState(() => new Map());
  const [participants, setParticipants] = useState([]);

  return (
    <connectionsContext.Provider
      value={{ connections, setConnections, participants, setParticipants }}
    >
      {children}
    </connectionsContext.Provider>
  );
};

export default ConnectionsContext;
