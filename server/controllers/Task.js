const Task = require("../models/Task");
const User = require("../models/User");
const mongoose = require("mongoose");
const { esClient } = require("../config/elasticsearch");
const INDEX_NAME = "tasks";

const indexTaskInES = async (task) => {
  try {
    await esClient.index({
      index: INDEX_NAME,
      document: {
        // For Elasticsearch v8+
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        completed: task.completed,
        userId: task.userId,
        createdAt: task.createdAt,
      },
    });
  } catch (err) {
    console.error(`Failed to index task (ID: ${task._id}):`, err);
  }
};

const deleteTaskFromES = async (id) => {
  try {
    const taskExists = await esClient.exists({ index: INDEX_NAME, id });

    if (!taskExists) {
      console.warn(
        `Task (ID: ${id}) not found in Elasticsearch. Skipping deletion.`
      );
      return;
    }

    await esClient.delete({ index: INDEX_NAME, id });
  } catch (err) {
    console.error(` Failed to delete task (ID: ${id}):`, err);
  }
};

// Controllers
exports.getTasks = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
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
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "Task ID is required." });

    const query =
      req.user.accountType === "admin"
        ? { _id: id }
        : { _id: id, userId: req.user.id };

    const task = await Task.findOne(query);
    if (!task)
      return res
        .status(404)
        .json({ success: false, message: "Task not found." });

    res.status(200).json({ success: true, task });
  } catch (error) {
 
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

    await indexTaskInES(task);

    res.status(201).json({ success: true, task });
  } catch (error) {
  
    res.status(500).json({ success: false, message: "Failed to create task." });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task)
      return res
        .status(404)
        .json({ success: false, message: "Task not found." });

    if (
      req.user.accountType !== "admin" &&
      task.userId.toString() !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized." });
    }

    const updatedTask = await Task.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    await indexTaskInES(updatedTask);
    res.json({ success: true, task: updatedTask });
  } catch (error) {
   
    res.status(500).json({ success: false, message: "Failed to update task." });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
     
      return res
        .status(400)
        .json({ success: false, message: "Invalid task ID." });
    }

    const task = await Task.findById(id);
    if (!task) {
    
      return res
        .status(404)
        .json({ success: false, message: "Task not found." });
    }

 
    if (
      req.user.accountType !== "admin" &&
      task.userId.toString() !== req.user.id
    ) {
     
      return res.status(403).json({ success: false, message: "Unauthorized." });
    }

    await task.deleteOne();
    await deleteTaskFromES(id);

 
    res.json({ success: true, message: "Task deleted successfully." });
  } catch (error) {
  
    res.status(500).json({ success: false, message: "Failed to delete task." });
  }
};

exports.getAllTasksForAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const tasks = await Task.find({})
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("userId", "email");

    const total = await Task.countDocuments();
    res
      .status(200)
      .json({
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

exports.getUserDetails = async (req, res) => {
  try {
    const userDetails = await User.findById(req.user.id);
    res
      .status(200)
      .json({
        success: true,
        message: "User Data fetched successfully",
        data: userDetails,
      });
  } catch (error) {

    res.status(500).json({ success: false, message: error.message });
  }
};


exports.searchTasks = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user.id; 

    const { hits } = await esClient.search({
      index: INDEX_NAME,
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query,
                fields: ["title", "description"],
              },
            },
            {
              match: {
                userId, 
              },
            },
          ],
        },
      },
    });

    const tasks = hits.hits.map((hit) => ({ id: hit._id, ...hit._source }));

    res.json({ success: true, tasks });
  } catch (error) {
    console.error(
      `Search failed for query: "${req.query.query}" and user: "${req.user.id}"`,
      error
    );
    res.status(500).json({ success: false, message: "Search failed." });
  }
};
