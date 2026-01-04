import { Routes, Route, Navigate } from "react-router";
import { useQuery } from "@apollo/client/react";
import { ME } from "./graphql/queries";
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
import LoadingPage from "./components/LoadingPage";
import type { User } from "./__generated__/graphql";

const App = () => {
  const { data, loading } = useQuery(ME);
  const searchWord = useField(
    "search-chats",
    "text",
    "Search by title or description..."
  );

  if (loading) {
    return <LoadingPage />;
  }

  const currentUser = data?.me;

  return (
    <ModalProvider>
      <Routes>
        <Route
          path="/"
          element={currentUser ? <Home /> : <Navigate to="/signin" replace />}
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
            <Route
              index
              element={<Profile currentUser={currentUser as User} />}
            />
            <Route
              path="profile"
              element={<Profile currentUser={currentUser as User} />}
            />
            <Route
              path="appearance"
              element={<Appearance currentUser={currentUser as User} />}
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
    </ModalProvider>
  );
};

export default App;
