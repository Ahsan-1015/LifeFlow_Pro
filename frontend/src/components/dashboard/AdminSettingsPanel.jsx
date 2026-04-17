import { motion } from "framer-motion";
import {
  BellRing,
  Building2,
  FolderKanban,
  LockKeyhole,
  Save,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import TaskTable from "./TaskTable";

const STORAGE_KEY = "taskflowpro_superadmin_settings";

const defaultSettings = {
  autoApproveOwners: false,
  allowGuestAccess: true,
  requireReviewStage: true,
  dailyDigest: true,
  instantIncidentAlerts: true,
  weeklyExecutiveReport: true,
  defaultDeadlineWindow: 14,
  overdueEscalationDays: 2,
  reviewWindowHours: 24,
  projectHealthTarget: 75,
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

const NumberField = ({ label, hint, suffix, value, min = 0, onChange }) => (
  <label className="rounded-3xl border border-slate-200/80 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/70">
    <p className="font-semibold text-slate-900 dark:text-white">{label}</p>
    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{hint}</p>
    <div className="mt-4 flex items-center gap-3">
      <input
        type="number"
        min={min}
        value={value}
        onChange={onChange}
        className="input-field max-w-[140px]"
      />
      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{suffix}</span>
    </div>
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

const AdminSettingsPanel = ({ dashboard }) => {
  const [settings, setSettings] = useState(defaultSettings);
  const [saveState, setSaveState] = useState("idle");

  useEffect(() => {
    const storedSettings = localStorage.getItem(STORAGE_KEY);
    if (!storedSettings) return;

    try {
      setSettings((current) => ({
        ...current,
        ...JSON.parse(storedSettings),
      }));
    } catch (error) {
      console.error("Failed to parse saved admin settings", error);
    }
  }, []);

  const flaggedProjects = useMemo(
    () =>
      (dashboard.tables?.recentProjects || []).filter(
        (project) => project.health !== "Healthy"
      ),
    [dashboard.tables]
  );

  const alertRows = useMemo(
    () => (dashboard.tables?.platformAlerts || []).slice(0, 6),
    [dashboard.tables]
  );

  const healthTargetGap = useMemo(() => {
    const atRiskCount = flaggedProjects.length;
    const totalProjects = dashboard.metrics.totalProjects || 0;
    if (totalProjects === 0) return "No active projects yet";

    const healthyProjects = totalProjects - atRiskCount;
    const currentRate = Math.round((healthyProjects / totalProjects) * 100);
    return currentRate >= settings.projectHealthTarget
      ? `Current healthy-project rate is ${currentRate}%, above target.`
      : `Current healthy-project rate is ${currentRate}%, below the ${settings.projectHealthTarget}% target.`;
  }, [dashboard.metrics.totalProjects, flaggedProjects.length, settings.projectHealthTarget]);

  const updateSetting = (key, value) =>
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaveState("saved");

    window.clearTimeout(window.__taskflowAdminSettingsTimer);
    window.__taskflowAdminSettingsTimer = window.setTimeout(() => {
      setSaveState("idle");
    }, 2200);
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel overflow-hidden rounded-[2rem] p-6">
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-500">
              Platform Settings
            </p>
            <h3 className="mt-3 font-display text-4xl font-bold">
              Configure how projects, teams, and platform controls behave.
            </h3>
            <p className="mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
              This control center is built around your current project activity. Tune access,
              delivery rules, and alerting without leaving the admin dashboard.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-950 p-5 text-white dark:bg-slate-800">
              <p className="text-sm text-white/70">Active Workspaces</p>
              <p className="mt-3 font-display text-4xl font-bold">
                {dashboard.metrics.totalProjects || 0}
              </p>
              <p className="mt-2 text-sm text-white/70">Projects currently under platform governance</p>
            </div>
            <div className="rounded-3xl bg-white/80 p-5 dark:bg-slate-900/80">
              <p className="text-sm text-slate-500 dark:text-slate-400">Governance Health</p>
              <p className="mt-3 font-display text-2xl font-bold">{healthTargetGap}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard
          icon={LockKeyhole}
          title="Access Governance"
          description="Control who can enter the platform, who gets promoted, and how tightly execution is reviewed."
        >
          <div className="grid gap-4">
            <ToggleField
              label="Auto-approve new project owners"
              hint="Turn this on if verified organizations can create owners without manual review."
              checked={settings.autoApproveOwners}
              onChange={(event) => updateSetting("autoApproveOwners", event.target.checked)}
            />
            <ToggleField
              label="Allow guest and client logins"
              hint="Useful when clients should review delivery progress directly inside the workspace."
              checked={settings.allowGuestAccess}
              onChange={(event) => updateSetting("allowGuestAccess", event.target.checked)}
            />
            <ToggleField
              label="Require manager review stage before completion"
              hint="Ensures work lands in Review before Done across all active project boards."
              checked={settings.requireReviewStage}
              onChange={(event) => updateSetting("requireReviewStage", event.target.checked)}
            />
          </div>
        </SectionCard>

        <SectionCard
          icon={BellRing}
          title="Notifications & Monitoring"
          description="Keep platform leaders informed with the right mix of real-time alerts and executive summaries."
        >
          <div className="grid gap-4">
            <ToggleField
              label="Send daily digest to platform admins"
              hint="Delivers user growth, project load, and overdue task summaries every morning."
              checked={settings.dailyDigest}
              onChange={(event) => updateSetting("dailyDigest", event.target.checked)}
            />
            <ToggleField
              label="Instant incident alerts"
              hint="Fire notifications immediately when platform alerts or overdue high-priority tasks appear."
              checked={settings.instantIncidentAlerts}
              onChange={(event) => updateSetting("instantIncidentAlerts", event.target.checked)}
            />
            <ToggleField
              label="Weekly executive growth report"
              hint="A clean weekly summary for investor-style reporting and organization health reviews."
              checked={settings.weeklyExecutiveReport}
              onChange={(event) => updateSetting("weeklyExecutiveReport", event.target.checked)}
            />
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard
          icon={FolderKanban}
          title="Project Governance Defaults"
          description="These settings influence how new projects are planned and when admin intervention should happen."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <NumberField
              label="Default delivery window"
              hint="Baseline target for new project deadlines."
              suffix="days"
              min={1}
              value={settings.defaultDeadlineWindow}
              onChange={(event) =>
                updateSetting("defaultDeadlineWindow", Number(event.target.value || 0))
              }
            />
            <NumberField
              label="Overdue escalation"
              hint="Escalate platform issues after this many late days."
              suffix="days"
              min={0}
              value={settings.overdueEscalationDays}
              onChange={(event) =>
                updateSetting("overdueEscalationDays", Number(event.target.value || 0))
              }
            />
            <NumberField
              label="Review response window"
              hint="Expected manager response time for submitted work."
              suffix="hours"
              min={1}
              value={settings.reviewWindowHours}
              onChange={(event) =>
                updateSetting("reviewWindowHours", Number(event.target.value || 0))
              }
            />
            <NumberField
              label="Healthy project target"
              hint="Desired percentage of projects that should remain healthy."
              suffix="%"
              min={0}
              value={settings.projectHealthTarget}
              onChange={(event) =>
                updateSetting("projectHealthTarget", Number(event.target.value || 0))
              }
            />
          </div>
        </SectionCard>

        <SectionCard
          icon={ShieldCheck}
          title="Policy Snapshot"
          description="A quick admin read on whether current platform activity fits the rules you’re setting."
        >
          <div className="grid gap-4">
            <div className="rounded-3xl border border-slate-200/80 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/70">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Live Platform Summary
              </p>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>Total users</span>
                  <span className="font-semibold">{dashboard.metrics.totalUsers || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Active users</span>
                  <span className="font-semibold">{dashboard.metrics.activeUsers || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tasks created today</span>
                  <span className="font-semibold">{dashboard.metrics.tasksCreatedToday || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Monthly growth</span>
                  <span className="font-semibold">{dashboard.metrics.monthlyGrowth || "0%"}</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-brand-200/80 bg-brand-50/80 p-4 dark:border-brand-500/20 dark:bg-brand-500/10">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 text-brand-500" size={18} />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Recommended focus</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {flaggedProjects.length > 0
                      ? `${flaggedProjects.length} project${flaggedProjects.length > 1 ? "s" : ""} need governance attention. Consider tightening review windows or escalation rules.`
                      : "Project health looks steady. This is a good time to tighten standards gradually without disrupting delivery."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <TaskTable
          title="Projects Needing Policy Review"
          columns={[
            { key: "project", label: "Project" },
            { key: "owner", label: "Owner" },
            { key: "deadline", label: "Deadline" },
            { key: "health", label: "Health" },
          ]}
          rows={flaggedProjects}
          emptyText="No projects are currently breaching your governance health expectations."
        />

        <TaskTable
          title="Alert Automation Watchlist"
          columns={[
            { key: "issue", label: "Issue" },
            { key: "severity", label: "Severity" },
            { key: "owner", label: "Owner" },
          ]}
          rows={alertRows}
          emptyText="No platform alerts are active right now."
          delay={0.05}
        />
      </div>

      <div className="glass-panel flex flex-col gap-4 rounded-[2rem] p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-500 text-white shadow-lg shadow-brand-500/20">
            <Building2 size={20} />
          </div>
          <div>
            <h3 className="font-display text-2xl font-bold">Save platform settings</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Settings are currently stored locally for the admin experience layer. We can wire these
              to a backend settings API next.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-500 to-cyan-500 px-5 py-3 font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:-translate-y-0.5 hover:shadow-xl"
        >
          <Save size={18} />
          {saveState === "saved" ? "Saved" : "Save Settings"}
        </button>
      </div>
    </div>
  );
};

export default AdminSettingsPanel;
