// services/operations/taskAPI.js
import { toast } from "react-hot-toast";
import { apiConnector } from "../apiConnector";
import { logout } from "./authAPI";
import { setLoading, setUser } from "../../slices/profileSlice";

const BASE_URL =
  import.meta.env.VITE_BASE_URL || "https://cultflow-mern.onrender.com/api/v1";


// TASK ENDPOINTS
export const taskEndpoints = {
  GET_ALL_TASKS_API: `${BASE_URL}/tasks/getTasks`,
  GET_SINGLE_TASK_API: `${BASE_URL}/tasks/getSingleTask`,
  CREATE_TASK_API: `${BASE_URL}/tasks/createTask`,
  UPDATE_TASK_API: `${BASE_URL}/tasks/updateTask`,
  DELETE_TASK_API: `${BASE_URL}/tasks/deleteTask`,
  GET_USER_DETAILS_API: `${BASE_URL}/tasks/getUserDetails`,
  GET_ALL_TASKS_ADMIN_API: `${BASE_URL}/tasks/admin/getAllTasksForAdmin`,
  SEARCH_TASKS_API: `${BASE_URL}/tasks/search`,
};

// Fetch all tasks
export const getAllTasks = async (token) => {
  try {
    const response = await apiConnector(
      "GET",
      taskEndpoints.GET_ALL_TASKS_API,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

// Fetch all tasks for admin with pagination
export const getAllTasksForAdmin = async (token, page = 1, limit = 10) => {
  try {
    const response = await apiConnector(
      "GET",
      taskEndpoints.GET_ALL_TASKS_ADMIN_API,
      null,
      { Authorization: `Bearer ${token}` },
      { page, limit }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching admin tasks:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch tasks",
      error: error.response?.data || error.message,
    };
  }
};

// Fetch a single task by ID
export const getSingleTask = async (token, taskId) => {
  try {
    const response = await apiConnector(
      "GET",
      `${taskEndpoints.GET_SINGLE_TASK_API}/${taskId}`,
      null,
      { Authorization: `Bearer ${token}` }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching single task:", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

// Create a new task
export const createNewTask = async (token, taskData) => {
  try {
    const response = await apiConnector(
      "POST",
      taskEndpoints.CREATE_TASK_API,
      taskData,
      { Authorization: `Bearer ${token}` }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating task:", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

// Update an existing task
export const updateTask = async (token, taskId, updatedData) => {
  try {
    const response = await apiConnector(
      "PUT",
      `${taskEndpoints.UPDATE_TASK_API}/${taskId}`,
      updatedData,
      { Authorization: `Bearer ${token}` }
    );
    return response.data; 
  } catch (error) {
    console.error("Error updating task:", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

// Delete a task
export const deleteTask = async (token, taskId) => {
  try {
    const response = await apiConnector(
      "DELETE",
      `${taskEndpoints.DELETE_TASK_API}/${taskId}`,
      null,
      { Authorization: `Bearer ${token}` }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting task:", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

// Get user details
export const getUserDetails = (token, navigate) => {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...");
    dispatch(setLoading(true));

    try {
      const response = await apiConnector(
        "GET",
        taskEndpoints.GET_USER_DETAILS_API,
        null,
        { Authorization: `Bearer ${token}` }
      );

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      dispatch(setUser({ ...response.data.data }));
    } catch (error) {
      console.error("GET_USER_DETAILS API ERROR:", error);
      toast.error("Could Not Get User Details");
      dispatch(logout(navigate));
    } finally {
      toast.dismiss(toastId);
      dispatch(setLoading(false));
    }
  };
};

// Search tasks
export const searchTasks = async (token, query) => {
  try {
    const response = await apiConnector(
      "GET",
      `${taskEndpoints.SEARCH_TASKS_API}?query=${encodeURIComponent(query)}`,
      null,
      { Authorization: `Bearer ${token}` }
    );
    return response.data;
  } catch (error) {
    console.error("Error searching tasks:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Search failed.",
    };
  }
};
