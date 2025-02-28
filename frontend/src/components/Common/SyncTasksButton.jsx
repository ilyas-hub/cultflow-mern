import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { getAllTasks } from "../../services/operations/taskAPI";
import { toast } from "react-hot-toast";

const SyncTasksButton = () => {
  const [localTasks, setLocalTasks] = useState([]);
  const [googleTasks, setGoogleTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchLocalTasks();
    fetchGoogleTasks();
  }, []);

  const fetchLocalTasks = async () => {
    const result = await getAllTasks(token);
    if (result?.success) {
      setLocalTasks(result.tasks);
    }
  };

  const fetchGoogleTasks = async () => {
    let googleAccessToken = sessionStorage.getItem("googleAccessToken");

    if (!googleAccessToken) {
      toast.error("Please connect your Google account first.");
      return;
    }

    try {
      const response = await axios.get("https://cultflow-mern.onrender.com/google/tasks", {
        headers: { Authorization: `Bearer ${googleAccessToken}` },
      });

      setGoogleTasks(response.data.tasks || []);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Logging out...");
        logoutUser(); // Auto logout on token expiration
      } else {
        toast.error("Failed to fetch Google tasks.");
      }
    }
  };

  const syncTasks = async () => {
    if (!user?._id) {
      toast.error("User ID is missing. Please log in again.");
      return;
    }

    const googleAccessToken = sessionStorage.getItem("googleAccessToken");
    if (!googleAccessToken) {
      toast.error("Please connect your Google account first.");
      return;
    }

    setLoading(true);

    const tasksToSync = localTasks.filter((localTask) => {
      const existingGoogleTask = googleTasks.find(
        (gt) => gt.id === localTask.id
      );
      return (
        !existingGoogleTask ||
        JSON.stringify(existingGoogleTask) !== JSON.stringify(localTask)
      );
    });

    if (tasksToSync.length === 0) {
      toast("No new or updated tasks to sync.", { icon: "ℹ️" });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "https://cultflow-mern.onrender.com/api/sync/google",
        { userId: user._id, tasks: tasksToSync },
        { headers: { Authorization: `Bearer ${googleAccessToken}` } }
      );
      toast.success(response.data.message);
      fetchGoogleTasks();
    } catch (error) {
      toast.error("Failed to sync tasks.");
    }

    setLoading(false);
  };

  const logoutUser = () => {
    sessionStorage.removeItem("googleAccessToken");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
  };

  return (
    <button onClick={syncTasks} disabled={loading}>
      {loading ? "Syncing..." : "Sync Tasks to Google"}
    </button>
  );
};

export default SyncTasksButton;
