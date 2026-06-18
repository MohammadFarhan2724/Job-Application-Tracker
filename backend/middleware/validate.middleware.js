const {registerSchema, loginSchema} = require('../schemas/auth.schema')

const validateRegister = (req, res, next) => {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      errors: result.error.flatten().fieldErrors,
    });
  }

  req.body = result.data;
  next();
};

const validateLogin = (req, res, next) => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      errors: result.error.flatten().fieldErrors,
    });
  }

  req.body = result.data;
  next();
};

module.exports = { validateRegister, validateLogin };