const path = require("path");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: true
  }
});

const PORT = process.env.PORT || 10000;
const ROOM_TTL_MS = 1000 * 60 * 60 * 3;
const rooms = new Map();

app.use(express.static(__dirname));

app.get("/health", (_req, res) => {
  res.json({ ok: true, rooms: rooms.size });
});

function cleanCode(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 6);
}

function touchRoom(room) {
  room.updatedAt = Date.now();
}

function playerFrom(socket, payload = {}) {
  const rawName = String(payload.player?.name || "Spieler").trim().slice(0, 12);
  const gender = String(payload.player?.gender || "").trim().slice(0, 12);
  return {
    id: socket.id,
    name: rawName || "Spieler",
    gender
  };
}

function upsertPlayer(room, socket, payload) {
  const player = playerFrom(socket, payload);
  const existing = room.players.findIndex((item) => item.id === socket.id);
  if (existing >= 0) {
    room.players[existing] = player;
    return player;
  }

  const disconnectedSameName = room.players.findIndex((item) =>
    item.name.toLowerCase() === player.name.toLowerCase() && !room.sockets.has(item.id)
  );
  if (disconnectedSameName >= 0) {
    room.players[disconnectedSameName] = player;
  } else if (room.players.length < 4) {
    room.players.push(player);
  }
  return player;
}

function publicPlayers(room) {
  return room.players.map((player) => ({
    id: player.id,
    name: player.name,
    gender: player.gender
  }));
}

function roomInfo(room, socketId) {
  return {
    ok: true,
    code: room.code,
    role: room.hostId === socketId ? "host" : "guest",
    playerId: socketId,
    players: publicPlayers(room),
    snapshot: room.snapshot || null
  };
}

io.on("connection", (socket) => {
  socket.on("create-room", (payload = {}, reply) => {
    const code = cleanCode(payload.code);
    if (code.length < 4) {
      reply?.({ ok: false, error: "Der Code muss mindestens 4 Ziffern haben." });
      return;
    }

    const existing = rooms.get(code);
    if (existing && existing.hostId !== socket.id) {
      reply?.({ ok: false, error: "Dieser Code ist schon belegt. Bitte neuen Code erstellen." });
      return;
    }

    const room = existing || {
      code,
      mode: "online",
      hostId: socket.id,
      sockets: new Set(),
      players: [],
      snapshot: null,
      updatedAt: Date.now()
    };

    room.hostId = socket.id;
    room.sockets.add(socket.id);
    upsertPlayer(room, socket, payload);
    touchRoom(room);
    rooms.set(code, room);
    socket.join(code);
    socket.data.roomCode = code;
    io.to(code).emit("lobby-updated", publicPlayers(room));
    reply?.(roomInfo(room, socket.id));
  });

  socket.on("join-room", (payload = {}, reply) => {
    const code = cleanCode(payload.code);
    const room = rooms.get(code);
    if (!room) {
      reply?.({ ok: false, error: "Raum nicht gefunden. Bitte Code pruefen." });
      return;
    }

    room.sockets.add(socket.id);
    upsertPlayer(room, socket, payload);
    touchRoom(room);
    socket.join(code);
    socket.data.roomCode = code;
    io.to(code).emit("lobby-updated", publicPlayers(room));
    reply?.(roomInfo(room, socket.id));
  });

  socket.on("sync-state", (payload = {}) => {
    const code = cleanCode(payload.code || socket.data.roomCode);
    const room = rooms.get(code);
    if (!room || !payload.snapshot) return;

    room.snapshot = payload.snapshot;
    room.sockets.add(socket.id);
    touchRoom(room);
    socket.to(code).emit("state-updated", room.snapshot);
  });

  socket.on("disconnect", () => {
    const code = socket.data.roomCode;
    const room = code ? rooms.get(code) : null;
    if (!room) return;

    room.sockets.delete(socket.id);
    if (room.hostId === socket.id) {
      room.hostId = Array.from(room.sockets)[0] || "";
    }
    touchRoom(room);
  });
});

setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms) {
    if (!room.sockets.size && now - room.updatedAt > ROOM_TTL_MS) {
      rooms.delete(code);
    }
  }
}, 1000 * 60 * 10).unref();

server.listen(PORT, "0.0.0.0", () => {
  console.log(`WLAN-Gluecksrad laeuft auf Port ${PORT}`);
});
