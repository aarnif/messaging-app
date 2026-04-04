import { useNavigate, useOutletContext } from "react-router";
import { useMutation } from "@apollo/client/react";
import { IoChevronBack } from "react-icons/io5";
import { useState } from "react";
import type { User } from "../../../__generated__/graphql";
import { EDIT_PROFILE } from "../../../graphql/mutations";
import SettingsToggle from "./SettingsToggle";

const Appearance = () => {
  const { currentUser } = useOutletContext<{
    currentUser: User;
  }>();

  const navigate = useNavigate();
  const [theme, setTheme] = useState(
    localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
      ? "dark"
      : "light"
  );
  const [is24HourClock, setIs24HourClock] = useState(currentUser.is24HourClock);

  const [mutate] = useMutation(EDIT_PROFILE);

  const handleToggleDarkMode = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
  };

  const handleToggleClock = async () => {
    const updatedClock = !is24HourClock;
    setIs24HourClock(updatedClock);

    await mutate({
      variables: {
        input: {
          name: currentUser.name,
          about: currentUser.about,
          is24HourClock: updatedClock,
        },
      },
    });
  };

  return (
    <div className="flex grow flex-col items-center gap-4 bg-white px-2 py-4 sm:gap-8 dark:bg-slate-800">
      <div className="flex w-full items-center justify-center">
        <button
          data-testid="go-back-button"
          className="absolute left-2 cursor-pointer sm:hidden"
          onClick={() => navigate("/settings")}
        >
          <IoChevronBack className="h-6 w-6 fill-current text-slate-700 hover:text-slate-900 sm:h-7 sm:w-7 dark:text-slate-100 dark:hover:text-slate-300" />
        </button>
        <h2 className="font-oswald text-2xl font-medium text-slate-900 dark:text-slate-50">
          Appearance
        </h2>
      </div>
      <div className="flex w-full flex-col gap-4">
        <SettingsToggle
          label={"Dark Mode"}
          buttonTestId="toggle-dark-mode"
          isActive={theme === "dark"}
          onClick={handleToggleDarkMode}
        />
        <SettingsToggle
          label={"24-Hour Clock"}
          buttonTestId="toggle-clock-mode"
          isActive={is24HourClock}
          onClick={handleToggleClock}
        />
      </div>
    </div>
  );
};

export default Appearance;
