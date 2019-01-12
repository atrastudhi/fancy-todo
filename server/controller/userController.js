const User = require('../models/user')
const helper = require('../helpers/helper')

module.exports = {
  register: (req, res) => {
    User.create({
      email: req.body.email,
      password: req.body.password,
      method: 'register'
    })
    .then(user => {
      res.status(201).json(user)
    })
    .catch(err => {
      res.status(500).json({
        errors: err
      })
    })
  },
  login: (req, res) => {
    User.findOne({
      email: req.body.email
    })
    .then(user => {
      if(!user) {
        res.status(400).json({
          message: 'wrong email/password'
        })
      } else {
        let check = helper.compare(req.body.password, user.password)
        if(!check) {
          res.status(400).json({
            message: 'wrong email/password'
          })
        } else {
          res.status(200).json({
            token: helper.token(user.email)
          })
        }
      }
    })
    .catch(err => {
      res.status(500).json({
        errors: err
      })
    })
  },
  oauth: async (req, res) => {
    try {
      const userFind = await User.findOne({
        email: req.body.email
      })
      if(!userFind) {
        const newUser = await User.create({
          email: req.body.email,
          password: process.env.TEMPLATE_PASS,
          method: 'google'
        })
        res.status(201).json({
          token: helper.token(newUser.email)
        })
      } else {
        if(userFind.method === 'register') {
          res.status(400).json({
            message: 'you already register, please login'
          })
        } else {
          res.status(200).json({
            token: helper.token(userFind.email)
          })
        }
      }
    } catch (err) {
      res.status(500).json({
        errors: err
      })
    }
  } 
}