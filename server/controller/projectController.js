const Project = require('../models/project')
const User = require('../models/user')
const kue = require('kue')
const queue = kue.createQueue()
const helper = require('../helpers/helper')

queue.process('email', function (job, done) {
  helper.sendmail(job, done)
})

module.exports = {
  create: (req ,res) => {
    Project.create({
      name: req.body.name,
      member: req.decoded._id
    })
    .then(project => {
      res.status(201).json(project)
    })
    .catch(err => {
      res.status(500).json({
        errors: err
      })
    })
  },
  read: (req, res) => {
    Project.find({
      member: {
        $all: [req.decoded._id]
      }
    })
    .populate('member')
    .exec()
    .then(project => {
      res.status(200).json(project)
    })
    .catch(err => {
      res.status(500).json({
        errors: err
      })
    })
  },
  addTodo: (req, res) => {
    Project.findByIdAndUpdate(req.params.id, {
      $push: {
        todo: req.body.todo
      },
    },
    {
      new: true
    })
    .then(project => {
      res.status(200).json(project)
    })
    .catch(err => {
      res.status(500).json({
        errors: err
      })
    })
  },
  invite: (req, res) => {
    User.findOne({
      email: req.body.email
    })
    .then(user => {
      if(!user) {
        res.status(400).json({
          message: 'user not found'
        })
      } else {
        Project.findByIdAndUpdate(req.params.id, {
          $push: {
            member: user._id
          }
        }, {
          new: true,
          runValidators: true
        })
        .then(project => {
          queue.create('email', {
            title: 'invite notification',
            to: req.body.email,
            template: `you are invited by ${req.decoded.email} to his project, please check your todo project list.`
          })
          .save(function (err) {
            if(!err) res.status(200).json(project)
          })
        })
        .catch(err => {
          res.status(500).json({
            errors: err
          })
        })
      }
    })
    .catch(err  => {
      console.log(err)
      res.status(500).json({
        errors: err
      })
    })
  }
}        