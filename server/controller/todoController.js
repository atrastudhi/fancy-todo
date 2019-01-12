const Todo = require('../models/todo')
const ObjectId = require('mongoose').Types.ObjectId
const helper = require('../helpers/helper')

module.exports = {
  create: (req, res) => {
    Todo.create({
      title: req.body.title,
      description: req.body.description,
      due_date: req.body.due_date,
      status: false,
      user: req.decoded._id
    })
    .then(async (todo) => {
      await helper.calendarInsert(req.decoded.email, req.body)
      res.status(201).json(todo)
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({
        errros: err.message
      })
    })
  },
  read: (req, res) => {
    Todo.find({
      user: ObjectId(req.decoded._id)
    })
    .then(todos => {
      res.status(200).json(todos)
    })
    .catch(err => {
      res.status(500).json({
        errors: err
      })
    })
  },
  update: (req, res) => {
    Todo.findById(req.params.id)
    .then(todo => {
      if(String(todo.user) !== String(req.decoded._id)) {
        res.status(400).json({
          message: 'invalid owner'
        })
        return 'invalid owner'
      } else {
        let query = { title, description, due_date, status } = req.body
        return Todo.findByIdAndUpdate(req.params.id, query, {
          new: true
        })
      }
    })
    .then(next => {
      if (next !== 'invalid owner') {
        res.status(200).json(next)
      }
    })
    .catch(err => {
      res.status(500).json({
        errors: err
      })
    })
  },
  remove: (req, res) => {
    Todo.findById(req.params.id)
    .then(todo => {
      if(String(todo.user) !== String(req.decoded._id)) {
        res.status(400).json({
          message: 'invalid owner'
        })
        return 'invalid owner'
      } else {
        return Todo.findByIdAndDelete(req.params.id)
      }
    })
    .then(next => {
      if(next !== 'invalid owner') {
        res.status(200).json(next)
      }
    })
    .catch(err => {
      res.status(500).json({
        errors: err
      })
    })
  }
}