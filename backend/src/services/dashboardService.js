import Activity from "../models/Activity.js";
import Comment from "../models/Comment.js";
import Notification from "../models/Notification.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import { normalizeRole } from "../utils/roles.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const ROLE_COLORS = {
  super_admin: "#3b82f6",
  owner: "#8b5cf6",
  manager: "#14b8a6",
  member: "#f59e0b",
  guest: "#f43f5e",
};
const PRIORITY_WEIGHT = { high: 0, medium: 1, low: 2 };

const startOfDay = (value = new Date()) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const endOfDay = (value = new Date()) => {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
};

const addDays = (value, days) => new Date(new Date(value).getTime() + days * DAY_MS);

const toKey = (value) => startOfDay(value).toISOString();

const percent = (value, total) => (total > 0 ? Math.round((value / total) * 100) : 0);

const formatPercentChange = (current, previous) => {
  if (previous === 0) {
    return current > 0 ? "+100%" : "0%";
  }

  const delta = Math.round(((current - previous) / previous) * 100);
  return `${delta >= 0 ? "+" : ""}${delta}%`;
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

const sortByPriorityAndDeadline = (tasks = []) =>
  [...tasks].sort((left, right) => {
    const priorityGap = (PRIORITY_WEIGHT[left.priority] ?? 99) - (PRIORITY_WEIGHT[right.priority] ?? 99);
    if (priorityGap !== 0) return priorityGap;

    const leftDeadline = left.deadline ? new Date(left.deadline).getTime() : Number.MAX_SAFE_INTEGER;
    const rightDeadline = right.deadline ? new Date(right.deadline).getTime() : Number.MAX_SAFE_INTEGER;
    return leftDeadline - rightDeadline;
  });

const getDailySeries = (definitions, { days = 7 } = {}) => {
  const today = startOfDay();
  const buckets = Array.from({ length: days }).map((_, index) => {
    const date = addDays(today, index - (days - 1));
    return {
      key: toKey(date),
      name: date.toLocaleDateString("en-US", { weekday: "short" }),
      date,
    };
  });

  return buckets.map((bucket) => {
    const row = { name: bucket.name };

    definitions.forEach(({ key, items, getDate }) => {
      row[key] = items.filter((item) => {
        const itemDate = getDate(item);
        return itemDate ? toKey(itemDate) === bucket.key : false;
      }).length;
    });

    return row;
  });
};

const getProjectStatsMap = (projects = [], tasks = []) => {
  const taskMap = new Map();

  projects.forEach((project) => {
    taskMap.set(String(project._id), {
      total: 0,
      done: 0,
      pending: 0,
      review: 0,
      overdue: 0,
      highPriority: 0,
    });
  });

  const now = new Date();

  tasks.forEach((task) => {
    const bucket = taskMap.get(String(task.projectId));
    if (!bucket) return;

    bucket.total += 1;
    if (task.status === "done") bucket.done += 1;
    if (task.status !== "done") bucket.pending += 1;
    if (task.status === "review") bucket.review += 1;
    if (task.priority === "high") bucket.highPriority += 1;
    if (task.deadline && new Date(task.deadline) < now && task.status !== "done") {
      bucket.overdue += 1;
    }
  });

  return taskMap;
};

const getTaskStatusBreakdown = (tasks = []) =>
  ["todo", "inprogress", "review", "done"].map((status) => ({
    name:
      status === "inprogress"
        ? "In Progress"
        : status.charAt(0).toUpperCase() + status.slice(1),
    value: tasks.filter((task) => task.status === status).length,
  }));

const toActivityItems = (activities = []) =>
  activities.map((activity) => ({
    id: activity._id,
    title: activity.text,
    subtitle: `${activity.userId?.name || "TaskFlow Pro"} • ${new Date(activity.createdAt).toLocaleString()}`,
  }));

const toDeadlineItems = (tasks = []) =>
  tasks.map((task) => ({
    id: task._id,
    title: task.title,
    subtitle: `Due ${task.deadline ? new Date(task.deadline).toLocaleDateString() : "TBD"} • ${
      task.assignedTo?.name || "Unassigned"
    }`,
  }));

const buildScopeQuery = (role, userId) => {
  if (role === "super_admin") return {};
  if (role === "owner") return { owner: userId };
  if (role === "manager") {
    return {
      $or: [{ owner: userId }, { members: { $elemMatch: { user: userId, role: { $in: ["admin", "manager"] } } } }],
    };
  }

  return { $or: [{ owner: userId }, { "members.user": userId }] };
};

const getScopedProjects = (role, userId) =>
  Project.find(buildScopeQuery(role, userId))
    .populate("owner", "name email avatar role")
    .populate("members.user", "name email avatar role")
    .sort({ updatedAt: -1 })
    .lean();

const activeUserFilter = { isDeleted: { $ne: true } };

const buildSuperAdminDashboard = async ({ userId, unreadNotifications }) => {
  const today = startOfDay();
  const monthStart = addDays(today, -29);
  const previousMonthStart = addDays(monthStart, -30);
  const previousMonthEnd = addDays(monthStart, -1);

  const [users, projects, tasks, activities] = await Promise.all([
    User.find(activeUserFilter).sort({ createdAt: -1 }).lean(),
    Project.find()
      .populate("owner", "name email avatar role")
      .populate("members.user", "name email avatar role")
      .sort({ updatedAt: -1 })
      .lean(),
    Task.find().populate("assignedTo", "name email avatar").sort({ createdAt: -1 }).lean(),
    Activity.find()
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 })
      .limit(12)
      .lean(),
  ]);

  const currentMonthUsers = users.filter((user) => new Date(user.createdAt) >= monthStart).length;
  const previousMonthUsers = users.filter((user) => {
    const createdAt = new Date(user.createdAt);
    return createdAt >= previousMonthStart && createdAt <= endOfDay(previousMonthEnd);
  }).length;
  const activeUsers = users.filter((user) => new Date(user.updatedAt) >= addDays(today, -7)).length;
  const tasksCreatedToday = tasks.filter((task) => new Date(task.createdAt) >= today).length;
  const projectStats = getProjectStatsMap(projects, tasks);
  const overdueTasks = sortByPriorityAndDeadline(
    tasks.filter((task) => task.deadline && new Date(task.deadline) < new Date() && task.status !== "done")
  );
  const pendingOwnerApprovals = users.filter((user) => user.ownerAccessStatus === "pending").length;
  const taskStatusBreakdown = getTaskStatusBreakdown(tasks);
  const userProjectMemberships = new Map();

  projects.forEach((project) => {
    const ownerKey = String(project.owner?._id || "");
    if (ownerKey) {
      userProjectMemberships.set(ownerKey, (userProjectMemberships.get(ownerKey) || 0) + 1);
    }

    project.members.forEach((member) => {
      const memberKey = String(member.user?._id || "");
      if (memberKey) {
        userProjectMemberships.set(memberKey, (userProjectMemberships.get(memberKey) || 0) + 1);
      }
    });
  });

  const allUsers = users.map((user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar || "",
    roleKey: normalizeRole(user.role),
    role: normalizeRole(user.role).replace("_", " "),
    projects: userProjectMemberships.get(String(user._id)) || 0,
    status: user.isBlocked ? "Blocked" : new Date(user.updatedAt) >= addDays(today, -7) ? "Active" : "Dormant",
    isBlocked: Boolean(user.isBlocked),
    ownerAccessStatus:
      user.ownerAccessStatus || (normalizeRole(user.role) === "owner" ? "approved" : "none"),
    joined: new Date(user.createdAt).toLocaleDateString(),
  }));

  const allProjects = projects.map((project) => {
    const stats = projectStats.get(String(project._id)) || {};
    const progress = percent(stats.done || 0, stats.total || 0);

    return {
      id: project._id,
      project: project.title,
      owner: project.owner?.name || "Unassigned",
      members: project.members.length,
      tasks: stats.total || 0,
      progress: `${progress}%`,
      deadline: project.deadline ? new Date(project.deadline).toLocaleDateString() : "Flexible",
      health: stats.overdue > 0 ? "At risk" : progress >= 75 ? "Healthy" : "Monitoring",
    };
  });

  const supportQueue = overdueTasks.slice(0, 12).map((task) => ({
    id: task._id,
    issue: `${task.title} overdue`,
    severity: task.priority,
    owner: task.assignedTo?.name || "Unassigned",
    project: projects.find((project) => String(project._id) === String(task.projectId))?.title || "Unknown project",
  }));

  const projectHealthMix = [
    {
      name: "Healthy",
      value: allProjects.filter((project) => project.health === "Healthy").length,
      color: "#10b981",
    },
    {
      name: "Monitoring",
      value: allProjects.filter((project) => project.health === "Monitoring").length,
      color: "#f59e0b",
    },
    {
      name: "At Risk",
      value: allProjects.filter((project) => project.health === "At risk").length,
      color: "#ef4444",
    },
  ].filter((entry) => entry.value > 0);

  const workspaceValue = allProjects.reduce((sum, project) => {
    if (project.members >= 8) return sum + 299;
    if (project.members >= 4) return sum + 149;
    return sum + 49;
  }, 0);

  const planMix = [
    {
      name: "Starter",
      value: allProjects.filter((project) => project.members < 4).length,
      color: "#38bdf8",
    },
    {
      name: "Growth",
      value: allProjects.filter((project) => project.members >= 4 && project.members < 8).length,
      color: "#8b5cf6",
    },
    {
      name: "Scale",
      value: allProjects.filter((project) => project.members >= 8).length,
      color: "#10b981",
    },
  ].filter((entry) => entry.value > 0);

  return {
    role: "super_admin",
    metrics: {
      totalUsers: users.length,
      activeUsers,
      totalProjects: projects.length,
      totalTasks: tasks.length,
      pendingTasks: tasks.filter((task) => task.status !== "done").length,
      completedTasks: tasks.filter((task) => task.status === "done").length,
      tasksCreatedToday,
      monthlyGrowth: formatPercentChange(currentMonthUsers, previousMonthUsers),
      serverStatus: "Operational",
      estimatedMonthlyValue: formatCurrency(workspaceValue),
      avgWorkspaceValue: formatCurrency(allProjects.length > 0 ? Math.round(workspaceValue / allProjects.length) : 0),
      atRiskProjects: allProjects.filter((project) => project.health === "At risk").length,
      pendingOwnerApprovals,
      unreadNotifications,
    },
    recentActivity: activities,
    upcomingDeadlines: overdueTasks.slice(0, 8),
    projects: projects.slice(0, 8),
    charts: {
      userGrowth: getDailySeries([{ key: "users", items: users, getDate: (item) => item.createdAt }]),
      projectActivity: getDailySeries([
        { key: "projects", items: projects, getDate: (item) => item.createdAt },
        { key: "tasks", items: tasks, getDate: (item) => item.createdAt },
      ]),
      roleDistribution: Object.entries(
        users.reduce((accumulator, user) => {
          const role = normalizeRole(user.role);
          accumulator[role] = (accumulator[role] || 0) + 1;
          return accumulator;
        }, {})
      ).map(([name, value]) => ({
        name: name.replace("_", " "),
        value,
        color: ROLE_COLORS[name] || "#94a3b8",
      })),
      taskStatusBreakdown,
      projectHealthMix: projectHealthMix.length > 0 ? projectHealthMix : [{ name: "No data", value: 1, color: "#cbd5e1" }],
      planMix: planMix.length > 0 ? planMix : [{ name: "No workspaces", value: 1, color: "#cbd5e1" }],
    },
    tables: {
      latestUsers: users.slice(0, 6).map((user) => ({
        id: user._id,
        name: user.name,
        role: normalizeRole(user.role).replace("_", " "),
        status: new Date(user.updatedAt) >= addDays(today, -7) ? "Active" : "Dormant",
      })),
      recentProjects: projects.slice(0, 6).map((project) => {
        const stats = projectStats.get(String(project._id)) || {};
        const progress = percent(stats.done || 0, stats.total || 0);

        return {
          id: project._id,
          project: project.title,
          owner: project.owner?.name || "Unassigned",
          deadline: project.deadline ? new Date(project.deadline).toLocaleDateString() : "Flexible",
          health: stats.overdue > 0 ? "At risk" : progress >= 75 ? "Healthy" : "Monitoring",
        };
      }),
      platformAlerts: overdueTasks.slice(0, 6).map((task) => ({
        id: task._id,
        issue: `${task.title} is overdue`,
        severity: task.priority,
        owner: task.assignedTo?.name || "Unassigned",
      })),
      allUsers,
      allProjects,
      supportQueue,
    },
    feeds: {
      activity: toActivityItems(activities),
      alerts: overdueTasks.slice(0, 5).map((task) => ({
        id: task._id,
        title: task.title,
        subtitle: `${task.priority} priority • ${task.assignedTo?.name || "Unassigned"}`,
      })),
      adminReports: [
        {
          id: "weekly-growth",
          title: `User growth is ${formatPercentChange(currentMonthUsers, previousMonthUsers)}`,
          subtitle: `${currentMonthUsers} users joined in the last 30 days`,
        },
        {
          id: "workspace-value",
          title: `Estimated monthly workspace value is ${formatCurrency(workspaceValue)}`,
          subtitle: `${allProjects.length} active project workspaces are contributing to plan capacity`,
        },
        {
          id: "risk-report",
          title: `${allProjects.filter((project) => project.health === "At risk").length} projects are currently at risk`,
          subtitle: "Use support and reports sections to intervene before deadlines slip further",
        },
        {
          id: "owner-approvals",
          title: `${pendingOwnerApprovals} owner approvals are waiting`,
          subtitle: pendingOwnerApprovals > 0 ? "Review pending owner access requests from the user directory" : "No owner approvals are waiting right now",
        },
      ],
    },
  };
};

