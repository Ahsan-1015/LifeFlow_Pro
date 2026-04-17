import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import ProjectModal from "../../components/modals/ProjectModal";
import SkeletonCard from "../../components/common/SkeletonCard";
import { useAuth } from "../../context/AuthContext";
import { normalizeRole } from "../../utils/roles";

const PROJECTS_CACHE_KEY = "flowpilot_projects_cache";

const ProjectsPage = () => {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const canManageProjects = role === "super_admin" || role === "owner";
  const [projects, setProjects] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadProjects = async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setPageLoading(true);
    }

    try {
      setError("");
      const { data } = await api.get("/projects");
      setProjects(data);
      sessionStorage.setItem(PROJECTS_CACHE_KEY, JSON.stringify(data));
    } catch (err) {
      const cached = sessionStorage.getItem(PROJECTS_CACHE_KEY);
      if (cached) {
        setProjects(JSON.parse(cached));
      }
      setError(err.userMessage || "Unable to load projects right now.");
    } finally {
      setPageLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const cached = sessionStorage.getItem(PROJECTS_CACHE_KEY);
    if (cached) {
      setProjects(JSON.parse(cached));
      setPageLoading(false);
      loadProjects({ silent: true });
      return;
    }

    loadProjects();
  }, []);

  const handleSave = async (payload) => {
    setLoading(true);
    try {
      if (editingProject) {
        await api.put(`/projects/${editingProject._id}`, payload);
      } else {
        await api.post("/projects", payload);
      }
      setModalOpen(false);
      setEditingProject(null);
      await loadProjects();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId) => {
    await api.delete(`/projects/${projectId}`);
    await loadProjects();
  };

  if (pageLoading) {
    return (
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonCard key={index} className="min-h-56" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          {refreshing ? <p className="text-sm text-slate-500">Refreshing projects...</p> : null}
          {error ? <p className="text-sm text-rose-600 dark:text-rose-300">{error}</p> : null}
          {!canManageProjects ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              You can view project boards shared with you, but project creation and edits are limited to owners and admins.
            </p>
          ) : null}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="rounded-2xl bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 dark:bg-slate-800/80 dark:text-slate-100"
            onClick={() => loadProjects({ silent: true })}
          >
            Retry
          </button>
          {canManageProjects ? (
            <button type="button" className="gradient-button" onClick={() => setModalOpen(true)}>
              <Plus size={18} />
              <span className="ml-2">Create Project</span>
            </button>
          ) : null}
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="glass-panel rounded-[2rem] p-10 text-center">
          <h3 className="font-display text-3xl font-bold">No projects yet</h3>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Create your first project to start organizing tasks, members, and deadlines.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project, index) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-panel rounded-[2rem] p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-brand-500">Project</p>
                  <h3 className="mt-2 font-display text-2xl font-bold">{project.title}</h3>
                </div>
                {canManageProjects ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProject(project);
                        setModalOpen(true);
                      }}
                      className="rounded-2xl bg-slate-100 p-3 dark:bg-slate-800"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(project._id)}
                      className="rounded-2xl bg-rose-100 p-3 text-rose-600 dark:bg-rose-500/10"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : null}
              </div>

              <p className="mt-4 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">{project.description}</p>

              <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
                <span>Deadline: {project.deadline ? new Date(project.deadline).toLocaleDateString() : "Flexible"}</span>
                <span className="flex items-center gap-2">
                  <Users size={16} />
                  {project.members?.length || 0}
                </span>
              </div>

              <Link
                to={`/projects/${project._id}`}
                className="mt-6 inline-flex rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white dark:bg-brand-500"
              >
                Open Board
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {canManageProjects ? (
        <ProjectModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingProject(null);
          }}
          onSubmit={handleSave}
          initialValues={editingProject}
          loading={loading}
        />
      ) : null}
    </>
  );
};

export default ProjectsPage;
