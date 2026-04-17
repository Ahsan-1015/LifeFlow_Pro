import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/common/ProtectedRoute";
import RoleGuard from "./components/RoleGuard";
import AppLayout from "./layouts/AppLayout";
import Home from "./pages/Home";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfilePage from "./pages/profile/ProfilePage";
import ProjectBoardPage from "./pages/projects/ProjectBoardPage";
import ProjectsPage from "./pages/projects/ProjectsPage";
import SearchPage from "./pages/SearchPage";

const App = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />

    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout title="Dashboard" description="Your project pulse at a glance." />}>
        <Route path="/dashboard/:section?" element={<DashboardPage />} />
      </Route>

      <Route
        element={<AppLayout title="Projects" description="Create, plan, and collaborate across every board." />}
      >
        <Route
          path="/projects"
          element={
            <RoleGuard allowedRoles={["super_admin", "owner", "manager", "member"]}>
              <ProjectsPage />
            </RoleGuard>
          }
        />
      </Route>

      <Route
        element={<AppLayout title="Board" description="Drag work forward, assign owners, and track delivery." />}
      >
        <Route
          path="/projects/:projectId"
          element={
            <RoleGuard allowedRoles={["super_admin", "owner", "manager", "member"]}>
              <ProjectBoardPage />
            </RoleGuard>
          }
        />
      </Route>

      <Route
        element={<AppLayout title="Notifications" description="Stay on top of assignments, comments, and updates." />}
      >
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>

      <Route
        element={<AppLayout title="Search" description="Find projects, tasks, and teammates instantly." />}
      >
        <Route
          path="/search"
          element={
            <RoleGuard allowedRoles={["super_admin", "owner", "manager"]}>
              <SearchPage />
            </RoleGuard>
          }
        />
      </Route>

      <Route element={<AppLayout title="Profile" description="Update your identity, avatar, and credentials." />}>
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
    </Route>
  </Routes>
);

export default App;
