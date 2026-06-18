const express = require ('express')
const router = express.Router()
const {validateRegister, validateLogin} = require('../middleware/validate.middleware')
const {register, login} = require ('../controllers/auth.controller')

router.post('/register',validateRegister, register)
router.post('/login',validateLogin, login)


module.exports = router;