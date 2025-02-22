import { FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import Footer from "../components/Common/Footer";
import CTAButton from "../components/Common/Button";

function Home() {
  return (
    <div className="flex-1 w-full flex flex-col justify-between ">
      <div className="flex flex-col items-center justify-center flex-grow gap-10 text-white w-11/12 max-w-maxContent mx-auto pt-5 pb-5 ">
        <Link to="/signup">
          <div className="group w-fit rounded-full bg-richblack-800 p-1 font-bold text-richblack-200 drop-shadow-[0_1.5px_rgba(255,255,255,0.25)] transition-all duration-200 hover:scale-95 hover:drop-shadow-none">
            <div className="flex flex-row items-center gap-2 rounded-full px-10 py-[6px] transition-all duration-200 group-hover:bg-richblack-900">
              <p>Sign Up </p>
              <FaArrowRight />
            </div>
          </div>
        </Link>

        <div className="-mt-2 w-[90%] text-center text-lg font-bold text-richblack-300">
          Manage your tasks seamlessly with{" "}
          <span className="text-yellow-400">Taskify</span>. Whether you're an{" "}
          <span className="text-green-400">Admin</span> assigning tasks or a{" "}
          <span className="text-blue-400">User</span> managing your to-dos, stay
          organized and boost productivity.
        </div>

        <div className="flex flex-row gap-6">
          <CTAButton active={true} linkto="/signup">
            Get Started
          </CTAButton>
          <CTAButton active={false} linkto="/login">
            Log In
          </CTAButton>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Home;
