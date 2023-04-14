import "./App.css";
// import { Button } from '@chakra-ui/react';
import { Routes, Route, BrowserRouter } from "react-router-dom";
import HomePage from "./components/HomePage";
import ChatPage from "./components/ChatPage";
import ChatProvider from "./context/chatProvider";

function App() {
  return (
    <BrowserRouter>
      <ChatProvider>
          <div className="App">
            <Routes>
              <Route exact path="/" element={<HomePage />} />
              <Route exact path="/chats" element={<ChatPage />} />
              {/* <Button colorScheme='blue' variant="ghost">Button</Button>  */}
            </Routes>
          </div>
      </ChatProvider>
    </BrowserRouter>
  );
}

export default App;