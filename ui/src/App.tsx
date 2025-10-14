import { Routes, Route, useMatch, Navigate } from "react-router";
import { useQuery } from "@apollo/client/react";
import { ME } from "./graphql/queries";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";

const App = () => {
  const { data, loading } = useQuery(ME);
  const matchChat = useMatch("/chats/:id")?.params;
  const matchContact = useMatch("/contacts/:id")?.params;

  if (loading) {
    return null;
  }

  const currentUser = data?.me;

  return (
    <Routes>
      <Route
        path="/"
        element={currentUser ? <Navigate to="/chats" replace /> : <SignIn />}
      />
      <Route
        path="/signin"
        element={currentUser ? <Navigate to="/chats" replace /> : <SignIn />}
      />
      <Route
        path="/signup"
        element={currentUser ? <Navigate to="/chats" replace /> : <SignUp />}
      />
      <Route
        path="/chats"
        element={currentUser ? <p>Chats</p> : <Navigate to="/signin" replace />}
      />
      <Route
        path="/chats/:id"
        element={
          currentUser ? (
            <p>Chat with ID {matchChat?.id}</p>
          ) : (
            <Navigate to="/signin" replace />
          )
        }
      />
      <Route
        path="/contacts"
        element={
          currentUser ? <p>Contacts</p> : <Navigate to="/signin" replace />
        }
      />
      <Route
        path="/contacts/:id"
        element={
          currentUser ? (
            <p>Contact with ID {matchContact?.id}</p>
          ) : (
            <Navigate to="/signin" replace />
          )
        }
      />
      <Route
        path="/profile"
        element={
          currentUser ? <p>Profile</p> : <Navigate to="/signin" replace />
        }
      />
      <Route
        path="/settings"
        element={
          currentUser ? <p>Settings</p> : <Navigate to="/signin" replace />
        }
      />
      <Route path="/*" element={<p>Page Not Found</p>} />
    </Routes>
  );
};

export default App;
