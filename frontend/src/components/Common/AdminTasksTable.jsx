import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import { deleteTask } from "../../services/operations/taskAPI";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
const socket = io(import.meta.env.VITE_BACKEND_URL);

const AdminTasksTable = ({ tasks, setTasks, onDeleteSuccess }) => {
  const { token } = useSelector((state) => state.auth);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    socket.on("taskCreated", (newTask) => {
      setTasks((prev) => {
        const exists = prev.some((task) => task._id === newTask._id);
        return exists ? prev : [newTask, ...prev]; // Add only if not already present
      });
    });

    socket.on("taskUpdated", (updatedTask) => {
      setTasks((prev) => {
        return prev.map((task) =>
          task._id === updatedTask._id ? updatedTask : task
        );
      });
    });

    return () => {
      socket.off("taskCreated");
      socket.off("taskUpdated");
    };
  }, []);

  const handleDelete = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      const response = await deleteTask(token, taskId);
      if (response.success) {
        toast.success("Task deleted.");
        socket.emit("deleteTask", taskId);
        onDeleteSuccess(taskId);
        socket.emit("taskUpdated", taskId);
      } else {
        toast.error(response?.message || "Failed to delete task.");
      }
    } catch (error) {
      toast.error("Error deleting task.");
    }
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getSortArrow = (key) => {
    if (sortConfig.key !== key) return "";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Completed" && task.completed) ||
        (statusFilter === "Pending" && !task.completed);
      const matchesSearch = task.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [tasks, statusFilter, searchTerm]);

  const sortedTasks = useMemo(() => {
    if (!sortConfig.key) return filteredTasks;
    return [...filteredTasks].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === "dueDate") {
        aValue = aValue ? new Date(aValue) : new Date(0);
        bValue = bValue ? new Date(bValue) : new Date(0);
      } else if (sortConfig.key === "title") {
        aValue = aValue?.toLowerCase() || "";
        bValue = bValue?.toLowerCase() || "";
      } else if (sortConfig.key === "completed") {
        aValue = aValue ? 1 : 0;
        bValue = bValue ? 1 : 0;
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredTasks, sortConfig]);

  return (
    <div className="overflow-x-auto bg-richblack-800 p-6 rounded-2xl shadow-lg w-full max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-4 md:space-y-0">
        <h2 className="text-xl font-bold text-richblack-100">Admin Tasks</h2>
        
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 rounded-md bg-richblack-700 text-richblack-100"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 rounded-md bg-richblack-700 text-richblack-100"
          >
            <option value="All">All</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      <table className="w-full border-collapse border border-richblack-600">
        <thead>
          <tr className="bg-richblack-700 text-richblack-100">
            <th
              className="p-3 border cursor-pointer"
              onClick={() => handleSort("title")}
            >
              Title {getSortArrow("title")}
            </th>
            <th className="p-3 border">Description</th>
            <th
              className="p-3 border cursor-pointer"
              onClick={() => handleSort("dueDate")}
            >
              Due Date {getSortArrow("dueDate")}
            </th>
            <th
              className="p-3 border cursor-pointer"
              onClick={() => handleSort("completed")}
            >
              Status {getSortArrow("completed")}
            </th>
            <th className="p-3 border">Edit</th>
            <th className="p-3 border">Delete</th>
          </tr>
        </thead>
        <tbody>
          {sortedTasks.length ? (
            sortedTasks.map((task) => (
              <tr
                key={task._id || task.id}
                className="text-richblack-200 hover:bg-richblack-700 transition duration-200"
              >
                <td className="p-3 border">{task.title}</td>
                <td className="p-3 border">{task.description}</td>
                <td className="p-3 border">
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString()
                    : "N/A"}
                </td>
                <td
                  className={`p-3 border font-semibold ${
                    task.completed
                      ? "text-caribbeangreen-400"
                      : "text-yellow-400"
                  }`}
                >
                  {task.completed ? "Completed" : "Pending"}
                </td>
                <td className="p-3 border text-center">
                  <Link to={`/dashboard/edit-task/${task._id || task.id}`}>
                    <FaEdit className="text-blue-500 hover:text-blue-700 cursor-pointer" />
                  </Link>
                </td>
                <td className="p-3 border text-center">
                  <FaTrash
                    className="text-red-500 hover:text-red-700 cursor-pointer"
                    onClick={() => handleDelete(task._id || task.id)}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center p-4 text-richblack-400">
                No tasks found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTasksTable;
