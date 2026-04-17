import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import { allowedOrigins } from "./config/cors.js";
import { connectDatabase } from "./config/db.js";
import { initializeSocket } from "./socket/index.js";

dotenv.config();

const startServer = async () => {
  await connectDatabase();

  const io = new Server({
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  const app = createApp(io);
  const httpServer = http.createServer(app);
  io.attach(httpServer);

  initializeSocket(io);

  const port = process.env.PORT || 5000;
  httpServer.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