const buildOwnerDashboard = async ({ userId, unreadNotifications }) => {
  const projects = await getScopedProjects("owner", userId);
  const projectIds = projects.map((project) => project._id);

  if (projectIds.length === 0) {
    return {
      role: "owner",
      metrics: {
        totalProjects: 0,
        totalTasks: 0,
        pendingTasks: 0,
        completedTasks: 0,
        teamMembers: 0,
        upcomingDeadlinesCount: 0,
        activeManagers: 0,
        ownerWorkspaceValue: formatCurrency(0),
        unreadNotifications,
      },
      recentActivity: [],
      upcomingDeadlines: [],
      projects: [],
      charts: { weeklyCompleted: [], statusMix: [] },
      tables: { projectHealth: [], teamDirectory: [], taskOperations: [], billingSummary: [] },
      feeds: { activity: [], deadlines: [], teamHighlights: [] },
    };
  }

  const [tasks, activities] = await Promise.all([
    Task.find({ projectId: { $in: projectIds } }).populate("assignedTo", "name email avatar").lean(),
    Activity.find({ projectId: { $in: projectIds } })
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
  ]);

  const projectStats = getProjectStatsMap(projects, tasks);
  const uniqueMembers = new Map();
  const managerIds = new Set();
  projects.forEach((project) => {
    project.members.forEach((member) => {
      if (member.user?._id) {
        uniqueMembers.set(String(member.user._id), member.user);
        if (member.role === "manager" || member.role === "admin") {
          managerIds.add(String(member.user._id));
        }
      }
    });
  });

  const upcomingDeadlines = sortByPriorityAndDeadline(
    tasks.filter((task) => task.deadline && new Date(task.deadline) >= startOfDay() && task.status !== "done")
  ).slice(0, 8);
  const workspaceValue = projects.reduce((sum, project) => {
    if (project.members.length >= 8) return sum + 299;
    if (project.members.length >= 4) return sum + 149;
    return sum + 49;
  }, 0);
  const teamDirectory = projects.flatMap((project) =>
    project.members
      .filter((member) => member.user?._id)
      .map((member) => ({
        id: `${project._id}:${member.user._id}`,
        projectId: String(project._id),
        memberId: String(member.user._id),
        project: project.title,
        name: member.user.name,
        email: member.user.email,
        avatar: member.user.avatar || "",
        role: member.role,
      }))
  );
  const taskOperations = sortByPriorityAndDeadline(tasks)
    .slice(0, 14)
    .map((task) => ({
      id: task._id,
      projectId: String(task.projectId),
      task: task.title,
      project: projects.find((project) => String(project._id) === String(task.projectId))?.title || "Unknown project",
      assignee: task.assignedTo?.name || "Unassigned",
      priority: task.priority,
      status: task.status,
      deadline: task.deadline ? new Date(task.deadline).toLocaleDateString() : "Flexible",
    }));
  const billingSummary = projects.map((project) => ({
    id: project._id,
    workspace: project.title,
    members: project.members.length,
    plan: project.members.length >= 8 ? "Scale" : project.members.length >= 4 ? "Growth" : "Starter",
    value: formatCurrency(project.members.length >= 8 ? 299 : project.members.length >= 4 ? 149 : 49),
  }));

  return {
    role: "owner",
    metrics: {
      totalProjects: projects.length,
      totalTasks: tasks.length,
      pendingTasks: tasks.filter((task) => task.status !== "done").length,
      completedTasks: tasks.filter((task) => task.status === "done").length,
      teamMembers: uniqueMembers.size,
      upcomingDeadlinesCount: upcomingDeadlines.length,
      activeManagers: managerIds.size,
      ownerWorkspaceValue: formatCurrency(workspaceValue),
      unreadNotifications,
    },
    recentActivity: activities,
    upcomingDeadlines,
    projects,
    charts: {
      weeklyCompleted: getDailySeries([
        {
          key: "completed",
          items: tasks.filter((task) => task.status === "done"),
          getDate: (item) => item.updatedAt,
        },
      ]),
      statusMix: getTaskStatusBreakdown(tasks),
    },
    tables: {
      projectHealth: projects.map((project) => {
        const stats = projectStats.get(String(project._id)) || {};
        return {
          id: project._id,
          projectId: String(project._id),
          project: project.title,
          progress: `${percent(stats.done || 0, stats.total || 0)}%`,
          deadline: project.deadline ? new Date(project.deadline).toLocaleDateString() : "Flexible",
          members: project.members.length,
          tasks: stats.total || 0,
          review: stats.review || 0,
          pending: stats.pending || 0,
        };
      }),
      teamDirectory,
      taskOperations,
      billingSummary,
    },
    feeds: {
      activity: toActivityItems(activities),
      deadlines: toDeadlineItems(upcomingDeadlines),
      teamHighlights: teamDirectory.slice(0, 8).map((member) => ({
        id: member.id,
        title: `${member.name} • ${member.role}`,
        subtitle: `${member.project} • ${member.email}`,
      })),
    },
  };
};

