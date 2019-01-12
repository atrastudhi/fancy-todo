const mongoose = require('mongoose')
const Schema = mongoose.Schema

const todoSchema = new Schema ({
  title: {
    type: String,
    required: [true, 'title field cant empty']
  },
  description: {
    type: String,
    required: [true, 'description field cant empty']
  },
  status: {
    type: Boolean,
    required: [true, 'status field canat empty']
  },
  due_date: {
    type: Date,
    required: [true, 'due date field cant empty']
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
})

const Todo = mongoose.model('Todo', todoSchema)
module.exports = Todo