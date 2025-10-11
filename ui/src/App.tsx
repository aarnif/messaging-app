import { Routes, Route, useMatch } from "react-router";

const App = () => {
  const matchChat = useMatch("/chats/:id")?.params;
  const matchContact = useMatch("/contacts/:id")?.params;

  return (
    <Routes>
      <Route path="/" element={<p>Index</p>} />
      <Route path="/signin" element={<p>Sign In</p>} />
      <Route path="/signup" element={<p>Sign Up</p>} />
      <Route path="/chats" element={<p>Chats</p>} />
      <Route path="/chats/:id" element={<p>Chat with ID {matchChat?.id}</p>} />
      <Route path="/contacts" element={<p>Contacts</p>} />
      <Route
        path="/contacts/:id"
        element={<p>Contact with ID {matchContact?.id}</p>}
      />
      <Route path="/profile" element={<p>Profile</p>} />
      <Route path="/settings" element={<p>Settings</p>} />
      <Route path="/*" element={<p>Page Not Found</p>} />
    </Routes>
  );
};

export default App;
