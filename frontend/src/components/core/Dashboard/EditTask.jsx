import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getSingleTask, updateTask } from "../../../services/operations/taskAPI"; // Updated import with specific task fetch API
import TaskForm from "../../Common/TaskForm";

const EditTask = () => {
  const { id } = useParams();
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile)
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const result = await getSingleTask(token, id); // Use specific API for single task fetching
        if (result?.success) {
          setTask(result.task);
        } else {
          console.error("Task not found or error fetching task.");
        }
      } catch (error) {
        console.error("Error fetching task:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchTask();
  }, [id, token]);

  const handleSubmit = async (taskData) => {
    try {
      const result = await updateTask(token, id, taskData);
      if (result?.success) {
        navigate(user.accountType === "admin" ? "/dashboard/all-tasks" : "/dashboard/my-tasks");
      } else {
        console.error("Failed to update task.");
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!task) return <p>Task not found.</p>;

  return (
    <div>
      <h1 className="text-3xl font-medium text-richblack-5 mb-6">Edit Task</h1>
      <TaskForm initialData={task} onSubmit={handleSubmit} buttonLabel={"UpdateTask"} />
    </div>
  );
};

export default EditTask;