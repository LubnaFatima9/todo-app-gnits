const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    completed: { type: Boolean, default: false },
    dueDate: { type: String, default: "" },
    dueTime: { type: String, default: "" },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    category: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

const TodoModel = mongoose.model("Todo", todoSchema);

// In-memory store fallback when MongoDB is offline
let memoryTodos = [];
const isConnected = () => mongoose.connection.readyState === 1;

const Todo = {
  find() {
    if (isConnected()) {
      return TodoModel.find();
    }
    return {
      sort: async (sortSpec = {}) => {
        const dir = sortSpec.createdAt === -1 ? -1 : 1;
        return [...memoryTodos].sort(
          (a, b) => dir * (new Date(a.createdAt) - new Date(b.createdAt))
        );
      },
      then: (resolve, reject) =>
        Promise.resolve([...memoryTodos]).then(resolve, reject),
    };
  },

  async create(data) {
    if (isConnected()) {
      return TodoModel.create(data);
    }
    const now = new Date().toISOString();
    const newTodo = {
      _id: new mongoose.Types.ObjectId().toString(),
      title: String(data.title || "").trim(),
      description: String(data.description || "").trim(),
      completed: Boolean(data.completed),
      dueDate: String(data.dueDate || ""),
      dueTime: String(data.dueTime || ""),
      priority: ["low", "medium", "high"].includes(data.priority)
        ? data.priority
        : "medium",
      category: String(data.category || "").trim(),
      createdAt: now,
      updatedAt: now,
    };
    memoryTodos.push(newTodo);
    return newTodo;
  },

  async findByIdAndUpdate(id, update, options) {
    if (isConnected()) {
      return TodoModel.findByIdAndUpdate(id, update, options);
    }
    const index = memoryTodos.findIndex((t) => t._id === id);
    if (index === -1) return null;
    const current = memoryTodos[index];
    const updated = {
      ...current,
      ...(update.title !== undefined
        ? { title: String(update.title).trim() }
        : {}),
      ...(update.description !== undefined
        ? { description: String(update.description).trim() }
        : {}),
      ...(update.completed !== undefined
        ? { completed: Boolean(update.completed) }
        : {}),
      ...(update.dueDate !== undefined
        ? { dueDate: String(update.dueDate) }
        : {}),
      ...(update.dueTime !== undefined
        ? { dueTime: String(update.dueTime) }
        : {}),
      ...(update.priority !== undefined &&
      ["low", "medium", "high"].includes(update.priority)
        ? { priority: update.priority }
        : {}),
      ...(update.category !== undefined
        ? { category: String(update.category).trim() }
        : {}),
      updatedAt: new Date().toISOString(),
    };
    memoryTodos[index] = updated;
    return options?.new ? updated : current;
  },

  async findByIdAndDelete(id) {
    if (isConnected()) {
      return TodoModel.findByIdAndDelete(id);
    }
    const index = memoryTodos.findIndex((t) => t._id === id);
    if (index === -1) return null;
    const [deleted] = memoryTodos.splice(index, 1);
    return deleted;
  },
};

module.exports = Todo;
