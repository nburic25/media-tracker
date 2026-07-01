import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";

import MediaList from "./MediaList";
import MediaDetails from "./MediaDetails";
import MyList from "./pages/MyList";
import AdminPanel from "./pages/AdminPanel"; // DODANO
import AdvancedSearch from "./pages/AdvancedSearch";

function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
        <Route path="/" element={<MediaList />} />
        <Route path="/media/:id" element={<MediaDetails />} />

        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* USER PROTECTED */}
        <Route
          path="/my-list"
          element={
            <ProtectedRoute>
              <MyList />
            </ProtectedRoute>
          }
        />

        {/* ADMIN PROTECTED */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        <Route path="/advanced-search" element={<AdvancedSearch />} />
      </Routes>
    </Router>
  );
}

export default App;