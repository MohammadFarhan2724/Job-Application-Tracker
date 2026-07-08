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
        const userId = req.user.id;
        const url = getAuthUrl(userId);
        res.status(200).json({ url });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const googleAuthCallback = async (req, res) => {
    try {
        const { code, state } = req.query;

        if (!code || !state) {
            return res.status(400).json({ message: "Authorization code or state missing" });
        }

        const tokens = await getTokensFromCode(code);

        const user = await User.findById(state);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.googleAccessToken = tokens.access_token;
        user.googleRefreshToken = tokens.refresh_token;
        user.gmailConnected = true;
        await user.save();

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