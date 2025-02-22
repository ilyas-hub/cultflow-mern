import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getAllTasks, deleteTask } from "../../services/operations/taskAPI";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-hot-toast";

const TasksTable = () => {
  const { token } = useSelector((state) => state.auth);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);

  const [sortOption, setSortOption] = useState(""); // For sorting
  const [filterStatus, setFilterStatus] = useState("All"); // For status filtering

  // Fetch tasks from API
  const fetchTasks = async () => {
    try {
      const response = await getAllTasks(token);
      if (response?.success) {
        setTasks(response.tasks);
        setFilteredTasks(response.tasks); // Initialize with all tasks
      } else {
        toast.error(response?.message || "Failed to fetch tasks.");
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("An error occurred while fetching tasks.");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [token]);

  // Handle task deletion
  const handleDelete = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      const response = await deleteTask(token, taskId);
      if (response.success) {
        toast.success("Task deleted successfully.");
        fetchTasks();
      } else {
        toast.error(response?.message || "Failed to delete task.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("An error occurred while deleting the task.");
    }
  };

  // Apply filtering and sorting
  useEffect(() => {
    let updatedTasks = [...tasks];

    // Filter by Status
    if (filterStatus !== "All") {
      updatedTasks = updatedTasks.filter((task) =>
        filterStatus === "Completed" ? task.completed : !task.completed
      );
    }

    // Sorting logic
    switch (sortOption) {
      case "title-asc":
        updatedTasks.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-desc":
        updatedTasks.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "date-asc":
        updatedTasks.sort(
          (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
        );
        break;
      case "date-desc":
        updatedTasks.sort(
          (a, b) => new Date(b.dueDate) - new Date(a.dueDate)
        );
        break;
      case "status":
        updatedTasks.sort((a, b) => Number(b.completed) - Number(a.completed));
        break;
      default:
        break;
    }

    setFilteredTasks(updatedTasks);
  }, [tasks, sortOption, filterStatus]);

  // Reset filters and sorting
  const resetFilters = () => {
    setSortOption("");
    setFilterStatus("All");
  };

  return (
    <div className="overflow-x-auto bg-richblack-800 p-6 rounded-2xl shadow-lg w-full max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-richblack-100 mb-4 text-center">Tasks Management</h2>

      {/* Filter and Sort Controls */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div className="flex gap-4 flex-wrap">
          {/* Filter by Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 rounded-lg bg-richblack-700 text-richblack-100 border border-richblack-600"
          >
            <option value="All">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
          </select>

          {/* Sort Options */}
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="p-2 rounded-lg bg-richblack-700 text-richblack-100 border border-richblack-600"
          >
            <option value="">Sort By</option>
            <option value="title-asc">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
            <option value="date-asc">Due Date (Oldest)</option>
            <option value="date-desc">Due Date (Newest)</option>
            <option value="status">Status (Completed First)</option>
          </select>
        </div>

        {/* Reset Button */}
        <button
          onClick={resetFilters}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Reset Filters
        </button>
      </div>

      {/* Tasks Table */}
      <table className="w-full border-collapse border border-richblack-600">
        <thead>
          <tr className="bg-richblack-700 text-richblack-100">
            <th className="p-3 border border-richblack-600">Title</th>
            <th className="p-3 border border-richblack-600">Description</th>
            <th className="p-3 border border-richblack-600">Due Date</th>
            <th className="p-3 border border-richblack-600">Status</th>
            <th className="p-3 border border-richblack-600">Edit</th>
            <th className="p-3 border border-richblack-600">Delete</th>
          </tr>
        </thead>
        <tbody>
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <tr
                key={task._id}
                className="text-richblack-200 hover:bg-richblack-700 transition duration-200"
              >
                <td className="p-3 border border-richblack-600">{task.title}</td>
                <td className="p-3 border border-richblack-600">{task.description}</td>
                <td className="p-3 border border-richblack-600">
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString()
                    : "N/A"}
                </td>
                <td
                  className={`p-3 border border-richblack-600 font-semibold ${
                    task.completed ? "text-caribbeangreen-400" : "text-yellow-400"
                  }`}
                >
                  {task.completed ? "Completed" : "Pending"}
                </td>
                <td className="p-3 border border-richblack-600 text-center">
                  <Link to={`/dashboard/edit-task/${task._id}`}>
                    <FaEdit className="text-blue-300 hover:text-blue-500 cursor-pointer" />
                  </Link>
                </td>
                <td className="p-3 border border-richblack-600 text-center">
                  <FaTrash
                    className="text-red-500 hover:text-[#ff0000] cursor-pointer"
                    onClick={() => handleDelete(task._id)}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center p-4 text-richblack-400">
                No tasks available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TasksTable;

