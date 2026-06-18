const z = require('zod')

const registerSchema = z.object({
    email: z.string().email("Email cannot be empty"),
    password: z.string().min(8, "Password must be 8 characters"),
    username: z.string().min(3, "Username must be atleast 3 characters")
})

const loginSchema = z.object({
    email: z.string().email("Invalid Email Address"),
    password: z.string().min(1, "Password cannot be empty")
})

module.exports = {registerSchema, loginSchema}
