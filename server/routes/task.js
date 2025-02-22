// Import the required modules
const express = require("express");
const router = express.Router();

// Import the task controllers
const {
  getTasks,
  getSingleTask,
  createTask,
  updateTask,
  deleteTask,
  getAllTasksForAdmin,
  getUserDetails,
} = require("../controllers/Task");

// Import authentication and admin middleware
const { auth, isAdmin } = require("../middleware/auth");

// ********************************************************************************************************
//                                            Task Routes (User & Admin)
// ********************************************************************************************************

router.get("/getTasks", auth, getTasks);

router.get("/getUserDetails", auth, getUserDetails);

router.post("/createTask", auth, createTask);

router.get("/getSingleTask/:id", auth, getSingleTask);

router.put("/updateTask/:id", auth, updateTask);

router.delete("/deleteTask/:id", auth, deleteTask);

// ********************************************************************************************************
//                                          Admin-Specific Task Routes
// ********************************************************************************************************

router.get("/admin/getAllTasksForAdmin", auth,isAdmin,  getAllTasksForAdmin);

router.put("/admin/updateTask/:id", auth, isAdmin, updateTask);

router.delete("/admin/deleteTask/:id", auth, isAdmin, deleteTask);

module.exports = router;
