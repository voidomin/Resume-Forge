import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import React, { Suspense } from "react";

// Lazy-loaded components
const Login = React.lazy(() => import("./pages/Login"));
const Register = React.lazy(() => import("./pages/Register"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const ProfileEdit = React.lazy(() => import("./pages/ProfileEdit"));
const ResumeGenerator = React.lazy(() => import("./pages/ResumeGenerator"));
const ResumeView = React.lazy(() => import("./pages/ResumeView"));

// Suspense Fallback
const PageLoader = () => (
  <div className="flex h-[80vh] w-full items-center justify-center">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
  </div>
);

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Toaster position="top-right" />
        <Header />
        <main className="flex-1">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public routes */}
              <Route
                path="/login"
                element={
                  !isAuthenticated ? <Login /> : <Navigate to="/dashboard" />
                }
              />
              <Route
                path="/register"
                element={
                  !isAuthenticated ? <Register /> : <Navigate to="/dashboard" />
                }
              />

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  isAuthenticated ? <Dashboard /> : <Navigate to="/login" />
                }
              />
              <Route
                path="/profile"
                element={
                  isAuthenticated ? <ProfileEdit /> : <Navigate to="/login" />
                }
              />
              <Route
                path="/resume/new"
                element={
                  isAuthenticated ? (
                    <ResumeGenerator />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/resume/:id"
                element={
                  isAuthenticated ? <ResumeView /> : <Navigate to="/login" />
                }
              />

              {/* Default redirect */}
              <Route
                path="/"
                element={
                  <Navigate to={isAuthenticated ? "/dashboard" : "/login"} />
                }
              />
              <Route
                path="*"
                element={
                  <Navigate to={isAuthenticated ? "/dashboard" : "/login"} />
                }
              />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
