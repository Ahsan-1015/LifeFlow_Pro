import { AlertCircle, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/client";
import { getSocket } from "../../api/socket";
import RoleGuard from "../../components/RoleGuard";
import Loader from "../../components/common/Loader";
import { useAuth } from "../../context/AuthContext";
import { normalizeRole, roleMenus } from "../../utils/roles";
import GuestDashboard from "./GuestDashboard";
import ManagerDashboard from "./ManagerDashboard";
import MemberDashboard from "./MemberDashboard";
import OwnerDashboard from "./OwnerDashboard";
import SuperAdminDashboard from "./SuperAdminDashboard";

const dashboardViews = {
  super_admin: SuperAdminDashboard,
  owner: OwnerDashboard,
  manager: ManagerDashboard,
  member: MemberDashboard,
  guest: GuestDashboard,
};

const defaultDashboardData = {
  role: "member",
  metrics: {
    totalProjects: 0,
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
    unreadNotifications: 0,
  },
  recentActivity: [],
  upcomingDeadlines: [],
  projects: [],
  charts: {},
  tables: {},
  feeds: {},
  boards: {},
};

const DashboardPage = () => {
  const { section: rawSection } = useParams();
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const [dashboard, setDashboard] = useState(defaultDashboardData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    const loadDashboard = async () => {
      setLoading(true);

      try {
        const { data } = await api.get("/dashboard");

        if (ignore) return;

        setDashboard({
          role: data?.role || role,
          metrics: {
            ...defaultDashboardData.metrics,
            ...(data?.metrics || {}),
          },
          recentActivity: data?.recentActivity || [],
          upcomingDeadlines: data?.upcomingDeadlines || [],
          projects: data?.projects || [],
          charts: data?.charts || {},
          tables: data?.tables || {},
          feeds: data?.feeds || {},
          boards: data?.boards || {},
        });
        setError("");
      } catch (requestError) {
        if (ignore) return;

        setError(
          requestError?.response?.data?.message ||
            "Unable to load this dashboard right now. Please refresh and try again."
        );
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      ignore = true;
    };
  }, [refreshKey, role]);

  useEffect(() => {
    const socket = getSocket();
    let refreshTimeout;

    dashboard.projects.forEach((project) => {
      if (project?._id) {
        socket.emit("project:join", project._id);
      }
    });

    const queueRefresh = () => {
      clearTimeout(refreshTimeout);
      refreshTimeout = setTimeout(() => {
        setRefreshKey((current) => current + 1);
      }, 250);
    };

    socket.on("task:created", queueRefresh);
    socket.on("task:updated", queueRefresh);
    socket.on("task:deleted", queueRefresh);
    socket.on("comment:created", queueRefresh);
    socket.on("notification:new", queueRefresh);

    return () => {
      clearTimeout(refreshTimeout);
      socket.off("task:created", queueRefresh);
      socket.off("task:updated", queueRefresh);
      socket.off("task:deleted", queueRefresh);
      socket.off("comment:created", queueRefresh);
      socket.off("notification:new", queueRefresh);
    };
  }, [dashboard.projects]);

  const allowedSections = useMemo(() => {
    const dashboardLinks = (roleMenus[role] || roleMenus.member).filter((item) => item.to.startsWith("/dashboard"));

    return new Set(
      dashboardLinks.map((item) => (item.to === "/dashboard" ? "overview" : item.to.replace("/dashboard/", "")))
    );
  }, [role]);

  const section = allowedSections.has(rawSection || "overview") ? rawSection || "overview" : "overview";
  const CurrentDashboard = dashboardViews[role] || MemberDashboard;

  return (
    <RoleGuard allowedRoles={["super_admin", "owner", "manager", "member", "guest"]} fallback="/">
      {loading ? <Loader label="Loading your role dashboard..." /> : null}

      {!loading ? (
        <div className="space-y-6">
          {error ? (
            <div className="glass-panel flex flex-col gap-4 rounded-[2rem] border border-rose-200/80 p-5 text-sm text-rose-700 dark:border-rose-500/20 dark:text-rose-200 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 shrink-0" size={18} />
                <div>
                  <p className="font-semibold">Dashboard data needs another try</p>
                  <p className="mt-1 text-rose-600/90 dark:text-rose-200/80">{error}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRefreshKey((current) => current + 1)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-500 px-4 py-2 font-semibold text-white transition hover:bg-rose-600"
              >
                <RefreshCw size={16} />
                Retry
              </button>
            </div>
          ) : null}

          <CurrentDashboard
            dashboard={dashboard}
            section={section}
            onRefresh={() => setRefreshKey((current) => current + 1)}
          />
        </div>
      ) : null}
    </RoleGuard>
  );
};

export default DashboardPage;
