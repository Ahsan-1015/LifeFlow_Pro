import { motion } from "framer-motion";
import {
  BellRing,
  Building2,
  CalendarClock,
  DatabaseBackup,
  Globe,
  Languages,
  LockKeyhole,
  Paintbrush2,
  ReceiptText,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
  UserCog,
  UserPlus,
  Workflow,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import api from "../../api/client";

const STORAGE_KEY = "taskflowpro_owner_settings";

const settingsSections = [
  { key: "general", label: "General", icon: Building2 },
  { key: "project", label: "Project Settings", icon: Workflow },
  { key: "team", label: "Team & Permissions", icon: UserCog },
  { key: "notifications", label: "Notifications", icon: BellRing },
  { key: "security", label: "Security", icon: LockKeyhole },
  { key: "billing", label: "Billing / Plan", icon: ReceiptText },
  { key: "integrations", label: "Integrations", icon: Zap },
  { key: "branding", label: "Branding", icon: Paintbrush2 },
  { key: "backup", label: "Data & Backup", icon: DatabaseBackup },
  { key: "danger", label: "Danger Zone", icon: Trash2 },
];

const defaultWorkspaceSettings = {
  workspaceName: "TaskFlow Workspace",
  timeZone: "Asia/Dhaka",
  language: "English",
  dateFormat: "DD/MM/YYYY",
  logoName: "",
  coverImageName: "",
  customColumns: ["Todo", "In Progress", "Review", "Done"],
  autoAssignNewTasks: false,
  defaultPriority: "medium",
  taskPrefix: "TSK",
  notifications: {
    newTaskAssigned: true,
    deadlineMissed: true,
    newComment: true,
    projectCompleted: true,
    weeklyReportEmail: true,
    teamJoined: true,
    channelInApp: true,
    channelEmail: true,
    channelSms: false,
  },
  security: {
    twoFactorAuth: false,
    trustedDevices: true,
    loginSessionAlerts: true,
    forceLogoutReady: false,
    ipRestrictions: false,
  },
  integrations: {
    slack: false,
    googleCalendar: true,
    zoom: false,
    github: false,
    googleDrive: true,
    discord: false,
  },
  branding: {
    companyLogoName: "",
    brandColor: "#2563eb",
    themeColor: "#0f172a",
    customDomain: "",
  },
  lastUpdatedAt: "",
};

const ToggleField = ({ label, hint, checked, onChange }) => (
  <label className="flex items-start justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white/70 p-4 transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/70">
    <div>
      <p className="font-semibold text-slate-900 dark:text-white">{label}</p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{hint}</p>
    </div>
    <span
      className={`relative mt-1 inline-flex h-7 w-12 shrink-0 rounded-full transition ${
        checked ? "bg-brand-500" : "bg-slate-300 dark:bg-slate-700"
      }`}
    >
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={onChange} />
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </span>
  </label>
);

const FieldShell = ({ label, hint, children }) => (
  <label className="block rounded-3xl border border-slate-200/80 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/70">
    <p className="font-semibold text-slate-900 dark:text-white">{label}</p>
    {hint ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{hint}</p> : null}
    <div className="mt-4">{children}</div>
  </label>
);

const SectionCard = ({ icon: Icon, title, description, children }) => (
  <motion.section
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-panel rounded-[2rem] p-6"
  >
    <div className="mb-5 flex items-start gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-500 text-white shadow-lg shadow-brand-500/20">
        <Icon size={20} />
      </div>
      <div>
        <h3 className="font-display text-2xl font-bold">{title}</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
    </div>
    {children}
  </motion.section>
);

const badgeClassNames = {
  admin: "bg-brand-500/10 text-brand-600 dark:text-brand-300",
  manager: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  member: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
};

const OwnerSettingsPanel = ({ dashboard, onRefresh }) => {
  const restoreInputRef = useRef(null);
  const [activeSection, setActiveSection] = useState("general");
  const [selectedProjectId, setSelectedProjectId] = useState(dashboard.projects?.[0]?._id || "");
  const [workspaceSettings, setWorkspaceSettings] = useState(defaultWorkspaceSettings);
  const [projectDraft, setProjectDraft] = useState({
    projectName: "",
    description: "",
    deadline: "",
  });
  const [inviteForm, setInviteForm] = useState({
    projectId: dashboard.projects?.[0]?._id || "",
    email: "",
    role: "member",
  });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [transferEmail, setTransferEmail] = useState("");
  const [saveState, setSaveState] = useState("idle");
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [savingKey, setSavingKey] = useState("");

  const projectOptions = useMemo(
    () =>
      (dashboard.projects || []).map((project) => ({
        id: String(project._id),
        title: project.title,
        description: project.description || "",
        deadline: project.deadline ? new Date(project.deadline).toISOString().slice(0, 10) : "",
      })),
    [dashboard.projects]
  );

  const selectedProject = useMemo(
    () => projectOptions.find((project) => project.id === selectedProjectId) || projectOptions[0],
    [projectOptions, selectedProjectId]
  );

  const teamDirectory = dashboard.tables?.teamDirectory || [];
  const billingSummary = dashboard.tables?.billingSummary || [];
  const taskOperations = dashboard.tables?.taskOperations || [];

  const teamRows = useMemo(
    () => teamDirectory.filter((member) => String(member.projectId) === String(selectedProjectId)),
    [selectedProjectId, teamDirectory]
  );

  useEffect(() => {
    const storedSettings = localStorage.getItem(STORAGE_KEY);
    if (!storedSettings) return;

    try {
      setWorkspaceSettings((current) => ({
        ...current,
        ...JSON.parse(storedSettings),
      }));
    } catch (error) {
      console.error("Failed to parse saved owner settings", error);
    }
  }, []);

  useEffect(() => {
    if (!projectOptions.length) return;

    setSelectedProjectId((current) =>
      projectOptions.some((project) => project.id === current) ? current : projectOptions[0].id
    );
    setInviteForm((current) => ({
      ...current,
      projectId: projectOptions.some((project) => project.id === current.projectId)
        ? current.projectId
        : projectOptions[0].id,
    }));
  }, [projectOptions]);

  useEffect(() => {
    if (!selectedProject) return;

    setProjectDraft({
      projectName: selectedProject.title,
      description: selectedProject.description,
      deadline: selectedProject.deadline,
    });
  }, [selectedProject]);

  const setWorkspaceValue = (key, value) =>
    setWorkspaceSettings((current) => ({
      ...current,
      [key]: value,
    }));

  const updateNestedSetting = (group, key, value) =>
    setWorkspaceSettings((current) => ({
      ...current,
      [group]: {
        ...current[group],
        [key]: value,
      },
    }));

  const pushFeedback = (type, message) => setFeedback({ type, message });

  const handleSaveAll = async () => {
    if (!selectedProjectId) {
      pushFeedback("error", "Select a project before saving owner settings.");
      return;
    }

    try {
      setSavingKey("save-all");
      pushFeedback("", "");

      await api.put(`/projects/${selectedProjectId}`, {
        title: projectDraft.projectName,
        description: projectDraft.description,
        deadline: projectDraft.deadline || null,
      });

      const nextUpdatedAt = new Date().toISOString();
      const nextSettings = {
        ...workspaceSettings,
        lastUpdatedAt: nextUpdatedAt,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSettings));
      setWorkspaceSettings(nextSettings);
      setSaveState("saved");
      pushFeedback("success", "Owner settings saved successfully.");
      onRefresh?.();

      window.clearTimeout(window.__taskflowOwnerSettingsTimer);
      window.__taskflowOwnerSettingsTimer = window.setTimeout(() => {
        setSaveState("idle");
      }, 2200);
    } catch (error) {
      pushFeedback("error", error.userMessage || "Unable to save owner settings right now.");
    } finally {
      setSavingKey("");
    }
  };

  const handleInviteMember = async (event) => {
    event.preventDefault();

    try {
      setSavingKey("invite-member");
      pushFeedback("", "");
      await api.post(`/projects/${inviteForm.projectId}/invite`, {
        email: inviteForm.email,
        role: inviteForm.role,
      });
      setInviteForm((current) => ({ ...current, email: "", role: "member" }));
      pushFeedback("success", "Member invited successfully.");
      onRefresh?.();
    } catch (error) {
      pushFeedback("error", error.userMessage || "Unable to invite this member right now.");
    } finally {
      setSavingKey("");
    }
  };

  const handleMemberRoleUpdate = async (member, nextRole) => {
    try {
      setSavingKey(`role:${member.id}`);
      pushFeedback("", "");
      await api.patch(`/projects/${member.projectId}/members/${member.memberId}`, { role: nextRole });
      pushFeedback("success", `${member.name}'s role was updated to ${nextRole}.`);
      onRefresh?.();
    } catch (error) {
      pushFeedback("error", error.userMessage || `Unable to update ${member.name}'s role right now.`);
    } finally {
      setSavingKey("");
    }
  };

  const handleRemoveMember = async (member) => {
    const confirmed = window.confirm(`Remove ${member.name} from ${member.project}?`);
    if (!confirmed) return;

    try {
      setSavingKey(`remove:${member.id}`);
      pushFeedback("", "");
      await api.delete(`/projects/${member.projectId}/members/${member.memberId}`);
      pushFeedback("success", `${member.name} was removed from ${member.project}.`);
      onRefresh?.();
    } catch (error) {
      pushFeedback("error", error.userMessage || `Unable to remove ${member.name} right now.`);
    } finally {
      setSavingKey("");
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();

    try {
      setSavingKey("password");
      pushFeedback("", "");
      await api.put("/profile/password", passwords);
      setPasswords({ currentPassword: "", newPassword: "" });
      pushFeedback("success", "Password updated successfully.");
    } catch (error) {
      pushFeedback("error", error.userMessage || "Unable to change password right now.");
    } finally {
      setSavingKey("");
    }
  };

  const downloadFile = (name, content, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportWorkspaceJson = () => {
    const payload = {
      workspaceSettings,
      selectedProject,
      teamRows,
      billingSummary,
      exportedAt: new Date().toISOString(),
    };
    downloadFile("taskflow-owner-workspace.json", JSON.stringify(payload, null, 2), "application/json");
    pushFeedback("success", "Workspace data exported as JSON.");
  };

  const exportTasksReport = () => {
    const csvRows = [
      ["Task", "Project", "Assignee", "Priority", "Status", "Deadline"].join(","),
      ...taskOperations.map((task) =>
        [task.task, task.project, task.assignee, task.priority, task.status, task.deadline]
          .map((value) => `"${String(value || "").replace(/"/g, '""')}"`)
          .join(",")
      ),
    ];

    downloadFile("taskflow-tasks-report.csv", csvRows.join("\n"), "text/csv;charset=utf-8;");
    pushFeedback("success", "Tasks report downloaded successfully.");
  };

  const backupWorkspace = () => {
    const snapshot = {
      workspaceSettings,
      projectDraft,
      inviteDefaults: inviteForm.role,
      backedUpAt: new Date().toISOString(),
    };
    downloadFile("taskflow-workspace-backup.json", JSON.stringify(snapshot, null, 2), "application/json");
    pushFeedback("success", "Workspace backup downloaded.");
  };

  const restoreBackup = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (parsed.workspaceSettings) {
        setWorkspaceSettings((current) => ({
          ...current,
          ...parsed.workspaceSettings,
        }));
      }
      if (parsed.projectDraft) {
        setProjectDraft((current) => ({
          ...current,
          ...parsed.projectDraft,
        }));
      }
      pushFeedback("success", "Backup restored into the settings workspace.");
    } catch (error) {
      pushFeedback("error", "Unable to restore this backup file.");
    } finally {
      event.target.value = "";
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProjectId) {
      pushFeedback("error", "Select a project before deleting it.");
      return;
    }

    if (deleteConfirm !== "DELETE") {
      pushFeedback("error", "Type DELETE to confirm project removal.");
      return;
    }

    try {
      setSavingKey("delete-project");
      pushFeedback("", "");
      await api.delete(`/projects/${selectedProjectId}`);
      setDeleteConfirm("");
      pushFeedback("success", "Project deleted permanently.");
      onRefresh?.();
    } catch (error) {
      pushFeedback("error", error.userMessage || "Unable to delete this project right now.");
    } finally {
      setSavingKey("");
    }
  };

  const handleArchiveProject = () => {
    pushFeedback("error", "Archive workflow is not connected yet. Delete or update the project for now.");
  };

  const handleTransferOwnership = () => {
    pushFeedback(
      "error",
      transferEmail
        ? `Transfer to ${transferEmail} is staged in the UI, but the backend ownership transfer route is not connected yet.`
        : "Enter the future owner email first."
    );
  };

  const renderGeneralSection = () => (
    <SectionCard
      icon={Building2}
      title="General Settings"
      description="Control workspace identity, project details, timezone, and presentation defaults."
    >
      <div className="grid gap-4 xl:grid-cols-2">
        <FieldShell label="Current Project" hint="Choose which project the owner settings should target right now.">
          <select
            className="input-field"
            value={selectedProjectId}
            onChange={(event) => {
              setSelectedProjectId(event.target.value);
              setInviteForm((current) => ({ ...current, projectId: event.target.value }));
            }}
          >
            {projectOptions.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </FieldShell>

        <FieldShell label="Workspace Name" hint="Used for your owner-facing workspace label and internal organization.">
          <input
            className="input-field"
            value={workspaceSettings.workspaceName}
            onChange={(event) => setWorkspaceValue("workspaceName", event.target.value)}
            placeholder="TaskFlow Marketing"
          />
        </FieldShell>

        <FieldShell label="Project Name">
          <input
            className="input-field"
            value={projectDraft.projectName}
            onChange={(event) => setProjectDraft((current) => ({ ...current, projectName: event.target.value }))}
            placeholder="Project name"
          />
        </FieldShell>

        <FieldShell label="Delivery Deadline">
          <input
            type="date"
            className="input-field"
            value={projectDraft.deadline}
            onChange={(event) => setProjectDraft((current) => ({ ...current, deadline: event.target.value }))}
          />
        </FieldShell>

        <FieldShell label="Description" hint="Tell teammates and clients what this workspace is for.">
          <textarea
            className="input-field min-h-32"
            value={projectDraft.description}
            onChange={(event) => setProjectDraft((current) => ({ ...current, description: event.target.value }))}
            placeholder="Describe the project scope, goals, and delivery expectation."
          />
        </FieldShell>

        <div className="grid gap-4">
          <FieldShell label="Logo Upload" hint="Stored locally in the owner settings layer for now.">
            <input
              type="file"
              accept="image/*"
              className="block w-full text-sm"
              onChange={(event) =>
                setWorkspaceValue("logoName", event.target.files?.[0]?.name || workspaceSettings.logoName)
              }
            />
            {workspaceSettings.logoName ? (
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{workspaceSettings.logoName}</p>
            ) : null}
          </FieldShell>

          <FieldShell label="Cover Image">
            <input
              type="file"
              accept="image/*"
              className="block w-full text-sm"
              onChange={(event) =>
                setWorkspaceValue("coverImageName", event.target.files?.[0]?.name || workspaceSettings.coverImageName)
              }
            />
            {workspaceSettings.coverImageName ? (
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{workspaceSettings.coverImageName}</p>
            ) : null}
          </FieldShell>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <FieldShell label="Time Zone">
          <select
            className="input-field"
            value={workspaceSettings.timeZone}
            onChange={(event) => setWorkspaceValue("timeZone", event.target.value)}
          >
            <option value="Asia/Dhaka">Asia/Dhaka</option>
            <option value="UTC">UTC</option>
            <option value="Europe/London">Europe/London</option>
            <option value="America/New_York">America/New_York</option>
          </select>
        </FieldShell>

        <FieldShell label="Language">
          <select
            className="input-field"
            value={workspaceSettings.language}
            onChange={(event) => setWorkspaceValue("language", event.target.value)}
          >
            <option value="English">English</option>
            <option value="Bangla">Bangla</option>
            <option value="Arabic">Arabic</option>
          </select>
        </FieldShell>

        <FieldShell label="Date Format">
          <select
            className="input-field"
            value={workspaceSettings.dateFormat}
            onChange={(event) => setWorkspaceValue("dateFormat", event.target.value)}
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </FieldShell>
      </div>
    </SectionCard>
  );

  const renderProjectSettings = () => (
    <SectionCard
      icon={Workflow}
      title="Project Settings"
      description="Set default workflow behavior, columns, and automation preferences for owned workspaces."
    >
      <div className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
        <FieldShell label="Default Task Statuses" hint="These columns shape how tasks move through delivery.">
          <div className="space-y-3">
            {workspaceSettings.customColumns.map((column, index) => (
              <div key={`${column}-${index}`} className="flex gap-3">
                <input
                  className="input-field"
                  value={column}
                  onChange={(event) =>
                    setWorkspaceValue(
                      "customColumns",
                      workspaceSettings.customColumns.map((item, itemIndex) =>
                        itemIndex === index ? event.target.value : item
                      )
                    )
                  }
                />
                <button
                  type="button"
                  className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-600 dark:text-rose-300"
                  onClick={() =>
                    setWorkspaceValue(
                      "customColumns",
                      workspaceSettings.customColumns.filter((_, itemIndex) => itemIndex !== index)
                    )
                  }
                  disabled={workspaceSettings.customColumns.length <= 1}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setWorkspaceValue("customColumns", [...workspaceSettings.customColumns, "NEW COLUMN"])
              }
              className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white dark:bg-brand-500"
            >
              Add Custom Column
            </button>
          </div>
        </FieldShell>

        <div className="grid gap-4">
          <ToggleField
            label="Auto assign new tasks"
            hint="Automatically keep the current assignee when similar tasks are created."
            checked={workspaceSettings.autoAssignNewTasks}
            onChange={(event) => setWorkspaceValue("autoAssignNewTasks", event.target.checked)}
          />

          <FieldShell label="Default Priority">
            <select
              className="input-field"
              value={workspaceSettings.defaultPriority}
              onChange={(event) => setWorkspaceValue("defaultPriority", event.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </FieldShell>

          <FieldShell label="Task Number Prefix">
            <input
              className="input-field"
              value={workspaceSettings.taskPrefix}
              onChange={(event) => setWorkspaceValue("taskPrefix", event.target.value.toUpperCase())}
              placeholder="TSK"
            />
          </FieldShell>
        </div>
      </div>
    </SectionCard>
  );

  const renderTeamSection = () => (
    <SectionCard
      icon={UserCog}
      title="Team & Permissions"
      description="Invite teammates, change project roles, and keep project access organized."
    >
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={handleInviteMember} className="rounded-3xl border border-slate-200/80 bg-white/70 p-5 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex items-center gap-3">
            <UserPlus className="text-brand-500" />
            <div>
              <h4 className="font-display text-2xl font-bold">Invite Member</h4>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Add managers, members, and admins to the selected project.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <FieldShell label="Project">
              <select
                className="input-field"
                value={inviteForm.projectId}
                onChange={(event) => setInviteForm((current) => ({ ...current, projectId: event.target.value }))}
              >
                {projectOptions.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </FieldShell>

            <FieldShell label="Email">
              <input
                type="email"
                className="input-field"
                value={inviteForm.email}
                onChange={(event) => setInviteForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="member@company.com"
                required
              />
            </FieldShell>

            <FieldShell label="Role">
              <select
                className="input-field"
                value={inviteForm.role}
                onChange={(event) => setInviteForm((current) => ({ ...current, role: event.target.value }))}
              >
                <option value="admin">Owner Admin</option>
                <option value="manager">Manager</option>
                <option value="member">Member</option>
              </select>
            </FieldShell>
          </div>

          <button
            type="submit"
            disabled={savingKey === "invite-member"}
            className="gradient-button mt-6 w-full"
          >
            {savingKey === "invite-member" ? "Inviting..." : "Invite Member"}
          </button>
        </form>

        <div className="space-y-3">
          {teamRows.length > 0 ? (
            teamRows.map((member) => {
              const roleSaving = savingKey === `role:${member.id}`;
              const removing = savingKey === `remove:${member.id}`;

              return (
                <div
                  key={member.id}
                  className="rounded-3xl border border-slate-200/80 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/70"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.name} className="h-12 w-12 rounded-2xl object-cover" />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-500 font-bold text-white">
                          {member.name?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-semibold text-slate-900 dark:text-white">{member.name}</p>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClassNames[member.role] || "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>
                            {member.role}
                          </span>
                        </div>
                        <p className="truncate text-sm text-slate-500 dark:text-slate-400">{member.email}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
                      <select
                        className="input-field min-w-[150px] py-2.5"
                        defaultValue={member.role}
                        onChange={(event) => handleMemberRoleUpdate(member, event.target.value)}
                        disabled={roleSaving || removing}
                      >
                        <option value="admin">Owner Admin</option>
                        <option value="manager">Manager</option>
                        <option value="member">Member</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => pushFeedback("error", "Suspend access needs a dedicated backend policy route. Use Remove User for now.")}
                        className="rounded-2xl bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-600 dark:text-amber-300"
                      >
                        Suspend Access
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member)}
                        disabled={roleSaving || removing}
                        className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-600 dark:text-rose-300"
                      >
                        {removing ? "Removing..." : "Remove User"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-3xl border border-slate-200/80 bg-white/70 p-5 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
              No team members are assigned to this project yet.
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );

  const renderNotificationsSection = () => (
    <SectionCard
      icon={BellRing}
      title="Notification Settings"
      description="Choose which project alerts should reach you and through which channel."
    >
      <div className="grid gap-4 xl:grid-cols-2">
        <ToggleField
          label="New Task Assigned"
          hint="Be notified when a new task is assigned to your workspace."
          checked={workspaceSettings.notifications.newTaskAssigned}
          onChange={(event) => updateNestedSetting("notifications", "newTaskAssigned", event.target.checked)}
        />
        <ToggleField
          label="Deadline Missed"
          hint="Get alerted as soon as a task or milestone slips."
          checked={workspaceSettings.notifications.deadlineMissed}
          onChange={(event) => updateNestedSetting("notifications", "deadlineMissed", event.target.checked)}
        />
        <ToggleField
          label="New Comment"
          hint="Stay in sync when collaborators add new comments."
          checked={workspaceSettings.notifications.newComment}
          onChange={(event) => updateNestedSetting("notifications", "newComment", event.target.checked)}
        />
        <ToggleField
          label="Project Completed"
          hint="Receive a summary when a project crosses the finish line."
          checked={workspaceSettings.notifications.projectCompleted}
          onChange={(event) => updateNestedSetting("notifications", "projectCompleted", event.target.checked)}
        />
        <ToggleField
          label="Weekly Report Email"
          hint="Send a weekly delivery report to the owner inbox."
          checked={workspaceSettings.notifications.weeklyReportEmail}
          onChange={(event) => updateNestedSetting("notifications", "weeklyReportEmail", event.target.checked)}
        />
        <ToggleField
          label="Team Joined"
          hint="Know when a new teammate accepts access to a project."
          checked={workspaceSettings.notifications.teamJoined}
          onChange={(event) => updateNestedSetting("notifications", "teamJoined", event.target.checked)}
        />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <ToggleField
          label="In-app"
          hint="Show alerts inside TaskFlow."
          checked={workspaceSettings.notifications.channelInApp}
          onChange={(event) => updateNestedSetting("notifications", "channelInApp", event.target.checked)}
        />
        <ToggleField
          label="Email"
          hint="Send important notices to your email."
          checked={workspaceSettings.notifications.channelEmail}
          onChange={(event) => updateNestedSetting("notifications", "channelEmail", event.target.checked)}
        />
        <ToggleField
          label="SMS"
          hint="Reserved for premium alerting."
          checked={workspaceSettings.notifications.channelSms}
          onChange={(event) => updateNestedSetting("notifications", "channelSms", event.target.checked)}
        />
      </div>
    </SectionCard>
  );

  const renderSecuritySection = () => (
    <SectionCard
      icon={ShieldCheck}
      title="Security Settings"
      description="Protect the owner workspace with password controls, login protections, and device-level safeguards."
    >
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <form onSubmit={handleChangePassword} className="rounded-3xl border border-slate-200/80 bg-white/70 p-5 dark:border-slate-800 dark:bg-slate-900/70">
          <h4 className="font-display text-2xl font-bold">Change Password</h4>
          <div className="mt-5 space-y-4">
            <input
              type="password"
              className="input-field"
              placeholder="Current password"
              value={passwords.currentPassword}
              onChange={(event) => setPasswords((current) => ({ ...current, currentPassword: event.target.value }))}
            />
            <input
              type="password"
              className="input-field"
              placeholder="New password"
              value={passwords.newPassword}
              onChange={(event) => setPasswords((current) => ({ ...current, newPassword: event.target.value }))}
            />
          </div>
          <button type="submit" disabled={savingKey === "password"} className="gradient-button mt-6 w-full">
            {savingKey === "password" ? "Updating..." : "Update Password"}
          </button>
        </form>

        <div className="grid gap-4">
          <ToggleField
            label="Two-Factor Authentication"
            hint="Keep owner access protected with an extra verification step."
            checked={workspaceSettings.security.twoFactorAuth}
            onChange={(event) => updateNestedSetting("security", "twoFactorAuth", event.target.checked)}
          />
          <ToggleField
            label="Trusted Devices"
            hint="Remember approved devices for faster but still controlled access."
            checked={workspaceSettings.security.trustedDevices}
            onChange={(event) => updateNestedSetting("security", "trustedDevices", event.target.checked)}
          />
          <ToggleField
            label="Login Session Alerts"
            hint="Receive a notice when a new session starts."
            checked={workspaceSettings.security.loginSessionAlerts}
            onChange={(event) => updateNestedSetting("security", "loginSessionAlerts", event.target.checked)}
          />
          <ToggleField
            label="IP Restrictions"
            hint="Premium control for limiting access to trusted networks."
            checked={workspaceSettings.security.ipRestrictions}
            onChange={(event) => updateNestedSetting("security", "ipRestrictions", event.target.checked)}
          />
          <button
            type="button"
            onClick={() => pushFeedback("success", "All active sessions are marked for owner review in this UI layer.")}
            className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white dark:bg-brand-500"
          >
            Force Logout All Devices
          </button>
        </div>
      </div>
    </SectionCard>
  );

  const renderBillingSection = () => (
    <SectionCard
      icon={ReceiptText}
      title="Billing / Subscription"
      description="Review current workspace size, estimated plan fit, and billing-style operational details."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl bg-slate-950 p-5 text-white dark:bg-slate-800">
          <p className="text-sm text-white/70">Current Plan</p>
          <p className="mt-3 font-display text-3xl font-bold">
            {billingSummary[0]?.plan || "Starter"}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200/80 bg-white/70 p-5 dark:border-slate-800 dark:bg-slate-900/70">
          <p className="text-sm text-slate-500 dark:text-slate-400">Team Member Limit</p>
          <p className="mt-3 font-display text-3xl font-bold">
            {dashboard.metrics.teamMembers || 0} active
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200/80 bg-white/70 p-5 dark:border-slate-800 dark:bg-slate-900/70">
          <p className="text-sm text-slate-500 dark:text-slate-400">Renewal Date</p>
          <p className="mt-3 font-display text-3xl font-bold">
            {dashboard.upcomingDeadlines?.[0]?.deadline
              ? new Date(dashboard.upcomingDeadlines[0].deadline).toLocaleDateString()
              : "TBD"}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {billingSummary.length > 0 ? (
          billingSummary.map((workspace) => (
            <div
              key={workspace.id}
              className="rounded-3xl border border-slate-200/80 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/70"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{workspace.workspace}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {workspace.members} members • {workspace.plan}
                  </p>
                </div>
                <div className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-600 dark:text-brand-300">
                  Delivery ready
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-slate-200/80 bg-white/70 p-5 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
            Billing information will appear once projects are active.
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" className="gradient-button">Upgrade Plan</button>
        <button
          type="button"
          onClick={exportWorkspaceJson}
          className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white dark:bg-slate-800"
        >
          Download Invoice
        </button>
        <button
          type="button"
          onClick={() => pushFeedback("error", "Cancel plan flow is not wired to a billing provider yet.")}
          className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-600 dark:text-rose-300"
        >
          Cancel Plan
        </button>
      </div>
    </SectionCard>
  );

  const renderIntegrationsSection = () => (
    <SectionCard
      icon={Zap}
      title="Integrations"
      description="Connect the owner workspace to external tools that support planning, communication, and delivery."
    >
      <div className="grid gap-4 xl:grid-cols-2">
        <ToggleField
          label="Slack"
          hint="Route delivery notices into Slack channels."
          checked={workspaceSettings.integrations.slack}
          onChange={(event) => updateNestedSetting("integrations", "slack", event.target.checked)}
        />
        <ToggleField
          label="Google Calendar"
          hint="Sync deadlines and milestone dates into Google Calendar."
          checked={workspaceSettings.integrations.googleCalendar}
          onChange={(event) => updateNestedSetting("integrations", "googleCalendar", event.target.checked)}
        />
        <ToggleField
          label="Zoom"
          hint="Attach meeting workflows for review calls and handoffs."
          checked={workspaceSettings.integrations.zoom}
          onChange={(event) => updateNestedSetting("integrations", "zoom", event.target.checked)}
        />
        <ToggleField
          label="GitHub"
          hint="Link technical execution with project delivery visibility."
          checked={workspaceSettings.integrations.github}
          onChange={(event) => updateNestedSetting("integrations", "github", event.target.checked)}
        />
        <ToggleField
          label="Google Drive"
          hint="Mirror shared files and design references into Drive."
          checked={workspaceSettings.integrations.googleDrive}
          onChange={(event) => updateNestedSetting("integrations", "googleDrive", event.target.checked)}
        />
        <ToggleField
          label="Discord"
          hint="Support community and client collaboration where Discord is used."
          checked={workspaceSettings.integrations.discord}
          onChange={(event) => updateNestedSetting("integrations", "discord", event.target.checked)}
        />
      </div>

      <div className="mt-5 rounded-3xl border border-brand-200/80 bg-brand-50/80 p-5 dark:border-brand-500/20 dark:bg-brand-500/10">
        <div className="flex items-start gap-3">
          <CalendarClock className="mt-1 text-brand-500" size={18} />
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">Example Automation</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              When a task deadline is added, sync it to Google Calendar and send a planning notice to the team channel.
            </p>
          </div>
        </div>
      </div>
    </SectionCard>
  );

  const renderBrandingSection = () => (
    <SectionCard
      icon={Paintbrush2}
      title="Branding Settings"
      description="Adjust how the owner workspace feels for your agency, company, or delivery brand."
    >
      <div className="grid gap-4 xl:grid-cols-2">
        <FieldShell label="Company Logo">
          <input
            type="file"
            accept="image/*"
            className="block w-full text-sm"
            onChange={(event) =>
              updateNestedSetting(
                "branding",
                "companyLogoName",
                event.target.files?.[0]?.name || workspaceSettings.branding.companyLogoName
              )
            }
          />
          {workspaceSettings.branding.companyLogoName ? (
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              {workspaceSettings.branding.companyLogoName}
            </p>
          ) : null}
        </FieldShell>

        <FieldShell label="Custom Domain" hint="Premium style branded delivery URL.">
          <input
            className="input-field"
            value={workspaceSettings.branding.customDomain}
            onChange={(event) => updateNestedSetting("branding", "customDomain", event.target.value)}
            placeholder="projects.yourcompany.com"
          />
        </FieldShell>

        <FieldShell label="Brand Color">
          <input
            type="color"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
            value={workspaceSettings.branding.brandColor}
            onChange={(event) => updateNestedSetting("branding", "brandColor", event.target.value)}
          />
        </FieldShell>

        <FieldShell label="Theme Color">
          <input
            type="color"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
            value={workspaceSettings.branding.themeColor}
            onChange={(event) => updateNestedSetting("branding", "themeColor", event.target.value)}
          />
        </FieldShell>
      </div>
    </SectionCard>
  );

  const renderBackupSection = () => (
    <SectionCard
      icon={DatabaseBackup}
      title="Data & Backup"
      description="Export project data, download reports, create backups, and restore your owner settings workspace."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <button type="button" onClick={exportWorkspaceJson} className="rounded-3xl border border-slate-200/80 bg-white/70 p-5 text-left transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/70">
          <Globe className="text-brand-500" />
          <p className="mt-4 font-semibold text-slate-900 dark:text-white">Export Project Data</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Download JSON workspace data.</p>
        </button>
        <button type="button" onClick={exportTasksReport} className="rounded-3xl border border-slate-200/80 bg-white/70 p-5 text-left transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/70">
          <Languages className="text-emerald-500" />
          <p className="mt-4 font-semibold text-slate-900 dark:text-white">Download Tasks Report</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Export CSV delivery task status.</p>
        </button>
        <button type="button" onClick={backupWorkspace} className="rounded-3xl border border-slate-200/80 bg-white/70 p-5 text-left transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/70">
          <DatabaseBackup className="text-violet-500" />
          <p className="mt-4 font-semibold text-slate-900 dark:text-white">Backup Workspace</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Download owner settings backup.</p>
        </button>
        <button
          type="button"
          onClick={() => restoreInputRef.current?.click()}
          className="rounded-3xl border border-slate-200/80 bg-white/70 p-5 text-left transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/70"
        >
          <Upload className="text-amber-500" />
          <p className="mt-4 font-semibold text-slate-900 dark:text-white">Restore Backup</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Load a previously downloaded backup.</p>
        </button>
        <input ref={restoreInputRef} type="file" accept="application/json" className="hidden" onChange={restoreBackup} />
      </div>
    </SectionCard>
  );

  const renderDangerSection = () => (
    <SectionCard
      icon={Trash2}
      title="Danger Zone"
      description="High-risk project actions are isolated here and require clear confirmation."
    >
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <FieldShell label="Project to manage">
            <select
              className="input-field"
              value={selectedProjectId}
              onChange={(event) => setSelectedProjectId(event.target.value)}
            >
              {projectOptions.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </FieldShell>

          <div className="rounded-3xl border border-amber-300/70 bg-amber-50/90 p-5 dark:border-amber-500/20 dark:bg-amber-500/10">
            <p className="font-semibold text-amber-700 dark:text-amber-200">Archive Project</p>
            <p className="mt-2 text-sm text-amber-700/80 dark:text-amber-100/80">
              Move a project out of the active delivery flow without deleting it permanently.
            </p>
            <button
              type="button"
              onClick={handleArchiveProject}
              className="mt-4 rounded-2xl bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-700 dark:text-amber-200"
            >
              Archive Project
            </button>
          </div>

          <div className="rounded-3xl border border-brand-200/80 bg-brand-50/80 p-5 dark:border-brand-500/20 dark:bg-brand-500/10">
            <p className="font-semibold text-slate-900 dark:text-white">Transfer Ownership</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Stage a future transfer by entering the next owner email. Backend handoff route is still pending.
            </p>
            <input
              type="email"
              className="input-field mt-4"
              value={transferEmail}
              onChange={(event) => setTransferEmail(event.target.value)}
              placeholder="next-owner@company.com"
            />
            <button
              type="button"
              onClick={handleTransferOwnership}
              className="mt-4 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white dark:bg-brand-500"
            >
              Transfer Ownership
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-rose-300/70 bg-rose-50/90 p-6 dark:border-rose-500/20 dark:bg-rose-500/10">
          <p className="font-display text-2xl font-bold text-rose-700 dark:text-rose-200">
            Delete Project Permanently
          </p>
          <p className="mt-2 text-sm text-rose-700/80 dark:text-rose-100/80">
            This permanently removes the selected project and all of its tasks. Type <span className="font-semibold">DELETE</span> to continue.
          </p>
          <input
            className="input-field mt-5 border-rose-200 bg-white/90 dark:border-rose-500/20 dark:bg-slate-950/70"
            value={deleteConfirm}
            onChange={(event) => setDeleteConfirm(event.target.value)}
            placeholder="Type DELETE to continue"
          />
          <button
            type="button"
            onClick={handleDeleteProject}
            disabled={savingKey === "delete-project"}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
          >
            <Trash2 size={16} />
            {savingKey === "delete-project" ? "Deleting..." : "Delete Project Permanently"}
          </button>
        </div>
      </div>
    </SectionCard>
  );

  const renderSection = () => {
    switch (activeSection) {
      case "project":
        return renderProjectSettings();
      case "team":
        return renderTeamSection();
      case "notifications":
        return renderNotificationsSection();
      case "security":
        return renderSecuritySection();
      case "billing":
        return renderBillingSection();
      case "integrations":
        return renderIntegrationsSection();
      case "branding":
        return renderBrandingSection();
      case "backup":
        return renderBackupSection();
      case "danger":
        return renderDangerSection();
      default:
        return renderGeneralSection();
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-[2rem] p-6">
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-500">Owner Settings</p>
            <h2 className="mt-3 font-display text-4xl font-bold">Control your workspace without touching code</h2>
            <p className="mt-3 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
              Configure project defaults, invite and manage people, tune alerts, connect integrations, brand the workspace, and protect your delivery operations from one place.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-950 p-5 text-white dark:bg-slate-800">
              <p className="text-sm text-white/70">Current Workspace</p>
              <p className="mt-3 font-display text-2xl font-bold">
                {workspaceSettings.workspaceName || selectedProject?.title || "TaskFlow Workspace"}
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 dark:border-slate-800 dark:bg-slate-900/80">
              <p className="text-sm text-slate-500 dark:text-slate-400">Last Updated</p>
              <p className="mt-3 font-display text-2xl font-bold">
                {workspaceSettings.lastUpdatedAt
                  ? new Date(workspaceSettings.lastUpdatedAt).toLocaleString()
                  : "Not saved yet"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Workspace: <span className="font-semibold text-slate-900 dark:text-white">{workspaceSettings.workspaceName || selectedProject?.title || "TaskFlow Workspace"}</span>
          </div>
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={savingKey === "save-all"}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-500 to-cyan-500 px-5 py-3 font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60"
          >
            <Save size={18} />
            {savingKey === "save-all" ? "Saving..." : saveState === "saved" ? "Saved" : "Save Changes"}
          </button>
        </div>
      </div>

      {feedback.message ? (
        <div
          className={`rounded-2xl px-4 py-3 text-sm font-medium ${
            feedback.type === "error"
              ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200"
              : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[240px_1fr_280px]">
        <aside className="glass-panel h-fit rounded-[2rem] p-4">
          <div className="mb-4 xl:hidden">
            <select
              className="input-field"
              value={activeSection}
              onChange={(event) => setActiveSection(event.target.value)}
            >
              {settingsSections.map((section) => (
                <option key={section.key} value={section.key}>
                  {section.label}
                </option>
              ))}
            </select>
          </div>

          <nav className="hidden space-y-2 xl:block">
            {settingsSections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.key;

              return (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => setActiveSection(section.key)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                    isActive
                      ? "bg-slate-950 text-white shadow-lg dark:bg-brand-500"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon size={16} />
                  {section.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0">{renderSection()}</div>

        <aside className="glass-panel h-fit rounded-[2rem] p-5">
          <h3 className="font-display text-2xl font-bold">Best Practices</h3>
          <div className="mt-5 space-y-4 text-sm">
            <div className="rounded-3xl bg-slate-100 p-4 dark:bg-slate-800/70">
              <p className="font-semibold text-slate-900 dark:text-white">Add managers for large teams</p>
              <p className="mt-1 text-slate-500 dark:text-slate-400">Promote delivery leads before project load grows too large.</p>
            </div>
            <div className="rounded-3xl bg-slate-100 p-4 dark:bg-slate-800/70">
              <p className="font-semibold text-slate-900 dark:text-white">Enable 2FA</p>
              <p className="mt-1 text-slate-500 dark:text-slate-400">Protect owner-level access before client work scales.</p>
            </div>
            <div className="rounded-3xl bg-slate-100 p-4 dark:bg-slate-800/70">
              <p className="font-semibold text-slate-900 dark:text-white">Weekly backups recommended</p>
              <p className="mt-1 text-slate-500 dark:text-slate-400">Export reports and backup settings before major delivery phases.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default OwnerSettingsPanel;
