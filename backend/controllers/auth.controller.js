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

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    else
    res.status(200).json({
      message: "Login successful",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
};