const User = require ('../models/user')
const bcrypt = require ('bcrypt')
const jwt = require ('jsonwebtoken')

const register = async (req, res) => {
    try {
        const { email, password, username } = req.body
      
        const user = await User.create({
            email,
            password,
            username
        })

        res.status(201).json({
          message: "User registered successfully !"
        });
    }   catch (error){
        res.status(500).json({ message: error.message })
    }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
       return res.status(401).json({message : "Invalid Password"})
    }
    
    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'})

    res.status(200).json({message: "Login Successful", token})

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
};