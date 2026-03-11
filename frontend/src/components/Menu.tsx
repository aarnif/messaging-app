import { FaComments, FaAddressBook, FaCog, FaSignOutAlt } from "react-icons/fa";
import { useApolloClient } from "@apollo/client/react";
import { useNavigate, NavLink } from "react-router";
import useModal from "../hooks/useModal";

const Menu = ({
  setToken,
}: {
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
  const modal = useModal();
  const client = useApolloClient();
  const navigate = useNavigate();

  const isPathActive = (path: string) => {
    if (path === "/") {
      return (
        location.pathname === "/" || location.pathname.startsWith("/chats")
      );
    }
    return location.pathname.startsWith(path);
  };

  const styles = {
    container: {
      default:
        "flex gap-0.5 flex-col items-center justify-center py-2 sm:px-4 cursor-pointer text-xs font-medium text-slate-900 hover:text-slate-700 dark:text-slate-50 dark:hover:text-slate-200",
      active:
        "flex gap-0.5 flex-col items-center justify-center py-2 sm:px-4 cursor-pointer text-xs font-medium text-green-600 dark:text-green-500",
    },
    title: "sm:hidden",
    icon: "h-7 w-7",
  };

  const navItems = [
    {
      testId: "chats-nav-item",
      title: "Chats",
      path: "/",
      icon: <FaComments className={styles.icon} />,
    },
    {
      testId: "contacts-nav-item",
      title: "Contacts",
      path: "/contacts",
      icon: <FaAddressBook className={styles.icon} />,
    },
    {
      testId: "settings-nav-item",
      title: "Settings",
      path: "/settings",
      icon: <FaCog className={styles.icon} />,
    },
  ];

  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.removeItem("messaging-app-token");
    setToken(null);
    client.resetStore();
    navigate("/signin");
  };

  return (
    <div className="flex w-full flex-row justify-around bg-slate-50/90 sm:w-auto sm:flex-col sm:justify-start sm:gap-4 sm:bg-slate-50 dark:bg-slate-900/90 sm:dark:bg-slate-900">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          data-testid={item.testId && item.testId}
          className={
            isPathActive(item.path)
              ? styles.container.active
              : styles.container.default
          }
        >
          {item.icon}
          <p className={styles.title}>{item.title}</p>
        </NavLink>
      ))}
      <button
        data-testid="logout-button"
        className={styles.container.default}
        onClick={() =>
          modal({
            type: "alert",
            title: "Logout?",
            message: "Are you sure you want to logout?",
            close: "Cancel",
            confirm: "Logout",
            callback: handleLogout,
          })
        }
      >
        <FaSignOutAlt className={styles.icon} />
        <p className={styles.title}>Log Out</p>
      </button>
    </div>
  );
};

export default Menu;
