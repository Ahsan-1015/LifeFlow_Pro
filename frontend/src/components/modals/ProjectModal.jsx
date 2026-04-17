import { useEffect, useState } from "react";
import ModalShell from "./ModalShell";

const ProjectModal = ({ open, onClose, onSubmit, initialValues, loading }) => {
  const [values, setValues] = useState({
    title: "",
    description: "",
    deadline: "",
  });

  useEffect(() => {
    setValues(
      initialValues || {
        title: "",
        description: "",
        deadline: "",
      }
    );
  }, [initialValues, open]);

  return (
    <ModalShell open={open} onClose={onClose} title={initialValues ? "Edit Project" : "Create Project"}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(values);
        }}
        className="space-y-5"
      >
        <div>
          <label className="label-text">Project title</label>
          <input
            className="input-field"
            value={values.title}
            onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
            required
          />
        </div>
        <div>
          <label className="label-text">Description</label>
          <textarea
            className="input-field min-h-28"
            value={values.description}
            onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
          />
        </div>
        <div>
          <label className="label-text">Deadline</label>
          <input
            type="date"
            className="input-field"
            value={values.deadline?.slice?.(0, 10) || values.deadline}
            onChange={(event) => setValues((current) => ({ ...current, deadline: event.target.value }))}
          />
        </div>
        <button type="submit" className="gradient-button w-full" disabled={loading}>
          {loading ? "Saving..." : initialValues ? "Save Changes" : "Create Project"}
        </button>
      </form>
    </ModalShell>
  );
};

export default ProjectModal;
