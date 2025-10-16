import { Routes, Route, useMatch, Navigate } from "react-router";
import { useQuery } from "@apollo/client/react";
import { ME } from "./graphql/queries";
import Home from "./components/Home";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import Chats from "./components/Chats";
import Contacts from "./components/Contacts";

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
        <Route path="/" element={<Chats />}>
          <Route
            index
            element={
              <div className="hidden flex-grow items-center justify-center sm:flex">
                <p className="rounded-xl bg-slate-200 p-2 font-semibold text-slate-800 dark:bg-slate-700 dark:text-slate-100">
                  Select Chat to Start Messaging.
                </p>
              </div>
            }
          />
          <Route
            path="/chats/:id"
            element={<p>Chat with ID {matchChat?.id}</p>}
          />
        </Route>

        <Route path="/contacts" element={<Contacts />}>
          <Route
            index
            element={
              <div className="hidden flex-grow items-center justify-center sm:flex">
                <p className="rounded-xl bg-slate-200 p-2 font-semibold text-slate-800 dark:bg-slate-700 dark:text-slate-100">
                  Select a contact for further information.
                </p>
              </div>
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
        </Route>

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
