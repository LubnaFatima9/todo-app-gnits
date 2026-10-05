import { useEffect, useState } from "react";
import { getTodos, createTodo, updateTodo, deleteTodo } from "./api";
import {
  FILTERS,
  PRIORITIES,
  getTodayStr,
  isTodoOverdue,
} from "./filters";
import Sidebar from "./components/Sidebar";
import TodoForm from "./components/TodoForm";
import TodoItem from "./components/TodoItem";

const PAGE_SIZE = 10;

function App() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState("all");
  const [dateMode, setDateMode] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("added");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Runs an API action and shows its error in the banner if it fails
  const run = async (action) => {
    try {
      setError("");
      await action();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  useEffect(() => {
    run(async () => setTodos(await getTodos())).finally(() =>
      setLoading(false)
    );
  }, []);

  // Filter todos by status, date mode, and search query
  const todayStr = getTodayStr();
  const filteredTodos = todos
    .filter(FILTERS[filter].test)
    .filter((t) => {
      if (dateMode === "today") {
        return (t.dueDate || todayStr) === todayStr;
      }
      if (dateMode === "upcoming") {
        return Boolean(t.dueDate && t.dueDate > todayStr);
      }
      if (dateMode === "overdue") {
        return isTodoOverdue(t);
      }
      if (dateMode === "custom" && selectedDate) {
        return t.dueDate === selectedDate;
      }
      return true;
    })
    .filter((t) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        t.title?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === "priority") {
        const wA = PRIORITIES[a.priority]?.weight || 2;
        const wB = PRIORITIES[b.priority]?.weight || 2;
        if (wB !== wA) return wB - wA;
      }
      if (sortBy === "dueDate") {
        const dA = `${a.dueDate || "9999-99-99"} ${a.dueTime || "23:59"}`;
        const dB = `${b.dueDate || "9999-99-99"} ${b.dueTime || "23:59"}`;
        if (dA !== dB) return dA.localeCompare(dB);
      }
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    });

  const totalPages = Math.max(1, Math.ceil(filteredTodos.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handleAdd = (payload) =>
    run(async () => {
      const newTodo = await createTodo(payload);
      setTodos((prev) => {
        const next = [...prev, newTodo];
        // Jump to the page where the newly added task appears
        const nextTotalPages = Math.max(1, Math.ceil(next.length / PAGE_SIZE));
        setCurrentPage(nextTotalPages);
        return next;
      });
    });

  const handleUpdate = (id, data) =>
    run(async () => {
      const updated = await updateTodo(id, data);
      setTodos((prev) => prev.map((t) => (t._id === id ? updated : t)));
    });

  const handleDelete = (id) =>
    run(async () => {
      await deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t._id !== id));
    });

  const handleClearDone = () =>
    run(async () => {
      const done = todos.filter(FILTERS.done.test);
      await Promise.all(done.map((t) => deleteTodo(t._id)));
      setTodos((prev) => prev.filter((t) => !t.completed));
    });

  const startIndex = (safePage - 1) * PAGE_SIZE;
  const paginatedTodos = filteredTodos.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  return (
    <div className="layout">
      <Sidebar
        todos={todos}
        filter={filter}
        onFilter={(f) => {
          setFilter(f);
          setCurrentPage(1);
        }}
        selectedDate={selectedDate}
        onSelectDate={(d) => {
          setSelectedDate(d);
          setCurrentPage(1);
        }}
        dateMode={dateMode}
        onDateMode={(m) => {
          setDateMode(m);
          setCurrentPage(1);
        }}
        onClearDone={handleClearDone}
      />

      <main className="panel content">
        <header className="content-header">
          <div>
            <h2>{FILTERS[filter].label}</h2>
            {dateMode === "custom" && selectedDate && (
              <p className="active-date-sub">
                Scheduled for{" "}
                {new Date(`${selectedDate}T00:00:00`).toLocaleDateString(
                  undefined,
                  {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }
                )}
              </p>
            )}
          </div>
          <span className="content-count">
            {filteredTodos.length}{" "}
            {filteredTodos.length === 1 ? "task" : "tasks"}
          </span>
        </header>

        <TodoForm
          onAdd={handleAdd}
          defaultDate={dateMode === "custom" ? selectedDate : ""}
        />

        <div className="toolbar">
          <input
            type="search"
            className="search-input"
            placeholder="Search tasks by title, description, or category..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort tasks"
          >
            <option value="added">Sort: Order Added</option>
            <option value="dueDate">Sort: Due Date & Time</option>
            <option value="priority">Sort: Priority (High → Low)</option>
          </select>
        </div>

        {error && (
          <div className="error" role="alert">
            <span>{error}</span>
            <button onClick={() => setError("")} aria-label="Dismiss">
              ×
            </button>
          </div>
        )}

        {loading ? (
          <p className="empty">Loading...</p>
        ) : filteredTodos.length === 0 ? (
          <div className="empty">
            <img src="/logo.png" alt="" />
            <p>
              {searchQuery
                ? "No tasks match your search."
                : filter === "done"
                ? "Nothing completed yet"
                : "You're all caught up. Add a task above."}
            </p>
          </div>
        ) : (
          <>
            <ul className="todo-list">
              {paginatedTodos.map((todo) => (
                <TodoItem
                  key={todo._id}
                  todo={todo}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              ))}
            </ul>

            <nav className="pagination" aria-label="Todo list pagination">
              <span className="pagination-info">
                Showing {startIndex + 1}–
                {Math.min(startIndex + PAGE_SIZE, filteredTodos.length)} of{" "}
                {filteredTodos.length} (Max {PAGE_SIZE} per page)
              </span>
              <div className="pagination-buttons">
                <button
                  type="button"
                  className="page-btn"
                  disabled={safePage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      type="button"
                      className={`page-btn ${
                        page === safePage ? "active" : ""
                      }`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  type="button"
                  className="page-btn"
                  disabled={safePage >= totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                >
                  Next →
                </button>
              </div>
            </nav>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
