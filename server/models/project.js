const mongoose = require('mongoose')
const Schema = mongoose.Schema

const projectSchema = new Schema ({
  name: {
    type: String,
    required: [true, 'name field cant empty']
  },
  todo: [{
    type: String
  }],
  member: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
})

const Project = mongoose.model('Project', projectSchema)
module.exports = Project