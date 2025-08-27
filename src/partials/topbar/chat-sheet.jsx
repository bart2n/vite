import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  IconButton,
  Avatar,
  Badge,
  List,
  ListItem,
  ListItemText,
  Button,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import { Chat, Close, Send } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { setOpen, setRoomId, resetRoom } from "@/redux/roomreducer";
import { useGetRoomQuery, usePostCreateRoomMutation } from "@/redux/chat/chatApi";
import cookies from "js-cookie";

export const ChatSheet = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state?.room?.isOpen);
  const activeRoom = useSelector((state) => state?.room?.roomId);

  // RTK query – rooms list
  const {
    data: rooms = [],
    error: roomsError,
    isLoading: roomsLoading,
  } = useGetRoomQuery("");

  // sockets per room kept in a ref (won’t trigger re-renders)
  const socketsRef = useRef({}); // { [roomId]: WebSocket }

  // messages by room: { [roomId]: Array<Message> }
  const [messagesByRoom, setMessagesByRoom] = useState({});
  const [currentMessage, setCurrentMessage] = useState("");
  const [currentUsername, setCurrentUsername] = useState("");
  const messagesEndRef = useRef(null);

  // (optional) create room hook (unused here but kept like your code)
  const [createRoom] = usePostCreateRoomMutation();

  // current user
  const userId = useMemo(() => localStorage.getItem("user_id") || "", []);
  useEffect(() => {
    const stored = localStorage.getItem("username");
    if (stored) setCurrentUsername(stored);
  }, []);

  // toggle floating panel
  const toggleChatList = () => dispatch(setOpen(!isOpen));

  // open one WS per room (and keep it)
  useEffect(() => {
    if (!rooms?.length) return;

    rooms.forEach((room) => {
      const id = room?.id;
      if (!id) return;

      const existing = socketsRef.current[id];
      if (existing && existing.readyState <= 1) return; // already OPEN/CONNECTING

      const ws = new WebSocket(`ws://localhost:8001/ws/chat/${id}/`);
      socketsRef.current[id] = ws;

      ws.onopen = () => {
        // console.log("WS open:", id);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (!data?.message) return;

          const msg = {
            message: data.message,
            sender_id: data.sender_id ?? "Bilinmeyen",
            sender_name: data.sender_name ?? "Bilinmeyen",
            sender_username: data.sender_username ?? "Bilinmeyen",
            sender_status: data.sender_status ?? "Çevrimdışı",
            timestamp: data.timestamp ?? new Date().toISOString(),
            read: Boolean(data.read),
          };

          setMessagesByRoom((prev) => {
            const list = prev[id] ?? [];
            return { ...prev, [id]: [...list, msg] };
          });
        } catch {
          // ignore malformed payloads
        }
      };

      ws.onerror = () => {
        // console.warn("WS error:", id);
      };

      ws.onclose = () => {
        // console.log("WS closed:", id);
      };
    });

    // cleanup on unmount: close all sockets
    return () => {
      Object.values(socketsRef.current).forEach((sock) => {
        try {
          sock.close();
        } catch {}
      });
      socketsRef.current = {};
    };
  }, [rooms]);

  // auto-scroll to bottom when active room messages change
  useEffect(() => {
    if (!activeRoom?.id) return;
    // touch dependency to trigger effect
    // eslint-disable-next-line no-unused-expressions
    messagesByRoom[activeRoom.id];
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messagesByRoom, activeRoom]);

  // select a room from the list
  const handleRoomSelect = (room) => {
    if (!room) return;
    dispatch(setRoomId(room));
  };

  // close the active chat panel
  const closeChat = () => dispatch(setRoomId(null));

  // sort messages by time for a room
  const sortedMessages = (roomId) => {
    const list = messagesByRoom[roomId] || [];
    return [...list].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    // if you prefer newest last, keep as is; change comparator to reverse for newest first
  };

  // send message into active room WS
  const sendMessage = (e, roomId) => {
    e.preventDefault();
    const msg = currentMessage.trim();
    if (!roomId || !msg) return;

    const ws = socketsRef.current[roomId];
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    const payload = {
      message: msg,
      sender_name: currentUsername,
      sender_id: userId,
      sender_status: "Çevrimiçi",
      timestamp: new Date().toISOString(),
      read: false,
    };

    ws.send(JSON.stringify(payload));

    // optimistic update
    setMessagesByRoom((prev) => {
      const list = prev[roomId] ?? [];
      return { ...prev, [roomId]: [...list, payload] };
    });

    setCurrentMessage("");
  };

  // small helper to pick a display peer for a room (other participant)
  const displayPeer = (room) => {
    if (!room?.participants?.length) return {};
    const other =
      room.participants.find((p) => String(p?.id) !== String(userId)) ||
      room.participants[0];
    return {
      username: other?.username || "Kullanıcı Adı",
      avatar:
        other?.avatar ? `http://localhost:8000${other.avatar}` : "/avatar.jpg",
    };
  };

  return (
    <div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 1000 }}>
      {/* Floating Chat Button */}
      <div
        style={{
          backgroundColor: "#0073b1",
          padding: "10px",
          color: "#fff",
          borderRadius: "10px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
        }}
        onClick={toggleChatList}
      >
        <IconButton style={{ color: "#fff" }}>
          {isOpen ? <Close /> : <Chat />}
        </IconButton>
        <span style={{ marginLeft: "10px" }}>Chat</span>
      </div>

      {/* Panel (rooms + messages) */}
      {isOpen && (
        <div style={{ display: "flex" }}>
          {/* Rooms List */}
          <div
            style={{
              backgroundColor: "#0073b1",
              padding: "10px",
              color: "#fff",
              borderRadius: "10px",
              width: "220px",
              marginTop: "10px",
              position: "relative",
            }}
          >
            <span>Kullanıcı Listesi</span>
            <div
              style={{ overflowY: "auto", maxHeight: "400px", marginTop: "10px" }}
            >
              {roomsLoading && <CircularProgress size={20} sx={{ color: "#fff" }} />}
              {roomsError && (
                <Snackbar
                  open
                  autoHideDuration={6000}
                  message={`Hata: ${roomsError?.message || "Rooms yüklenemedi"}`}
                />
              )}
              {!roomsLoading && !roomsError && (
                <List>
                  {rooms.map((room) => {
                    const peer = displayPeer(room);
                    const unreadOrCount = messagesByRoom[room.id]?.length || 0;
                    return (
                      <ListItem
                        key={room.id}
                        button
                        onClick={() => handleRoomSelect(room)}
                        selected={activeRoom?.id === room.id}
                        sx={{
                          borderRadius: "8px",
                          "&.Mui-selected": { backgroundColor: "rgba(255,255,255,0.15)" },
                        }}
                      >
                        <Badge badgeContent={unreadOrCount} color="primary">
                          <Avatar
                            src={peer.avatar}
                            alt={peer.username}
                            sx={{ width: 36, height: 36, marginRight: "10px" }}
                          />
                        </Badge>
                        <ListItemText
                          primary={peer.username}
                          primaryTypographyProps={{
                            sx: { color: "#fff", fontSize: 14, lineHeight: 1.2 },
                          }}
                        />
                      </ListItem>
                    );
                  })}
                  {rooms.length === 0 && (
                    <ListItem>
                      <ListItemText
                        primary="Oda bulunamadı"
                        primaryTypographyProps={{ sx: { color: "#fff" } }}
                      />
                    </ListItem>
                  )}
                </List>
              )}
            </div>
          </div>

          {/* Chat Window */}
          {activeRoom && (
            <div
              style={{
                backgroundColor: "#fff",
                border: "1px solid #ccc",
                borderRadius: "10px",
                width: "370px",
                marginLeft: "10px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                marginTop: "10px",
              }}
            >
              {/* Header */}
              <div
                style={{
                  backgroundColor: "#0073b1",
                  padding: "10px",
                  color: "#fff",
                  borderRadius: "10px 10px 0 0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  {(() => {
                    const peer = displayPeer(activeRoom);
                    return (
                      <>
                        <Avatar
                          src={peer.avatar}
                          alt={peer.username}
                          style={{ marginRight: "10px" }}
                        />
                        <span>{peer.username}</span>
                      </>
                    );
                  })()}
                </div>
                <IconButton style={{ color: "#fff" }} onClick={closeChat}>
                  <Close />
                </IconButton>
              </div>

              {/* Messages */}
              <div style={{ height: "300px", overflowY: "auto", padding: "10px" }}>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {sortedMessages(activeRoom.id).map((msg, index) => {
                    const mine = msg.sender_name === currentUsername || msg.sender_id === userId;
                    return (
                      <li
                        key={index}
                        style={{
                          margin: "10px 0",
                          display: "flex",
                          justifyContent: mine ? "flex-end" : "flex-start",
                        }}
                      >
                        <div
                          style={{
                            backgroundColor: mine ? "#e1ffc7" : "#f1f1f1",
                            padding: "10px",
                            borderRadius: "10px",
                            maxWidth: "80%",
                          }}
                        >
                          <strong>{msg.sender_username}</strong>: {msg.message}
                          <div style={{ fontSize: "0.8em", color: "#555" }}>
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </ul>
              </div>

              {/* Input */}
              <form
                onSubmit={(e) => sendMessage(e, activeRoom.id)}
                style={{ display: "flex", padding: "10px", gap: "10px" }}
              >
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                  }}
                  placeholder="Mesaj yaz..."
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  endIcon={<Send />}
                >
                  Gönder
                </Button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


