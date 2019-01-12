var express = require('express');
var router = express.Router();
const userController = require('../controller/userController')

router.post('/', userController.register)
router.post('/login', userController.login)
router.post('/login/oauth', userController.oauth)

module.exports = router;
