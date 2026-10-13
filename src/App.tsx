import { useEffect, useState } from "react";
import { Navigate, Route, useLocation, useNavigate } from "react-router-dom";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import LoginPage from "./pages/LoginPage";
import StudentDashboardPage from "./pages/StudentDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import OfficerDashboardPage from "./pages/OfficerDashboardPage";
import { getSession } from "./services/authService";
import { initializeStorage } from "./services/storageService";
import type { DemoSession } from "./types/models";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/variables.css";

setupIonicReact();

const Dashboard = ({
  session,
  onSessionChange,
}: {
  session: DemoSession;
  onSessionChange: (session: DemoSession | null) => void;
}) => {
  if (session.role === "student")
    return (
      <StudentDashboardPage
        session={session}
        onSessionChange={onSessionChange}
      />
    );
  if (session.role === "csg_administrator")
    return (
      <AdminDashboardPage session={session} onSessionChange={onSessionChange} />
    );
  return (
    <OfficerDashboardPage session={session} onSessionChange={onSessionChange} />
  );
};

const AppRoutes = () => {
  const [session, setSession] = useState<DemoSession | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    initializeStorage();
    setSession(getSession());
  }, []);
  useEffect(() => {
    if (session && location.pathname === "/login")
      navigate("/dashboard", { replace: true });
  }, [location.pathname, navigate, session]);
  const handleLogin = (next: DemoSession) => {
    setSession(next);
    navigate("/dashboard", { replace: true });
  };
  const handleSessionChange = (next: DemoSession | null) => {
    setSession(next);
    if (!next) navigate("/login", { replace: true });
  };
  return (
    <IonRouterOutlet>
      <Route
        path="/login"
        element={
          session ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage onLogin={handleLogin} />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          session ? (
            <Dashboard
              session={session}
              onSessionChange={handleSessionChange}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/"
        element={<Navigate to={session ? "/dashboard" : "/login"} replace />}
      />
      <Route
        element={<Navigate to={session ? "/dashboard" : "/login"} replace />}
      />
    </IonRouterOutlet>
  );
};

const App = () => (
  <IonApp>
    <IonReactRouter>
      <AppRoutes />
    </IonReactRouter>
  </IonApp>
);

export default App;
