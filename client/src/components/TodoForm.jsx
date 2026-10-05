import { useState, useEffect } from "react";
import { getTodayStr, CATEGORIES } from "../filters";

function TodoForm({ onAdd, defaultDate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(() => defaultDate || getTodayStr());
  const [dueTime, setDueTime] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("");

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
          Add
        </button>
      </div>

      <div className="todo-form-extras">
        <input
          type="text"
          className="extra-input extra-desc"
          placeholder="Optional description or notes..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="extra-controls">
          <input
            type="date"
            className="extra-input"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            aria-label="Due date"
            title="Due date"
          />
          <input
            type="time"
            className="extra-input"
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
            aria-label="Due time"
            title="Due time (optional)"
          />
          <select
            className="extra-input"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            aria-label="Priority"
            title="Priority"
          >
            <option value="low">Low priority</option>
            <option value="medium">Medium priority</option>
            <option value="high">High priority</option>
          </select>
          <select
            className="extra-input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Category"
            title="Category (optional)"
          >
            <option value="">No category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>
    </form>
  );
}

export default TodoForm;
