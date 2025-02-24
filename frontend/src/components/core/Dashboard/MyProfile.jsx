import { RiEditBoxLine } from "react-icons/ri";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { formattedDate } from "../../../utils/dateFormatter";
import IconBtn from "../../Common/IconBtn";

export default function MyProfile() {
  const { user } = useSelector((state) => state.profile);
  const navigate = useNavigate();

  return (
    <>
      <h1 className="mb-10 mt-10 text-3xl font-medium text-richblack-5">
        My Profile
      </h1>

      <div className="flex items-center justify-between rounded-md border border-richblack-700 bg-richblack-800 p-8">
        <div className="space-y-4 text-sm text-richblack-300">
          <p>
            <span className="font-medium text-richblack-5">User ID:</span>
            {user?._id ?? user?.id ?? "N/A"}
          </p>

          <p>
            <span className="font-medium text-richblack-5">Email:</span>{" "}
            {user?.email ?? "N/A"}
          </p>
          <p>
            <span className="font-medium text-richblack-5">Account Type:</span>{" "}
            {user?.accountType ?? "N/A"}
          </p>
        </div>
        <IconBtn
          text="Edit"
          onclick={() => {
            navigate("/dashboard/settings");
          }}
        >
          <RiEditBoxLine />
        </IconBtn>
      </div>

      {/* Account Dates Section */}
      <div className="my-10 flex items-center justify-between rounded-md border border-richblack-700 bg-richblack-800 p-8">
        <div className="space-y-4 text-sm text-richblack-300">
          <p>
            <span className="font-medium text-richblack-5">Created At:</span>{" "}
            {user?.createdAt ? formattedDate(user.createdAt) : "N/A"}
          </p>
          <p>
            <span className="font-medium text-richblack-5">Updated At:</span>{" "}
            {user?.updatedAt ? formattedDate(user.updatedAt) : "N/A"}
          </p>
        </div>
        <IconBtn
          text="Edit"
          onclick={() => {
            navigate("/dashboard/settings");
          }}
        >
          <RiEditBoxLine />
        </IconBtn>
      </div>
    </>
  );
}
