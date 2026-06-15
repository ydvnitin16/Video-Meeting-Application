import React, { useContext, useEffect, useState } from "react";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Field, FieldLabel } from "./components/ui/field";
import axios from "axios";
import { data, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { socketContext } from "./SocketContext";
import {
  localStream,
  localStreamRef,
  peerConnection,
  remoteStream,
  remoteStreamRef,
} from "./connectionManager";
import { connectionsContext } from "./contexts/ConnectionsContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Label } from "./components/ui/label";
import { AddIcon } from "@hugeicons/core-free-icons";
import { Separator } from "./components/ui/separator";

const PreMeeting = () => {
  const socket = useContext(socketContext);
  const { connections, participants, setParticipants } =
    useContext(connectionsContext);
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const handleStartMeeting = async () => {
    const response = await axios
      .post(
        `${import.meta.env.VITE_SERVER_URL}/api/v1/rooms`,
        {},
        { withCredentials: true },
      )
      .then((res) => res.data);

    if (!response.success) {
      toast.error("Room Creation Failed.");
      return;
    }
    toast.success("Room Created Successfully.");
    navigate(`/room/${response.roomId}`);
  };

  const handleJoinMeeting = async () => {
    if (!roomId) {
      return;
    }

    const response = await axios
      .post(
        `${import.meta.env.VITE_SERVER_URL}/api/v1/participants`,
        { roomId },
        { withCredentials: true },
      )
      .then((res) => res.data);

    if (!response.success) {
      toast.error("Room Joining Failed.");
      return;
    }

    // update the participants
    setParticipants([...response.existingParticipants]);

    toast.success("Room Joined Successfully.");
    navigate(`/room/${roomId}`);
  };

  return (
    <div className="flex justify-center items-center h-screen w-full bg-zinc-900 text-white">
      <Card className={"w-full max-w-md"}>
        <CardHeader className={"flex flex-col items-center"}>
          <CardTitle>Start or Join a Meeting</CardTitle>
          <CardDescription>
            Enter a room ID to join, or start a new meeting instantly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="roomid">Room Id</Label>
                <Input
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  id="roomid"
                  type="text"
                  placeholder="6a2eee026b9bae580..."
                  required
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className={"flex flex-col gap-5"}>
          <Button className={"w-full"} onClick={handleJoinMeeting}>
            Join Meeting
          </Button>
          <Separator />
          <Button
            variant="outline"
            className={"w-full"}
            onClick={handleStartMeeting}
          >
            Start New Meeting
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PreMeeting;
