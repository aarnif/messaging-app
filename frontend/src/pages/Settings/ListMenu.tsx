import { useLocation } from "react-router";
import useResponsiveWidth from "../../hooks/useResponsiveWidth";
import SettingsItem from "./SettingsItem";

const ListMenu = () => {
  const width = useResponsiveWidth();
  const location = useLocation();
  const showListOnMobile = location.pathname === "/settings";
  const isMobile = width <= 640;

  const settingsItems = [
    {
      title: "Profile",
      path: isMobile ? "/profile" : "",
      end: true,
    },
    {
      title: "Appearance",
      path: "/appearance",
    },
  ];

  return (
    <div
      className={`flex grow flex-col border-r border-slate-200 bg-white p-4 sm:max-w-90 dark:border-slate-700 dark:bg-slate-800 ${
        showListOnMobile ? "" : "hidden sm:flex"
      }`}
    >
      <h1 className="font-oswald text-2xl font-medium text-slate-900 dark:text-slate-50">
        Settings
      </h1>
      <div className="flex grow flex-col gap-4 py-4">
        {settingsItems.map((item) => (
          <SettingsItem key={item.title} item={item} />
        ))}
      </div>
    </div>
  );
};

export default ListMenu;
