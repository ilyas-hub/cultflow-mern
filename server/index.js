const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const database = require("./config/database");
const userRoutes = require("./routes/user");
const taskRoutes = require("./routes/task");
const { OAuth2Client } = require("google-auth-library");
const Task = require("./models/Task");
dotenv.config();
const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 4000;
const _dirname = path.resolve();
const axios = require("axios");

database.connect();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});
app.use(
  cors({
    origin: "*", // Allow all origins
    credentials: true, // Allow cookies & authentication headers
  })
);

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

app.post("/api/auth/google-login", async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Authorization code is missing" });
    }

    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.frontendUrl}`,
        grant_type: "authorization_code",
      }
    );
    const { access_token, id_token } = tokenResponse.data;
    res.status(200).json({ access_token, id_token });
  } catch (error) {
    res.status(400).json({ message: "Failed to authenticate with Google" });
  }
});

app.post("/api/sync/google", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    const accessToken = authHeader?.split(" ")[1];
    if (!accessToken) {
      return res.status(401).json({ message: "Unauthorized: No token" });
    }

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const tasks = await Task.find({ userId });

    if (!tasks.length) {
      return res.json({ message: "No tasks to sync" });
    }

    for (const task of tasks) {
      const response = await axios.post(
        "https://tasks.googleapis.com/tasks/v1/lists/@default/tasks",
        {
          title: task.title,
          notes: task.description,
          due: task.dueDate ? new Date(task.dueDate).toISOString() : undefined,
          status: task.completed ? "completed" : "needsAction",
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
    }

    res.json({ message: "Tasks synced with Google Tasks!" });
  } catch (error) {
    console.error(
      "Error syncing tasks:",
      error.response?.data || error.message
    );
    res.status(500).json({
      message: "Failed to sync tasks.",
      error: error.response?.data || error.message,
    });
  }
});

app.get("/google/tasks", async (req, res) => {
  const googleAccessToken = req.headers.authorization?.split(" ")[1];

  if (!googleAccessToken) {
    return res.status(401).json({ error: "Access token is missing." });
  }

  try {
    const taskListsResponse = await axios.get(
      "https://tasks.googleapis.com/tasks/v1/users/@me/lists",
      { headers: { Authorization: `Bearer ${googleAccessToken}` } }
    );

    const taskLists = taskListsResponse.data.items || [];
    if (taskLists.length === 0) {
      return res.json({ message: "No task lists found.", tasks: [] });
    }

    const taskListId = taskLists[0].id;
    const tasksResponse = await axios.get(
      `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks`,
      { headers: { Authorization: `Bearer ${googleAccessToken}` } }
    );

    res.json({ tasks: tasksResponse.data.items || [] });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tasks from Google Tasks." });
  }
});

app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/tasks", taskRoutes);

app.use(express.static(path.join(_dirname, "/frontend/dist")));
app.get("*", (_, res) => {
  res.sendFile(path.resolve(_dirname, "frontend", "dist", "index.html"));
});

io.on("connection", (socket) => {
  socket.on("newTask", (task) => {
    socket.broadcast.emit("taskCreated", task);
  });

  socket.on("taskUpdated", (updatedTask) => {
    io.emit("taskUpdated", updatedTask);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected: ", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`APP IS RUNNING AT PORT ${PORT}`);
});