const buildManagerDashboard = async ({ userId, unreadNotifications }) => {
  const projects = await getScopedProjects("manager", userId);
  const projectIds = projects.map((project) => project._id);

  if (projectIds.length === 0) {
    return {
      role: "manager",
      metrics: {
        totalProjects: 0,
        pendingTasks: 0,
        inReviewTasks: 0,
        overdueTasks: 0,
        memberProductivity: "0%",
        unreadNotifications,
      },
      recentActivity: [],
      upcomingDeadlines: [],
      projects: [],
      charts: { reviewFlow: [], memberLoad: [], taskStatusBreakdown: [] },
      tables: { teamPerformance: [], reviewQueue: [], teamTasks: [] },
      feeds: { priorityTasks: [], messages: [], recentComments: [] },
      boards: { todo: [], inprogress: [], review: [], done: [] },
    };
  }

  const [tasks, activities, comments, notifications] = await Promise.all([
    Task.find({ projectId: { $in: projectIds } }).populate("assignedTo", "name email avatar").lean(),
    Activity.find({ projectId: { $in: projectIds } })
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
    Comment.find()
      .populate("userId", "name avatar")
      .populate({
        path: "taskId",
        select: "title projectId",
      })
      .sort({ createdAt: -1 })
      .limit(12)
      .lean(),
    Notification.find({ userId }).sort({ createdAt: -1 }).limit(12).lean(),
  ]);

  const overdueTasks = tasks.filter((task) => task.deadline && new Date(task.deadline) < new Date() && task.status !== "done");
  const reviewQueue = tasks.filter((task) => task.status === "review");
  const performanceMap = new Map();
  const projectMap = new Map(projects.map((project) => [String(project._id), project]));

  tasks.forEach((task) => {
    const assigneeKey = task.assignedTo?._id ? String(task.assignedTo._id) : "unassigned";
    const current = performanceMap.get(assigneeKey) || {
      id: assigneeKey,
      member: task.assignedTo?.name || "Unassigned",
      done: 0,
      pending: 0,
      total: 0,
    };

    current.total += 1;
    if (task.status === "done") current.done += 1;
    else current.pending += 1;
    performanceMap.set(assigneeKey, current);
  });

  const teamPerformance = [...performanceMap.values()].map((row) => ({
    id: row.id,
    member: row.member,
    done: row.done,
    pending: row.pending,
    efficiency: `${percent(row.done, row.total)}%`,
  }));

  const averageEfficiency =
    teamPerformance.length > 0
      ? `${Math.round(teamPerformance.reduce((sum, row) => sum + Number.parseInt(row.efficiency, 10), 0) / teamPerformance.length)}%`
      : "0%";
  const relevantComments = comments.filter((comment) => {
    const projectId = comment.taskId?.projectId;
    return projectId && projectMap.has(String(projectId));
  });
  const teamTasks = sortByPriorityAndDeadline(tasks).map((task) => ({
    id: task._id,
    projectId: String(task.projectId),
    task: task.title,
    project: projectMap.get(String(task.projectId))?.title || "Unknown project",
    owner: task.assignedTo?.name || "Unassigned",
    assignedToId: task.assignedTo?._id ? String(task.assignedTo._id) : "",
    status: task.status,
    priority: task.priority,
    deadline: task.deadline ? new Date(task.deadline).toLocaleDateString() : "Flexible",
  }));
  const boardColumns = {
    todo: [],
    inprogress: [],
    review: [],
    done: [],
  };

  tasks.forEach((task) => {
    if (!boardColumns[task.status]) return;
    boardColumns[task.status].push({
      id: task._id,
      projectId: String(task.projectId),
      title: task.title,
      project: projectMap.get(String(task.projectId))?.title || "Unknown project",
      assignee: task.assignedTo?.name || "Unassigned",
      assignedToId: task.assignedTo?._id ? String(task.assignedTo._id) : "",
      priority: task.priority,
      status: task.status,
      deadline: task.deadline ? new Date(task.deadline).toLocaleDateString() : "Flexible",
    });
  });

  return {
    role: "manager",
    metrics: {
      totalProjects: projects.length,
      pendingTasks: tasks.filter((task) => task.status !== "done").length,
      inReviewTasks: reviewQueue.length,
      overdueTasks: overdueTasks.length,
      memberProductivity: averageEfficiency,
      unreadNotifications,
    },
    recentActivity: activities,
    upcomingDeadlines: sortByPriorityAndDeadline(tasks.filter((task) => task.status !== "done")).slice(0, 8),
    projects,
    charts: {
      reviewFlow: getDailySeries([
        {
          key: "submitted",
          items: reviewQueue,
          getDate: (item) => item.updatedAt,
        },
        {
          key: "approved",
          items: tasks.filter((task) => task.status === "done"),
          getDate: (item) => item.updatedAt,
        },
      ]),
      memberLoad: teamPerformance.map((row) => ({
        name: row.member,
        pending: row.pending,
        done: row.done,
      })),
      taskStatusBreakdown: getTaskStatusBreakdown(tasks),
    },
    tables: {
      teamPerformance,
      reviewQueue: reviewQueue.slice(0, 8).map((task) => ({
        id: task._id,
        projectId: String(task.projectId),
        task: task.title,
        project: projectMap.get(String(task.projectId))?.title || "Unknown project",
        owner: task.assignedTo?.name || "Unassigned",
        assignedToId: task.assignedTo?._id ? String(task.assignedTo._id) : "",
        priority: task.priority,
        status: "Review",
        deadline: task.deadline ? new Date(task.deadline).toLocaleDateString() : "Flexible",
      })),
      teamTasks: teamTasks.slice(0, 16),
    },
    feeds: {
      priorityTasks: sortByPriorityAndDeadline(tasks.filter((task) => task.status !== "done")).slice(0, 6).map((task) => ({
        id: task._id,
        title: task.title,
        subtitle: `${task.priority} priority • ${task.assignedTo?.name || "Unassigned"}`,
      })),
      activity: toActivityItems(activities),
      recentComments: relevantComments.slice(0, 8).map((comment) => ({
        id: comment._id,
        title: comment.message,
        subtitle: `${comment.userId?.name || "Teammate"} on ${comment.taskId?.title || "Task"}`,
      })),
      messages: notifications.map((notification) => ({
        id: notification._id,
        title: notification.message,
        subtitle: `${new Date(notification.createdAt).toLocaleString()} • ${
          notification.read ? "Read" : "Unread"
        }`,
      })),
    },
    boards: boardColumns,
  };
};

