const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
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
      sort: async () =>
        [...memoryTodos].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        ),
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
      completed: Boolean(data.completed),
      createdAt: now,
      updatedAt: now,
    };
    memoryTodos.unshift(newTodo);
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
      ...(update.completed !== undefined
        ? { completed: Boolean(update.completed) }
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
