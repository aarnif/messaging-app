import { NavLink } from "react-router";

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
          ? `${baseStyles} rounded-lg border-slate-200 bg-slate-200 dark:border-slate-700 dark:bg-slate-600`
          : `${baseStyles} rounded-lg border-slate-200 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-700`
      }
    >
      <p className="text-sm font-bold text-slate-900 dark:text-slate-50">
        {title}
      </p>
    </NavLink>
  );
};

export default SettingsItem;
