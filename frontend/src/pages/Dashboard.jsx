import { useState } from "react";
import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import { BsGrid3X3Gap } from "react-icons/bs";
import Sidebar from "../components/core/Dashboard/Sidebar";

function Dashboard() {
  const { loading: profileLoading } = useSelector((state) => state.profile);
  const { loading: authLoading } = useSelector((state) => state.auth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  if (profileLoading || authLoading) {
    return (
      <div className="grid flex-grow place-items-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-grow">
      <div
        className={`absolute inset-y-0 left-0 w-64 bg-richblack-800 transition-transform lg:relative lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      </div>

      <button
        onClick={toggleSidebar}
        className="absolute left-4 top-4 z-50 rounded-lg p-2 text-2xl text-richblack-300 lg:hidden"
      >
        <BsGrid3X3Gap />
      </button>

      <div className="flex-1 overflow-auto bg-richblack-900 p-4">
        <div className="mx-auto w-11/12 max-w-[1000px] py-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
