# Video Conferencing App

A peer-to-peer video calling app built with React, Node.js, Socket.IO and WebRTC. Users can create a meeting room or join an existing one using a room ID.

**Live Demo** https://video-meeting-application.vercel.app/signup

## How it works

Each user signs up with just an email — no passwords. The backend creates a persistent session via a cookie which is used to identify the user across socket connections and API calls.

When a user starts a meeting, a room is created on the server and they're redirected to that room. When someone joins using a room ID, the server returns a list of existing participants. The joining user then sends a WebRTC offer to each of them, and the mesh of peer connections is established through Socket.IO for signaling.

## Tech Stack

**Frontend**
- React + Vite
- React Router
- Socket.IO Client
- Axios
- Tailwind CSS + shadcn/ui
- Lucide React

**Backend**
- Node.js + Express
- Socket.IO
- MongoDB + Mongoose
- Cookie-based auth (no JWT)

## Getting Started

Clone the repo and install dependencies for both client and server.

```bash
# server
cd server
npm install

# client
cd client
npm install
```

Create a `.env` file in the server directory:

```
MONGO_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Create a `.env` file in the client directory:

```
VITE_SERVER_URL=http://localhost:3000
```

Start both:

```bash
# server
node index.js

# client
npm run dev
```

## Features

- Email-based identity (no passwords)
- Create or join a meeting room
- Peer-to-peer video and audio via WebRTC (mesh architecture)
- Real-time signaling with Socket.IO
- Works for 1-on-1 and small group calls

## Project Structure

```
client/
  src/
    App.jsx
    AuthForm.jsx
    PreMeeting.jsx
    Meeting.jsx
    SocketContext.jsx
    contexts/
      ConnectionsContext.jsx

server/
  index.js
  config.js
  models/
    users.js
    rooms.js
    participants.js
```

## Notes

- STUN server used is Google's public one (`stun.l.google.com:19302`). For production you'll want a TURN server too, otherwise connections may fail on strict NATs.
- The room ID returned from `/api/v1/rooms` is the MongoDB `_id` of the room document.
- Socket rooms are keyed by `userId`, so signaling offers are sent directly to a user's personal socket room.
