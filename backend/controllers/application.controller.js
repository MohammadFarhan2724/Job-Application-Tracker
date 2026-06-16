const Application = require('../models/application')

const createApplication = async (req, res) => {
    try{
        const application = await Application.create({
            ...req.body,
            userId:req.user.id
        })

        res.status(201).json(application)
    } catch (error){
        res.status(500).json({message: error.message})
    }
}

const getApplication = async (req, res) => {
    try {
        const application = await Application.find()

        res.status(200).json(application)
    }   catch(error){
        res.status(500).json({message: error.message})
    }
}

const getApplicationById = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)

        res.status(200).json(application)
    }   catch (error) {
        res.status(500).json({message: error.message})
    }
}

const updateApplication = async (req, res) => {
    try {
        const application = await Application.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new : true}
        )
        res.status(200).json(application)
    } catch (error){
        res.status(500).json({message: error.message})
    }
}

const deleteApplication = async (req, res) => {
    try {
        const application = await Application.findByIdAndDelete(req.params.id)

        res.status(200).json({ message: "Application deleted"})
    }  catch (error) {
        res.status(500).json({ message: error.message })
    }
}

module.exports = {
  createApplication,
  getApplication,
  getApplicationById,
  updateApplication,
  deleteApplication,
};
