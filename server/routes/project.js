const express = require('express')
const router = express.Router()
const projectController = require('../controller/projectController')
const middleware = require('../middlewares/middleware')

router.get('/', middleware.authenticate, projectController.read)
router.post('/', middleware.authenticate, projectController.create)
router.put('/todo/:id', middleware.authenticate, middleware.projectOwner, projectController.addTodo)
router.put('/invite/:id', middleware.authenticate, middleware.projectOwner, middleware.members, projectController.invite)

module.exports = router