import { Routes, Route, Navigate } from "react-router";
import useField from "./hooks/useField";
import ModalProvider from "./components/ModalProvider";
import Home from "./components/Home";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import Chats from "./components/Chats";
import Contacts from "./components/Contacts";
import Chat from "./components/Chat";
import NewChat from "./components/NewChat";
import Contact from "./components/Contact";
import Settings from "./components/Settings";
import Profile from "./components/Profile";
import Appearance from "./components/Appearance";
import SelectionPrompt from "./ui/SelectionPrompt";
import { useState } from "react";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const searchWord = useField(
    "search-chats",
    "text",
    "Search by title or description..."
  );

  return (
    <ModalProvider>
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
    </ModalProvider>
  );
};

export default App;
