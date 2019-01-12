const express = require('express')
const router = express.Router()
const todoController = require('../controller/todoController')
const middleware = require('../middlewares/middleware')

router.get('/', middleware.authenticate, todoController.read)
router.post('/', middleware.authenticate, todoController.create)
router.post('/:id', middleware.authenticate, todoController.update)
router.delete('/:id', middleware.authenticate, todoController.remove)

module.exports = router