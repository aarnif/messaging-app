import { Routes, Route, Navigate } from "react-router";
import { useQuery } from "@apollo/client/react";
import { ME } from "./graphql/queries";
import Home from "./components/Home";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import Chats from "./components/Chats";
import Contacts from "./components/Contacts";
import Chat from "./components/Chat";
import NewChat from "./components/NewChat";
import Contact from "./components/Contact";
import Settings from "./components/Settings";
import Appearance from "./components/Appearance";
import SelectionPrompt from "./ui/SelectionPrompt";
import type { User } from "./__generated__/graphql";

const App = () => {
  const { data, loading } = useQuery(ME);

  if (loading) {
    return null;
  }

  const currentUser = data?.me;

  return (
    <Routes>
      <Route
        path="/"
        element={currentUser ? <Home /> : <Navigate to="/signin" replace />}
      >
        <Route path="/" element={<Chats currentUser={currentUser as User} />}>
          <Route
            index
            element={
              <SelectionPrompt message="Select Chat to Start Messaging." />
            }
          />
          <Route
            path="/chats/:id"
            element={<Chat currentUser={currentUser as User} />}
          />

          <Route
            path="/chats/new"
            element={<NewChat currentUser={currentUser as User} />}
          />

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
          <Route
            path="/contacts/:id"
            element={<Contact currentUser={currentUser as User} />}
          />
          <Route
            path="/contacts/deleted"
            element={<SelectionPrompt message="You deleted the contact." />}
          />
        </Route>

        <Route path="/settings" element={<Settings />}>
          <Route
            index
            element={<p className="hidden sm:flex">Edit Profile</p>}
          />
          <Route
            path="edit-profile"
            element={<p data-testid="edit-profile">Edit Profile</p>}
          />
          <Route
            path="appearance"
            element={<Appearance currentUser={currentUser as User} />}
          />
          <Route
            path="change-password"
            element={<p data-testid="change-password">Change Password</p>}
          />
        </Route>
      </Route>

      <Route
        path="/signin"
        element={currentUser ? <Navigate to="/" replace /> : <SignIn />}
      />

      <Route
        path="/signup"
        element={currentUser ? <Navigate to="/" replace /> : <SignUp />}
      />

      <Route path="/*" element={<p>Page Not Found</p>} />
    </Routes>
  );
};

export default App;
