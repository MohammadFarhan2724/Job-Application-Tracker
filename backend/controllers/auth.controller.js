const User = require ('../models/user')

const register = async (req, res) => {
    try {
        const { email, password, username } = req.body

        const user = await User.create({
            email,
            password,
            username
        })

        res.status(201).json(user);
    }   catch (error){
        res.status(500).json({ message: error.message })
    }
}