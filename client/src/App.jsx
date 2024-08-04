import {
  Box,
  Button,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";

const App = () => {
  const socket = useMemo(
    () => io("http://localhost:3000", { withCredentials: true }),
    []
  );

  const [message, setMessage] = useState("");
  const [room, setRoom] = useState("");
  const [socketId, setSocketId] = useState("");
  const [messages, setMessages] = useState([]);
  const [roomName, setRoomName] = useState("");

  const submitHandler = (e) => {
    e.preventDefault();
    if (message !== "" && room !== "") {
      sendMessage(message, room);
      setMessage("");
    }
  };

  const joinRoomHandler = (e) => {
    e.preventDefault();
    if (roomName !== "") {
      socket.emit("join-room", roomName);
      setRoom(roomName);
      setRoomName("");
    }
  };

  const sendMessage = (message, room) => {
    console.log("Sending message:", { message, room });
    const data = { message, room, isSender: true };
    socket.emit("message", data);
  };

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected, your id is", socket.id);
      setSocketId(socket.id);
    });

    socket.on("receive-message", (data) => {
      // console.log(data);
      setMessages((prevMessages) => [...prevMessages, data]);
    });
    socket.on("welcome", (s) => {
      console.log(s);
    });

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return (
    <Container maxWidth="sm">
      <Box sx={{ height: "10px" }} />
      <Typography variant="h4" component="div" gutterBottom>
        Welcome to Socket.io
      </Typography>

      <form onSubmit={joinRoomHandler}>
        <TextField
          onChange={(e) => setRoomName(e.target.value)}
          value={roomName}
          variant="outlined"
          label="Room name"
          type="text"
        />

        <Button type="submit" variant="contained">
          Join Now
        </Button>
      </form>

      <Typography variant="h6" component="div" gutterBottom>
        {socketId}
      </Typography>

      <form onSubmit={submitHandler}>
        <TextField
          onChange={(e) => setRoom(e.target.value)}
          value={room}
          variant="outlined"
          label="Room"
          type="text"
        />

        <TextField
          onChange={(e) => setMessage(e.target.value)}
          value={message}
          variant="outlined"
          label="Message"
          type="text"
        />

        <Button type="submit" variant="contained">
          Send
        </Button>
      </form>

      <Stack>
        {messages.map((m, i) => (
          <Typography
            key={i}
            className={`message ${m.isSender ? "sent" : "received"}`}
            variant="h6"
            component="div"
            gutterBottom
          >
            {m.message}
          </Typography>
        ))}
      </Stack>
    </Container>
  );
};

export default App;
