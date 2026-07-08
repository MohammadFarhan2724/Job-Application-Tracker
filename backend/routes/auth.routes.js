const express = require('express')
const router = express.Router()
const {validateRegister, validateLogin} = require('../middleware/validate.middleware')
const authMiddleware = require('../middleware/auth.middleware')
const {register, login, googleAuthRedirect, googleAuthCallback} = require('../controllers/auth.controller')

router.post('/register', validateRegister, register)
router.post('/login', validateLogin, login)

router.get('/google', authMiddleware, googleAuthRedirect)
router.get('/google/callback', googleAuthCallback)

module.exports = router;