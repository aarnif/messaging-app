import { useNavigate, useLocation } from "react-router";
import { IoChevronBack } from "react-icons/io5";
import { FiEdit } from "react-icons/fi";
import type { User } from "../__generated__/graphql";

const Profile = ({ currentUser }: { currentUser: User }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const showListOnMobile = location.pathname === "/settings/profile";

  const { name, username, about } = currentUser;

  return (
    <div
      className={`flex flex-grow flex-col items-center justify-center bg-white dark:bg-slate-800 ${
        showListOnMobile ? "" : "hidden sm:flex"
      }`}
    >
      <div className="flex w-full flex-grow flex-col items-center gap-4 overflow-y-auto px-2 py-4 sm:gap-8">
        <div className="flex w-full items-center justify-center">
          <button
            data-testid="go-back-button"
            className="absolute left-2 cursor-pointer sm:hidden"
            onClick={() => navigate("/settings")}
          >
            <IoChevronBack className="h-6 w-6 fill-current text-slate-700 hover:text-slate-900 sm:h-7 sm:w-7 dark:text-slate-100 dark:hover:text-slate-300" />
          </button>
          <h2 className="font-oswald text-2xl font-medium text-slate-900 dark:text-slate-50">
            Profile
          </h2>
          <button
            data-testid="edit-profile-button"
            className="absolute right-2 cursor-pointer"
            onClick={() => console.log("Edit profile button clicked")}
          >
            <FiEdit className="h-6 w-6 text-slate-700 hover:text-slate-900 dark:text-slate-100 dark:hover:text-slate-300" />
          </button>
        </div>
        <div className="flex flex-grow flex-col items-center gap-2.5">
          <img
            className="h-20 w-20 rounded-full"
            src="https://i.ibb.co/cNxwtNN/profile-placeholder.png"
          />
          <div className="flex flex-col items-center gap-3">
            <div className="flex flex-col items-center">
              <h4 className="font-oswald font-semibold text-slate-900 dark:text-slate-50">
                {name}
              </h4>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-100">
                @{username}
              </p>
            </div>
            <p className="text-center text-xs font-normal text-slate-700 dark:text-slate-200">
              {about}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
