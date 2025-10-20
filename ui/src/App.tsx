import { Routes, Route, useMatch, Navigate } from "react-router";
import { useQuery } from "@apollo/client/react";
import { ME } from "./graphql/queries";
import Home from "./components/Home";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import Chats from "./components/Chats";
import Contacts from "./components/Contacts";
import Chat from "./components/Chat";
import SelectionPrompt from "./ui/SelectionPrompt";
import type { User } from "./__generated__/graphql";

const App = () => {
  const { data, loading } = useQuery(ME);
  const matchContact = useMatch("/contacts/:id")?.params;

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
            element={<p>Contact with ID {matchContact?.id}</p>}
          />
        </Route>

        <Route path="/profile" element={<p>Profile Page</p>} />
        <Route path="/settings" element={<p>Settings Page</p>} />
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
