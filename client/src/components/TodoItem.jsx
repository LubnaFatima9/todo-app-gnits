import { useState } from "react";
import { getTodayStr, isTodoOverdue, CATEGORIES } from "../filters";

function formatDueDate(dateStr) {
  if (!dateStr) return "";
  const today = getTodayStr();
  if (dateStr === today) return "Today";
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

function formatDueTime(timeStr) {
  if (!timeStr) return "";
  const [hStr, mStr] = timeStr.split(":");
  const h = Number(hStr);
  if (Number.isNaN(h)) return timeStr;
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${mStr} ${suffix}`;
}

function TodoItem({ todo, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(todo.title);
  const [description, setDescription] = useState(todo.description || "");
  const [dueDate, setDueDate] = useState(todo.dueDate || "");
  const [dueTime, setDueTime] = useState(todo.dueTime || "");
  const [priority, setPriority] = useState(todo.priority || "medium");
  const [category, setCategory] = useState(todo.category || "");

  const startEditing = () => {
    setText(todo.title);
    setDescription(todo.description || "");
    setDueDate(todo.dueDate || "");
    setDueTime(todo.dueTime || "");
    setPriority(todo.priority || "medium");
    setCategory(todo.category || "");
    setIsEditing(true);
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    const title = text.trim();
    if (!title) {
      setText(todo.title);
      setIsEditing(false);
      return;
    }
    onUpdate(todo._id, {
      title,
      description: description.trim(),
      dueDate,
      dueTime,
      priority,
      category,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setText(todo.title);
    setDescription(todo.description || "");
    setDueDate(todo.dueDate || "");
    setDueTime(todo.dueTime || "");
    setPriority(todo.priority || "medium");
    setCategory(todo.category || "");
    setIsEditing(false);
  };

  const overdue = isTodoOverdue(todo);
  const effectiveDate = todo.dueDate
    ? formatDueDate(todo.dueDate)
    : todo.createdAt
    ? new Date(todo.createdAt).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
      })
    : "";

  return (
    <li className={`todo-item ${todo.completed ? "completed" : ""}`}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onUpdate(todo._id, { completed: !todo.completed })}
        aria-label={`Mark "${todo.title}" as ${
          todo.completed ? "not done" : "done"
        }`}
      />

      {isEditing ? (
        <div
          className="edit-panel"
          onKeyDown={(e) => {
            if (e.key === "Escape") handleCancel();
          }}
        >
          <input
            className="edit-input"
            value={text}
            placeholder="Task title"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave(e);
            }}
            autoFocus
          />
          <input
            className="edit-input edit-desc-input"
            value={description}
            placeholder="Optional description..."
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave(e);
            }}
          />
          <div className="edit-meta-row">
            <input
              type="date"
              className="edit-select"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              aria-label="Edit date"
            />
            <input
              type="time"
              className="edit-select"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              aria-label="Edit time"
            />
            <select
              className="edit-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              aria-label="Edit priority"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <select
              className="edit-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Edit category"
            >
              <option value="">No category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <div className="edit-actions">
              <button
                type="button"
                className="save-btn"
                onClick={handleSave}
              >
                Save
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="todo-text" onDoubleClick={startEditing}>
          <div className="title-row">
            <span className="title">{todo.title}</span>
            {todo.priority && todo.priority !== "medium" && (
              <span className={`badge badge-priority-${todo.priority}`}>
                {todo.priority}
              </span>
            )}
            {todo.category && (
              <span className="badge badge-category">{todo.category}</span>
            )}
          </div>

          {todo.description && (
            <p className="todo-description">{todo.description}</p>
          )}

          <div className="meta-row">
            <span className={`meta ${overdue ? "meta-overdue" : ""}`}>
              {todo.dueDate ? "Scheduled: " : "Added "}
              {effectiveDate}
              {todo.dueTime ? ` at ${formatDueTime(todo.dueTime)}` : ""}
              {overdue ? " • Overdue" : ""}
            </span>
          </div>
        </div>
      )}

      {!isEditing && (
        <div className="actions">
          <button onClick={startEditing}>Edit</button>
          <button className="delete" onClick={() => onDelete(todo._id)}>
            Delete
          </button>
        </div>
      )}
    </li>
  );
}

export default TodoItem;
