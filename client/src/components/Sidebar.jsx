import { FILTERS, getTodayStr, isTodoOverdue } from "../filters";

const RADIUS = 34;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function ProgressRing({ percent }) {
  return (
    <div className="ring">
      <svg viewBox="0 0 80 80">
        <circle className="ring-track" cx="40" cy="40" r={RADIUS} />
        <circle
          className="ring-fill"
          cx="40"
          cy="40"
          r={RADIUS}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - percent / 100)}
        />
      </svg>
      <span>{Math.round(percent)}%</span>
    </div>
  );
}

function Sidebar({
  todos,
  filter,
  onFilter,
  selectedDate,
  onSelectDate,
  dateMode,
  onDateMode,
  onClearDone,
}) {
  const doneCount = todos.filter(FILTERS.done.test).length;
  const percent = todos.length ? (doneCount / todos.length) * 100 : 0;
  const todayStr = getTodayStr();
  const displayDateObj = selectedDate
    ? new Date(`${selectedDate}T00:00:00`)
    : new Date();
  const formattedDate = displayDateObj.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const todayCount = todos.filter(
    (t) => (t.dueDate || todayStr) === todayStr
  ).length;
  const upcomingCount = todos.filter(
    (t) => t.dueDate && t.dueDate > todayStr
  ).length;
  const overdueCount = todos.filter((t) => isTodoOverdue(t)).length;

  return (
    <aside className="panel sidebar">
      <div className="brand">
        <img src="/logo.png" alt="Being Infinity logo" className="logo" />
        <div>
          <p className="brand-name">Being Infinity's</p>
          <h1>Todo App</h1>
        </div>
      </div>

      <div className="summary">
        <ProgressRing percent={percent} />
        <div>
          <p className="date">{formattedDate}</p>
          <p className="summary-text">
            {todos.length === 0
              ? "No tasks yet"
              : `${doneCount} of ${todos.length} tasks done`}
          </p>
        </div>
      </div>

      <nav className="filters" aria-label="Status filters">
        {Object.entries(FILTERS).map(([key, { label, test }]) => (
          <button
            key={key}
            className={filter === key ? "active" : ""}
            onClick={() => onFilter(key)}
          >
            {label}
            <span className="count">{todos.filter(test).length}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-section">
        <p className="section-label">Schedule</p>
        <div className="filters">
          <button
            className={dateMode === "all" ? "active" : ""}
            onClick={() => {
              onDateMode("all");
              onSelectDate("");
            }}
          >
            All dates
            <span className="count">{todos.length}</span>
          </button>
          <button
            className={dateMode === "today" ? "active" : ""}
            onClick={() => {
              onDateMode("today");
              onSelectDate(todayStr);
            }}
          >
            Today
            <span className="count">{todayCount}</span>
          </button>
          <button
            className={dateMode === "upcoming" ? "active" : ""}
            onClick={() => {
              onDateMode("upcoming");
              onSelectDate("");
            }}
          >
            Upcoming
            <span className="count">{upcomingCount}</span>
          </button>
          {overdueCount > 0 && (
            <button
              className={dateMode === "overdue" ? "active" : ""}
              onClick={() => {
                onDateMode("overdue");
                onSelectDate("");
              }}
            >
              Overdue
              <span className="count count-danger">{overdueCount}</span>
            </button>
          )}
        </div>

        <div className="date-picker-box">
          <label htmlFor="sidebar-date-Filter" className="date-picker-label">
            Filter by specific date
          </label>
          <div className="date-picker-row">
            <input
              id="sidebar-date-Filter"
              type="date"
              value={dateMode === "custom" ? selectedDate : ""}
              onChange={(e) => {
                const val = e.target.value;
                if (val) {
                  onDateMode("custom");
                  onSelectDate(val);
                } else {
                  onDateMode("all");
                  onSelectDate("");
                }
              }}
            />
            {dateMode === "custom" && selectedDate && (
              <button
                type="button"
                className="date-clear-btn"
                onClick={() => {
                  onDateMode("all");
                  onSelectDate("");
                }}
                title="Clear date filter"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {doneCount > 0 && (
        <button className="clear-done" onClick={onClearDone}>
          Clear completed ({doneCount})
        </button>
      )}
    </aside>
  );
}

export default Sidebar;
