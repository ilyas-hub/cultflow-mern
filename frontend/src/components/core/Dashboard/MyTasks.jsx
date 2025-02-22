import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import TasksTable from "../../Common/TasksTable";
import IconBtn from "../../Common/IconBtn";
import { VscAdd } from "react-icons/vsc";
import { getAllTasks } from "../../../services/operations/taskAPI"; // Adjust the import path accordingly

const MyTasks = () => {
  const { token, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(5); // Default limit per page
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchTasks = async () => {
      const result = await getAllTasks(token, page, limit);
      if (result?.success) {
        setTasks(result.tasks);
        setTotalPages(result.totalPages);
      }
    };
    fetchTasks();
  }, [token, page, limit]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  return (
    <div>
      <div className="mb-14 flex items-center justify-between">
        <h1 className="text-3xl font-medium text-richblack-5">
          {user?.AccountType === "admin" ? "All Tasks" : "My Tasks"}
        </h1>
        
        <IconBtn text="Add Task" onclick={() => navigate("/dashboard/add-task")}> <VscAdd /> </IconBtn>
      </div>
      {tasks?.length ? (
        <>
          <TasksTable tasks={tasks} setTasks={setTasks} />
          <div className="mt-6 flex justify-center space-x-4">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg bg-richblack-600 text-white disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-lg text-richblack-200">Page {page} of {totalPages}</span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg bg-richblack-600 text-white disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <p className="text-lg text-richblack-200">No tasks found.</p>
      )}
    </div>
  );
};

export default MyTasks;