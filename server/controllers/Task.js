const Task = require("../models/Task");
const User = require("../models/User");

exports.getTasks = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // If admin is accessing /tasks/admin/all route, show all tasks; otherwise, show user's tasks
    const query =
      req.user.accountType === "admin" ? {} : { userId: req.user.id };

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Task.countDocuments(query),
    ]);

    res.json({
      success: true,
      tasks,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch tasks." });
  }
};

exports.getSingleTask = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the ID is provided
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Task ID is required." });
    }

    // Find the task based on the ID and user accountType (admin can access any task, others can access their own)
    const query =
      req.user.accountType === "admin"
        ? { _id: id }
        : { _id: id, userId: req.user.id };
    const task = await Task.findOne(query);

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found." });
    }

    res.status(200).json({ success: true, task });
  } catch (error) {
    console.error("Error fetching single task:", error);
    res.status(500).json({ success: false, message: "Failed to fetch task." });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate, completed } = req.body;

    const task = await Task.create({
      title,
      description,
      completed,
      dueDate,
      userId: req.user.id,
    });

    res.status(201).json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create task." });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task)
      return res
        .status(404)
        .json({ success: false, message: "Task not found." });

    // Allow admins to update any task; users can only update their own
    if (
      req.user.accountType !== "admin" &&
      task.userId.toString() !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized." });
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json({ success: true, task: updatedTask });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update task." });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task)
      return res
        .status(404)
        .json({ success: false, message: "Task not found." });

    // Allow admins to delete any task; users can only delete their own
    if (
      req.user.accountType !== "admin" &&
      task.userId.toString() !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized." });
    }

    await task.deleteOne();

    res.json({ success: true, message: "Task deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete task." });
  }
};

exports.getAllTasksForAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Fetch all tasks, sorted, paginated, and populated with user email
    const tasks = await Task.find({})
      .sort({ createdAt: -1 }) // Most recent tasks first
      .skip(skip)
      .limit(Number(limit))
      .populate("userId", "email"); // ✅ Populate user email from User model

    const total = await Task.countDocuments(); // Total task count for pagination

    res.status(200).json({
      success: true,
      tasks,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching all tasks for admin:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tasks",
      error: error.message,
    });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const id = req.user.id;
    const userDetails = await User.findById(id);
    res.status(200).json({
      success: true,
      message: "User Data fetched successfully",
      data: userDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
