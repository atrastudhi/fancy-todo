const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Project = require('../models/project')
const ObjectId = require('mongoose').Types.ObjectId

module.exports = {
  authenticate: (req, res, next) => {
    const token = req.headers.token

    if(!token) {
      res.status(400).json({
        message: 'token is undefined'
      })
    }

    try {
      let decode = jwt.verify(token, process.env.SECRET)
      User.findOne({
        email: decode.email
      })
      .then(user => {
        if(!user) {
          res.status(400).json({
            message: 'user not found'
          })
        } else {
          req.decoded = user
          next()
        }
      })
      .catch(err => {
        res.status(500).json({
          errors: err
        })
      })
    } catch (err) {
      res.status(500).json({
        errors: err
      })
    }
  },
  projectOwner: (req, res, next) => {
    Project.findById(req.params.id).populate('member')
    .then(({ member }) => {
      let check = false
      member.forEach(user => {
        if(user.email === req.decoded.email) {
          check = true
        }
      });
      
      if(!check) {
        res.status(400).json({
          message: 'not member of this project'
        })
      } else {
        req.project = member
        next()
      }
    })
    .catch(err => {
      res.status(500).json({
        errros: err
      })
    })
  },
  members: (req, res, next) => {
    let check = true

    req.project.forEach(user => {
      if(user.email === req.body.email) {
        check = false
      }
    });

    if(!check) {
      res.status(400).json({
        message: 'member already in this projects'
      })
    } else next ()
  }
}