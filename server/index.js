const express = require("express");
const app = express();
const dotenv = require("dotenv");
const database = require("./config/database");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
dotenv.config();
const PORT = process.env.PORT || 4000;
const frontendUrl = process.env.frontendUrl || "http://localhost:5173";
const userRoutes = require('./routes/user');
const taskRoutes = require('./routes/task');
const _dirname = path.resolve();

// Connecting to database
database.connect();

// Middlewares

app.use(express.json()); // For JSON payloads
app.use(cookieParser());
app.use(
	cors({
		origin: "*",
		credentials: true,
	})
);

//routes
app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/tasks', taskRoutes);



app.use(express.static(path.join(_dirname, "/frontend/dist")));

app.get('*', (_, res) => {
  res.sendFile(path.resolve(_dirname, "frontend", "dist", "index.html"));
});



app.listen(PORT, () => {
  console.log(`APP IS RUNNING AT PORT ${PORT}`);
});
