const mongoose = require('mongoose');
const { esClient } = require('../config/elasticsearch');  
const taskSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    completed: Boolean,
    dueDate: Date,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Elasticsearch indexing after saving
taskSchema.post('save', async function () {
  try {
    await esClient.index({
      index: 'tasks',
      id: this._id.toString(),
      document: {
        title: this.title,
        description: this.description,
        completed: this.completed,
        dueDate: this.dueDate,
        userId: this.userId.toString(),
        createdAt: this.createdAt,
      },
    });
  
  } catch (err) {
    console.error(` Failed to index task (ID: ${this._id}):`, err);
  }
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task; 
