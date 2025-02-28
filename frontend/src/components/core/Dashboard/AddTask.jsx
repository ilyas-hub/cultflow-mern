import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client"; // Import Socket.io
import TaskForm from "../../Common/TaskForm";
import { createNewTask } from "../../../services/operations/taskAPI";
const socket = io(import.meta.env.VITE_BACKEND_URL);

const AddTask = () => {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const navigate = useNavigate();

  const handleSubmit = async (taskData) => {
    const result = await createNewTask(token, taskData);

    if (result?.success) {
      socket.emit("newTask", result.task);

      navigate(
        user.accountType === "admin"
          ? "/dashboard/all-tasks"
          : "/dashboard/my-tasks"
      );
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-medium text-richblack-5 mb-6">Add Task</h1>
      <TaskForm onSubmit={handleSubmit} buttonLabel={"Add Task"} />
    </div>
  );
};

export default AddTask;
