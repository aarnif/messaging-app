import { Routes, Route, useMatch, Navigate } from "react-router";
import { useQuery } from "@apollo/client/react";
import { ME } from "./graphql/queries";
import Home from "./components/Home";
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
        element={currentUser ? <Home /> : <Navigate to="/signin" replace />}
      >
        <Route index element={<p>Chats Page</p>} />
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
            currentUser ? (
              <p>Contacts Page</p>
            ) : (
              <Navigate to="/signin" replace />
            )
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
            currentUser ? (
              <p>Profile Page</p>
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />
        <Route
          path="/settings"
          element={
            currentUser ? (
              <p>Settings Page</p>
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />
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
