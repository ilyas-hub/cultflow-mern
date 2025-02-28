import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import io from "socket.io-client";
import { getAllTasks, deleteTask, searchTasks } from "../../services/operations/taskAPI";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import { toast } from "react-hot-toast";


const socket = io("https://cultflow-mern.onrender.com"); // Replace with your backend URL

const TasksTable = () => {
  const { token } = useSelector((state) => state.auth);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [query, setQuery] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const fetchTasks = async () => {
    try {
      const response = await getAllTasks(token);
      if (response?.success) {
        setTasks(response.tasks);
        setFilteredTasks(response.tasks);
      } else {
        toast.error(response?.message || "Failed to fetch tasks.");
      }
    } catch (error) {
      toast.error("An error occurred while fetching tasks.");
    }
  };

  useEffect(() => {
    fetchTasks();

    
    socket.on("taskUpdated", () => {
      console.log("Task update received.");
      fetchTasks();
    });
    socket.on("taskDeleted", (taskId) => {
      setTasks((prev) => prev.filter((task) => task._id !== taskId));
    });

    return () => {
      socket.off("taskDeleted");
      socket.off("taskUpdated"); 
    };
  }, [token]);

  const handleSearch = async () => {
    if (!query.trim()) {
      fetchTasks();
      return;
    }

    try {
      const response = await searchTasks(token, query);
      if (response?.success) {
        setFilteredTasks(response.tasks);
      } else {
        toast.error(response?.message || "Search failed.");
      }
    } catch (error) {
      toast.error("An error occurred while searching tasks.");
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      const response = await deleteTask(token, taskId);
      if (response.success) {
        toast.success("Task deleted.");
        socket.emit("deleteTask", taskId);
        socket.emit("taskUpdated"); 
      } else {
        toast.error(response?.message || "Failed to delete task.");
      }
    } catch (error) {
      toast.error("Error deleting task.");
    }
  };

  useEffect(() => {
    let updatedTasks = [...tasks];

    if (filterStatus !== "All") {
      updatedTasks = updatedTasks.filter((task) =>
        filterStatus === "Completed" ? task.completed : !task.completed
      );
    }

    switch (sortOption) {
      case "title-asc":
        updatedTasks.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-desc":
        updatedTasks.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "date-asc":
        updatedTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        break;
      case "date-desc":
        updatedTasks.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
        break;
      case "status":
        updatedTasks.sort((a, b) => Number(b.completed) - Number(a.completed));
        break;
      default:
        break;
    }

    setFilteredTasks(updatedTasks);
  }, [tasks, sortOption, filterStatus]);

  const resetFilters = () => {
    setSortOption("");
    setFilterStatus("All");
    setQuery("");
    fetchTasks();
  };

  return (
    <div className="overflow-x-auto bg-richblack-800 p-6 rounded-2xl shadow-lg w-full max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-richblack-100 mb-4 text-center">
        Tasks Management
      </h2>
    

      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search tasks..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="p-2 rounded-lg bg-richblack-700 text-richblack-100 border border-richblack-600"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FaSearch />
          </button>
        </div>

        <div className="flex gap-4 flex-wrap">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 rounded-lg bg-richblack-700 text-richblack-100 border border-richblack-600"
          >
            <option value="All">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
          </select>

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

        <button
          onClick={resetFilters}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Reset
        </button>
      </div>

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
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}
                </td>
                <td
                  className={`p-3 border border-richblack-600 font-semibold ${
                    task.completed ? "text-caribbeangreen-400" : "text-yellow-400"
                  }`}
                >
                  {task.completed ? "Completed" : "Pending"}
                </td>
                <td className="p-3 border border-richblack-600  text-center">
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

