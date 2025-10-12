import { Routes, Route, useMatch } from "react-router";
import { useQuery } from "@apollo/client/react";
import { ME } from "./graphql/queries";

const SignIn = () => <p>Sign In</p>;

const App = () => {
  const { data } = useQuery(ME);
  const matchChat = useMatch("/chats/:id")?.params;
  const matchContact = useMatch("/contacts/:id")?.params;

  const currentUser = data?.me;

  return (
    <Routes>
      <Route path="/" element={<p>Index</p>} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<p>Sign Up</p>} />
      <Route path="/chats" element={currentUser ? <p>Chats</p> : <SignIn />} />
      <Route
        path="/chats/:id"
        element={currentUser ? <p>Chat with ID {matchChat?.id}</p> : <SignIn />}
      />
      <Route
        path="/contacts"
        element={currentUser ? <p>Contacts</p> : <SignIn />}
      />
      <Route
        path="/contacts/:id"
        element={
          currentUser ? <p>Contact with ID {matchContact?.id}</p> : <SignIn />
        }
      />
      <Route
        path="/profile"
        element={currentUser ? <p>Profile</p> : <SignIn />}
      />
      <Route
        path="/settings"
        element={currentUser ? <p>Settings</p> : <SignIn />}
      />
      <Route path="/*" element={<p>Page Not Found</p>} />
    </Routes>
  );
};

export default App;
