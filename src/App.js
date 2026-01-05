import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

// Shared components
import { NavigationBar, Footer, ErrorBoundary } from "./shared";

// Pages
import Home from "./pages/Home";
import About from "./pages/About";

// Features
import Submit from "./features/submissions/components/Submit";
import Login from "./features/auth/components/Login";
import { AdminProvider } from "./features/auth/contexts/AdminContext";
import ProtectedRoute from "./features/admin/routes/ProtectedRoute";
import AdminPanel from "./features/admin/components/AdminPanel";
import Diagnostics from "./features/admin/components/Diagnostics";
import SeeRecords from "./features/admin/components/SeeRecords";
import EventMenu from "./features/events/components/EventMenu";
import EventCreate from "./features/events/components/EventCreate";
import EventUpdate from "./features/events/components/EventUpdate";

function App() {
  return (
    <ErrorBoundary name="App">
      <AdminProvider>
        <Router>
          <NavigationBar />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/submit" element={<Submit />} />
            <Route path="/login" element={<Login />} />
            <Route path="/diagnostics" element={<Diagnostics />} />

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/records"
              element={
                <ProtectedRoute>
                  <SeeRecords />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events"
              element={
                <ProtectedRoute>
                  <EventMenu />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <EventCreate />
                </ProtectedRoute>
              }
            />
            <Route
              path="/update/:id"
              element={
                <ProtectedRoute>
                  <EventUpdate />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Footer />
        </Router>
      </AdminProvider>
    </ErrorBoundary>
  );
}

export default App;
