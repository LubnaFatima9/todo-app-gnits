// Each filter has a label for the UI and a test for which todos it shows
export const FILTERS = {
  all: { label: "All tasks", test: () => true },
  active: { label: "Active", test: (t) => !t.completed },
  done: { label: "Completed", test: (t) => t.completed },
};

export const getTodayStr = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const isTodoOverdue = (todo) => {
  if (todo.completed || !todo.dueDate) return false;
  const today = getTodayStr();
  if (todo.dueDate < today) return true;
  if (todo.dueDate === today && todo.dueTime) {
    const now = new Date();
    const currentHM = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;
    return todo.dueTime < currentHM;
  }
  return false;
};

export const PRIORITIES = {
  low: { label: "Low", weight: 1 },
  medium: { label: "Medium", weight: 2 },
  high: { label: "High", weight: 3 },
};

export const CATEGORIES = ["Personal", "Work", "Study", "Health", "Errands"];

