import { useState } from "react";
import { Navigate, Route, Routes } from "react-router";
import NotificationProvider from "./components/NotificationProvider";
import SelectionPrompt from "./components/ui/SelectionPrompt";
import useField from "./hooks/useField";
import Chat from "./pages/Chat";
import Chats from "./pages/Chats";
import Contact from "./pages/Contact";
import Contacts from "./pages/Contacts";
import Home from "./pages/Home";
import NewChat from "./pages/NewChat";
import Settings from "./pages/Settings";
import Appearance from "./pages/Settings/Appearance";
import Profile from "./pages/Settings/Profile";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";

const App = () => {
  const [token, setToken] = useState(
    localStorage.getItem("messaging-app-token") || null,
  );
  const searchWord = useField(
    "search-chats",
    "text",
    "Search by title or description...",
  );

  return (
    <NotificationProvider>
      <Routes>
        <Route
          path="/"
          element={
            token ? (
              <Home setToken={setToken} />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        >
          <Route path="/" element={<Chats searchWord={searchWord} />}>
            <Route
              index
              element={
                <SelectionPrompt message="Select Chat to Start Messaging." />
              }
            />
            <Route path="/chats/:id" element={<Chat />} />

            <Route path="/chats/new" element={<NewChat />} />

            <Route
              path="/chats/left"
              element={<SelectionPrompt message="You left the chat." />}
            />

            <Route
              path="/chats/deleted"
              element={<SelectionPrompt message="You deleted the chat." />}
            />
          </Route>

          <Route path="/contacts" element={<Contacts />}>
            <Route
              index
              element={
                <SelectionPrompt message="Select a contact for further information." />
              }
            />
            <Route path="/contacts/:id" element={<Contact />} />
            <Route
              path="/contacts/removed"
              element={<SelectionPrompt message="You removed the contact." />}
            />
          </Route>

          <Route path="/settings" element={<Settings />}>
            <Route index element={<Profile />} />
            <Route path="profile" element={<Profile />} />
            <Route path="appearance" element={<Appearance />} />
          </Route>
        </Route>

        <Route
          path="/signin"
          element={
            token ? <Navigate to="/" replace /> : <SignIn setToken={setToken} />
          }
        />

        <Route
          path="/signup"
          element={
            token ? <Navigate to="/" replace /> : <SignUp setToken={setToken} />
          }
        />

        <Route path="/*" element={<p>Page Not Found</p>} />
      </Routes>
    </NotificationProvider>
  );
};

export default App;