const buildMemberDashboard = async ({ userId, unreadNotifications }) => {
  const [projects, assignedTasks] = await Promise.all([
    getScopedProjects("member", userId),
    Task.find({ assignedTo: userId }).populate("assignedTo", "name email avatar").sort({ updatedAt: -1 }).lean(),
  ]);

  const assignedTaskIds = assignedTasks.map((task) => task._id);

  const [activities, comments] = await Promise.all([
    Activity.find({ projectId: { $in: projects.map((project) => project._id) } })
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 })
      .limit(8)
      .lean(),
    Comment.find({ taskId: { $in: assignedTaskIds } })
      .populate("userId", "name avatar")
      .populate("taskId", "title")
      .sort({ createdAt: -1 })
      .limit(8)
      .lean(),
  ]);

  const today = startOfDay();
  const dueToday = assignedTasks.filter((task) => task.deadline && toKey(task.deadline) === toKey(today) && task.status !== "done").length;
  const completedThisWeek = assignedTasks.filter((task) => task.status === "done" && new Date(task.updatedAt) >= addDays(today, -6)).length;
  const activeThisWeek = assignedTasks.filter((task) => new Date(task.updatedAt) >= addDays(today, -6)).length;
  const productivityScore = `${percent(completedThisWeek, activeThisWeek || assignedTasks.length || 1)}%`;
  const focusTasks = sortByPriorityAndDeadline(assignedTasks.filter((task) => task.status !== "done")).slice(0, 3);
  const upcomingDeadlines = sortByPriorityAndDeadline(
    assignedTasks.filter((task) => task.deadline && new Date(task.deadline) >= today && task.status !== "done")
  ).slice(0, 6);

  return {
    role: "member",
    metrics: {
      totalProjects: projects.length,
      pendingTasks: assignedTasks.filter((task) => task.status !== "done").length,
      dueToday,
      completedThisWeek,
      productivityScore,
      unreadNotifications,
    },
    recentActivity: activities,
    upcomingDeadlines,
    projects,
    charts: {
      personalProductivity: getDailySeries([
        {
          key: "score",
          items: assignedTasks.filter((task) => task.status === "done"),
          getDate: (item) => item.updatedAt,
        },
      ]).map((row, index, rows) => ({
        name: row.name,
        score: Math.min(100, row.score * 18 + (rows.slice(0, index + 1).reduce((sum, current) => sum + current.score, 0) > 0 ? 40 : 0)),
      })),
    },
    tables: {
      focusTasks: focusTasks.map((task) => ({
        id: task._id,
        task: task.title,
        status: task.status,
        due: task.deadline ? new Date(task.deadline).toLocaleDateString() : "Flexible",
      })),
    },
    feeds: {
      deadlines: toDeadlineItems(upcomingDeadlines),
      recentComments: comments.map((comment) => ({
        id: comment._id,
        title: comment.message,
        subtitle: `${comment.userId?.name || "Teammate"} on ${comment.taskId?.title || "Task"}`,
      })),
      activity: toActivityItems(activities),
    },
  };
};

