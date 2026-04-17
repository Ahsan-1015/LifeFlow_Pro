import { useState } from "react";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/client";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ projects: [], tasks: [], users: [] });

  const handleSearch = async (event) => {
    event.preventDefault();
    const { data } = await api.get(`/search?q=${encodeURIComponent(query)}`);
    setResults(data);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="glass-panel flex gap-3 rounded-[2rem] p-4">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search tasks, projects, or members..."
          className="input-field"
        />
        <button type="submit" className="gradient-button">
          <Search size={18} />
        </button>
      </form>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="glass-panel rounded-[2rem] p-5">
          <h3 className="font-display text-2xl font-bold">Projects</h3>
          <div className="mt-4 space-y-3">
            {results.projects.map((project) => (
              <Link key={project._id} to={`/projects/${project._id}`} className="block rounded-2xl bg-slate-100 p-4 dark:bg-slate-800/70">
                <p className="font-semibold">{project.title}</p>
              </Link>
            ))}
          </div>
        </div>
        <div className="glass-panel rounded-[2rem] p-5">
          <h3 className="font-display text-2xl font-bold">Tasks</h3>
          <div className="mt-4 space-y-3">
            {results.tasks.map((task) => (
              <div key={task._id} className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800/70">
                <p className="font-semibold">{task.title}</p>
                <p className="mt-1 text-sm text-slate-500">{task.assignedTo?.name || "Unassigned"}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-panel rounded-[2rem] p-5">
          <h3 className="font-display text-2xl font-bold">Members</h3>
          <div className="mt-4 space-y-3">
            {results.users.map((user) => (
              <div key={user._id} className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800/70">
                <p className="font-semibold">{user.name}</p>
                <p className="mt-1 text-sm text-slate-500">{user.email}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
