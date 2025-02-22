import React, { useState, useEffect } from "react";

const TaskForm = ({ onSubmit, initialData = {}, buttonLabel }) => {
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    dueDate: "",
    completed: false,
  });

  
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setTaskData((prev) => {
        if (
          prev.title !== (initialData.title || "") ||
          prev.description !== (initialData.description || "") ||
          prev.dueDate !== (initialData.dueDate ? initialData.dueDate.slice(0, 10) : "") ||
          prev.completed !== Boolean(initialData.completed)
        ) {
          return {
            title: initialData.title || "",
            description: initialData.description || "",
            dueDate: initialData.dueDate ? initialData.dueDate.slice(0, 10) : "",
            completed: Boolean(initialData.completed),
          };
        }
        return prev;
      });
    }
  }, [initialData]);
  
  

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTaskData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(taskData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 bg-richblack-800 p-6 rounded-2xl shadow-lg w-full max-w-md"
    >
      <input
        type="text"
        name="title"
        value={taskData.title}
        onChange={handleChange}
        placeholder="Enter task title"
        required
        className="w-full p-2 rounded-lg border border-richblack-600 bg-richblack-700 text-richblack-100"
      />

      <textarea
        name="description"
        value={taskData.description}
        onChange={handleChange}
        placeholder="Enter task description"
        rows="4"
        required
        className="w-full p-2 rounded-lg border border-richblack-600 bg-richblack-700 text-richblack-100"
      />

      <input
        type="date"
        name="dueDate"
        value={taskData.dueDate}
        onChange={handleChange}
        required
        className="w-full p-2 rounded-lg border border-richblack-600 bg-richblack-700 text-richblack-100"
      />

      <label className="flex items-center gap-2 text-white">
        <input
          type="checkbox"
          name="completed"
          checked={taskData.completed}
          onChange={handleChange}
          className="w-5 h-5 text-[#ffd60a]"
        />
        Mark as Completed
      </label>

      <button
        type="submit"
        className="w-full bg-[#897824] text-richblack-900 font-semibold py-2 rounded-lg hover:bg-[#ffd60a]"
      >
        {buttonLabel} 
      </button>
    </form>
  );
};

export default TaskForm;