const buildGuestDashboard = async ({ userId, unreadNotifications }) => {
  const projects = await getScopedProjects("guest", userId);
  const projectIds = projects.map((project) => project._id);

  if (projectIds.length === 0) {
    return {
      role: "guest",
      metrics: {
        progressPercentage: "0%",
        completedMilestones: 0,
        nextDeliveryDate: "TBD",
        unreadNotifications,
      },
      recentActivity: [],
      upcomingDeadlines: [],
      projects: [],
      charts: { milestoneTimeline: [] },
      tables: { sharedMilestones: [] },
      feeds: { feedback: [] },
    };
  }

  const tasks = await Task.find({ projectId: { $in: projectIds } }).populate("assignedTo", "name email avatar").lean();
  const taskIds = tasks.map((task) => task._id);
  const comments = await Comment.find({ taskId: { $in: taskIds } })
    .populate("userId", "name avatar")
    .populate({
      path: "taskId",
      select: "title projectId",
    })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  const projectStats = getProjectStatsMap(projects, tasks);
  const relevantComments = comments.filter((comment) => comment.taskId?.projectId && projectIds.some((id) => String(id) === String(comment.taskId.projectId)));
  const progressValues = projects.map((project) => {
    const stats = projectStats.get(String(project._id)) || {};
    return percent(stats.done || 0, stats.total || 0);
  });
  const averageProgress =
    progressValues.length > 0 ? `${Math.round(progressValues.reduce((sum, value) => sum + value, 0) / progressValues.length)}%` : "0%";
  const upcomingDeliveries = sortByPriorityAndDeadline(
    tasks.filter((task) => task.deadline && new Date(task.deadline) >= startOfDay() && task.status !== "done")
  );

  return {
    role: "guest",
    metrics: {
      progressPercentage: averageProgress,
      completedMilestones: tasks.filter((task) => task.status === "done").length,
      nextDeliveryDate: upcomingDeliveries[0]?.deadline
        ? new Date(upcomingDeliveries[0].deadline).toLocaleDateString()
        : "TBD",
      unreadNotifications,
    },
    recentActivity: [],
    upcomingDeadlines: upcomingDeliveries.slice(0, 5),
    projects,
    charts: {
      milestoneTimeline: projects
        .slice()
        .sort((left, right) => {
          const leftDate = left.deadline ? new Date(left.deadline).getTime() : Number.MAX_SAFE_INTEGER;
          const rightDate = right.deadline ? new Date(right.deadline).getTime() : Number.MAX_SAFE_INTEGER;
          return leftDate - rightDate;
        })
        .slice(0, 6)
        .map((project) => {
          const stats = projectStats.get(String(project._id)) || {};
          return {
            name: project.title.length > 12 ? `${project.title.slice(0, 12)}...` : project.title,
            progress: percent(stats.done || 0, stats.total || 0),
          };
        }),
    },
    tables: {
      sharedMilestones: projects.map((project) => {
        const stats = projectStats.get(String(project._id)) || {};
        return {
          id: project._id,
          milestone: project.title,
          progress: `${percent(stats.done || 0, stats.total || 0)}%`,
          delivery: project.deadline ? new Date(project.deadline).toLocaleDateString() : "TBD",
        };
      }),
    },
    feeds: {
      feedback: relevantComments.slice(0, 6).map((comment) => ({
        id: comment._id,
        title: comment.message,
        subtitle: `${comment.userId?.name || "Collaborator"} on ${comment.taskId?.title || "Task"}`,
      })),
    },
  };
};

export const buildDashboardData = async ({ user }) => {
  const userId = user._id;
  const role = normalizeRole(user.role);
  const unreadNotifications = await Notification.countDocuments({ userId, read: false });

  if (role === "super_admin") {
    return buildSuperAdminDashboard({ userId, unreadNotifications });
  }

  if (role === "owner") {
    return buildOwnerDashboard({ userId, unreadNotifications });
  }

  if (role === "manager") {
    return buildManagerDashboard({ userId, unreadNotifications });
  }

  if (role === "guest") {
    return buildGuestDashboard({ userId, unreadNotifications });
  }

  return buildMemberDashboard({ userId, unreadNotifications });
};
