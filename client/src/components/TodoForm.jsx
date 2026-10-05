import { useState, useEffect } from "react";
import { getTodayStr, CATEGORIES } from "../filters";

function TodoForm({ onAdd, defaultDate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(() => defaultDate || getTodayStr());
  const [dueTime, setDueTime] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (defaultDate) {
      setDueDate(defaultDate);
    }
  }, [defaultDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate || getTodayStr(),
      dueTime,
      priority,
      category,
    });
    setTitle("");
    setDescription("");
    setDueTime("");
    setPriority("medium");
    setCategory("");
    setShowDetails(false);
  };

  return (
    <form className="todo-form-wrapper" onSubmit={handleSubmit}>
      <div className="todo-form">
        <input
          type="text"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
        <button type="submit" disabled={!title.trim()}>
          Add Task
        </button>
      </div>

      {/* Quick schedule row: always simple and easy to scan */}
      <div className="quick-bar">
        <label className="quick-chip chip-blue" title="Choose date">
          <span className="chip-label">Date:</span>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            aria-label="Due date"
          />
        </label>

        <label className="quick-chip chip-green" title="Choose time (optional)">
          <span className="chip-label">Time:</span>
          <input
            type="time"
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
            aria-label="Due time"
          />
          {dueTime && (
            <button
              type="button"
              className="chip-clear"
              onClick={(e) => {
                e.preventDefault();
                setDueTime("");
              }}
              title="Clear time"
            >
              ×
            </button>
          )}
        </label>

        <button
          type="button"
          className={`details-toggle ${
            showDetails || description || category || priority !== "medium"
              ? "active"
              : ""
          }`}
          onClick={() => setShowDetails((prev) => !prev)}
        >
          {showDetails
            ? "− Hide description & tags"
            : "+ Add description & priority"}
        </button>
      </div>

      {/* Expandable optional details: description, priority pills, category pills */}
      {showDetails && (
        <div className="details-drawer">
          <input
            type="text"
            className="desc-input"
            placeholder="Add an optional description or note for this task..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="pill-groups">
            <div className="pill-group">
              <span className="pill-group-label">Priority:</span>
              <div className="pill-options">
                {[
                  { id: "low", label: "Low", color: "green" },
                  { id: "medium", label: "Medium", color: "blue" },
                  { id: "high", label: "High", color: "pink" },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`choice-pill pill-${p.color} ${
                      priority === p.id ? "selected" : ""
                    }`}
                    onClick={() => setPriority(p.id)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pill-group">
              <span className="pill-group-label">Tag:</span>
              <div className="pill-options">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`choice-pill pill-blue ${
                      category === cat ? "selected" : ""
                    }`}
                    onClick={() =>
                      setCategory((prev) => (prev === cat ? "" : cat))
                    }
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

export default TodoForm;
