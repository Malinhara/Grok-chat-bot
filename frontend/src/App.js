import { Route, BrowserRouter as Router, Routes } from "react-router-dom"; // Import necessary components
import IframeChat from "./components/Iframeagent";
import Mainchat from "./pages/mainchat";
import Signin from "./pages/Login";
import Register from "./pages/Register";




function App() {
  return (
    <Router> {/* Use Router as an alias for BrowserRouter */}

      <Routes> {/* Use Routes to define your route mapping */}
        <Route path="/" element={<Signin/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/chat" element={<Mainchat/>} />
        <Route path="/viewownagent" element={<IframeChat />} />

      </Routes>

    </Router>
 



  );
}

export default App;