import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { lazy, Suspense } from "react";
import Layout from "@/components/layout/Layout";
import LoadingScreen from "@/components/common/LoadingScreen";
import RequireAuth from "@/components/auth/RequireAuth";
import { AuthProvider } from "@/context/AuthContext";

// Lazy-loaded pages
const Home = lazy(() => import("@/pages/Home"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" richColors />
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />

              {/* Protected routes */}
              <Route element={<RequireAuth />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="analytics/:id" element={<Analytics />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
