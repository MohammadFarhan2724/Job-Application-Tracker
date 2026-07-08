const User = require ('../models/user')
const bcrypt = require ('bcrypt')
const jwt = require ('jsonwebtoken')
const { getAuthUrl, getTokensFromCode } = require('../services/google.service')

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

    res.status(200).json({
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    })

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const googleAuthRedirect = async (req, res) => {
    try {
        const url = getAuthUrl();
        res.redirect(url);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const googleAuthCallback = async (req, res) => {
    try {
        const { code } = req.query;

        if (!code) {
            return res.status(400).json({ message: "Authorization code missing" });
        }

        const tokens = await getTokensFromCode(code);

        // We'll fill this part in next step —
        // it needs to know WHICH user in our database this belongs to

        res.redirect(`${process.env.CLIENT_URL}/dashboard?gmail=connected`);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
  register,
  login,
  googleAuthRedirect,
  googleAuthCallback,
};