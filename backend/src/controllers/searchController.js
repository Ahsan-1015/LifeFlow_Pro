import Project from "../models/Project.js";
import Task from "../models/Task.js";
import User from "../models/User.js";

export const globalSearch = async (req, res, next) => {
  try {
    const search = req.query.q?.trim() || "";
    if (!search) {
      return res.json({ projects: [], tasks: [], users: [] });
    }

    const scopedProjects = await Project.find({
      $or: [{ owner: req.user._id }, { "members.user": req.user._id }],
    }).select("_id");
    const projectIds = scopedProjects.map((project) => project._id);

    const [projects, tasks, users] = await Promise.all([
      Project.find({
        _id: { $in: projectIds },
        title: { $regex: search, $options: "i" },
      }).limit(8),
      Task.find({
        projectId: { $in: projectIds },
        title: { $regex: search, $options: "i" },
      })
        .populate("assignedTo", "name avatar")
        .limit(10),
      User.find({
        name: { $regex: search, $options: "i" },
      })
        .select("name email avatar role")
        .limit(8),
    ]);

    res.json({ projects, tasks, users });
  } catch (error) {
    next(error);
  }
};
