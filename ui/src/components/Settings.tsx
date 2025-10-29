import { NavLink, Outlet, useLocation } from "react-router";
import useResponsiveWidth from "../hooks/useResponsiveWidth";

const SettingsItem = ({
  item,
}: {
  item: { title: string; path: string; end?: boolean };
}) => {
  const { title, path, end } = item;

  const baseStyles =
    "w-full px-6 py-3 text-base font-bold border-1 rounded-2xl transition focus:outline-none cursor-pointer";

  return (
    <NavLink
      to={`/settings${path}`}
      end={end}
      className={({ isActive }) =>
        isActive
          ? `${baseStyles} rounded-xl border-slate-200 bg-slate-200 dark:border-slate-700 dark:bg-slate-600`
          : `${baseStyles} rounded-xl border-slate-200 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-700`
      }
    >
      <p className="text-sm font-bold text-slate-900 dark:text-slate-50">
        {title}
      </p>
    </NavLink>
  );
};

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
      className={`flex flex-grow flex-col border-r border-slate-200 bg-white p-4 sm:max-w-[360px] dark:border-slate-700 dark:bg-slate-800 ${
        showListOnMobile ? "" : "hidden sm:flex"
      }`}
    >
      <h1 className="font-oswald text-2xl font-medium text-slate-900 dark:text-slate-50">
        Settings
      </h1>
      <div className="flex flex-grow flex-col gap-4 py-4">
        {settingsItems.map((item) => (
          <SettingsItem key={item.title} item={item} />
        ))}
      </div>
    </div>
  );
};

const Settings = () => (
  <div className="flex flex-grow">
    <ListMenu />
    <Outlet />
  </div>
);

export default Settings;
