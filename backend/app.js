import express from "express";
import { connectDB } from "./config.js";
import dotenv from "dotenv";
import cors from "cors";
import Room from "./models/rooms.js";
import Participant from "./models/participants.js";
import User from "./models/users.js";
import { createServer } from "node:http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import cookie from "cookie";

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: `${process.env.CLIENT_URL}`,
        methods: ["GET", "POST"],
        credentials: true,
    },
});

await connectDB();
app.use(
    cors({
        origin: `${process.env.CLIENT_URL}`,
        credentials: true,
    }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

io.use(async (socket, next) => {
    const rawCookie = socket?.handshake?.headers?.cookie;

    if (!rawCookie) {
        return next(new Error("No Cookie Found!"));
    }
    const parsed = cookie.parse(rawCookie);
    const userId = parsed.user_session;
    socket.userId = userId;
    next();
});

io.on("connection", (socket) => {
    console.log("Socket Connected: ", socket.id);

    socket.on("join_room_socket", (socketRoomId) => {
        socket.join(socket.userId);
        console.log("Socket joined room: ", socket.userId);
    });

    socket.on("join_room_offer", ({ roomId, offer }) => {
        socket
            .to(roomId)
            .emit("join_room_offer", { offer, sender: socket.userId });
    });

    socket.on("join_room_answer", ({ roomId, answer }) => {
        socket
            .to(roomId)
            .emit("join_room_answer", { sender: socket.userId, answer });
    });

    socket.on("ice-candidate", ({ roomId, candidate }) => {
        socket
            .to(roomId)
            .emit("ice-candidate", { sender: socket.userId, candidate });
    });
});

// Map for the active rooms with participants
const roomMap = new Map(); //  roomId: [participantsIds]

app.post("/api/v1/rooms", async (req, res) => {
    const userId = getUserId(req);
    console.log(userId);
    console.log(req.cookies);
    if (!userId) {
        res.status(404).json({ success: false, message: "User id not found" });
    }
    try {
        const room = await Room.create({ hostedBy: userId });
        roomMap.set(room._id.toString(), [userId.toString()]);

        res.status(201).json({ success: true, roomId: room._id });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post("/api/v1/participants", async (req, res) => {
    const { roomId } = req.body;
    const userId = getUserId(req);

    if (!userId) {
        res.status(404).json({ success: false, message: "User id not found" });
    }

    if (!roomId) {
        res.status(404).json({ success: false, message: "Room id not found" });
    }

    try {
        const participant = await Participant.create({
            roomId,
            participantId: userId,
        });
        const room = roomMap.get(roomId.toString());
        room.push(userId.toString());
        const existingParticipants = room.filter(
            (r) => r.toString() !== userId.toString(),
        );
        res.status(201).json({
            success: true,
            message: "Joined room.",
            participant,
            existingParticipants,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Auth for persistent user Id
app.post("/api/v1/signup", async (req, res) => {
    const expireTokenCookieIn = 30 * 24 * 60 * 60 * 1000;
    const { email } = req.body;

    try {
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({ email });
        }

        res.cookie("user_session", `${user._id}`, {
            httpOnly: true,
            secure: process.env?.NODE_ENV === "production",
            sameSite: process.env?.NODE_ENV === "production" ? "none" : "lax",
            maxAge: expireTokenCookieIn,
        });

        res.json({ success: true, message: "Welcome!" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

const getUserId = (req) => {
    return req?.cookies?.user_session;
};

server.listen(3000, () => {
    console.log("Server Connected.");
});
