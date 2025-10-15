import {
  FaComments,
  FaAddressBook,
  FaUserCircle,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { NavLink } from "react-router";

const Menu = () => {
  const styles = {
    container:
      "flex gap-0.5 flex-col items-center justify-center py-2 sm:px-4 cursor-pointer",
    title: "text-xs font-medium text-slate-900 dark:text-slate-50 sm:hidden",
    icon: "h-7 w-7 sm:h-8 sm:w-8 text-slate-900 dark:text-slate-50",
  };

  const navItems = [
    {
      title: "Chats",
      path: "/",
      icon: <FaComments className={styles.icon} />,
    },
    {
      title: "Contacts",
      path: "/contacts",
      icon: <FaAddressBook className={styles.icon} />,
    },
    {
      title: "Profile",
      path: "/profile",
      icon: <FaUserCircle className={styles.icon} />,
    },
    {
      title: "Settings",
      path: "/settings",
      icon: <FaCog className={styles.icon} />,
    },
  ];

  return (
    <div className="flex w-full flex-row justify-around bg-slate-200/90 sm:w-auto sm:flex-col sm:justify-start sm:gap-4 sm:bg-slate-200 dark:bg-slate-900/90 sm:dark:bg-slate-900">
      {navItems.map((item) => (
        <NavLink key={item.path} to={item.path} className={styles.container}>
          {item.icon}
          <p className={styles.title}>{item.title}</p>
        </NavLink>
      ))}
      <button
        className={styles.container}
        onClick={() => console.log("Log Out Clicked")}
      >
        <FaSignOutAlt className={styles.icon} />
        <p className={styles.title}>Log Out</p>
      </button>
    </div>
  );
};

export default Menu;
