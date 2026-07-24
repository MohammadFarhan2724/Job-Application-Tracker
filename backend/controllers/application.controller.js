const Application = require('../models/application')

const createApplication = async (req, res) => {
    try{
        const application = await Application.create({
            ...req.body,
            userId: req.user.id
        })
        res.status(201).json(application)
    } catch (error){
        res.status(500).json({message: error.message})
    }
}

const getApplication = async (req, res) => {
    try {
        const application = await Application.find({ userId: req.user.id }) // fixed
        res.status(200).json(application)
    } catch(error){
        res.status(500).json({message: error.message})
    }
}

const getApplicationById = async (req, res) => {
    try {
        const application = await Application.findOne({
            _id: req.params.id,
            userId: req.user.id  // ensures ownership
        })

        if (!application) {
            return res.status(404).json({ message: "Application not found" })
        }

        res.status(200).json(application)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const updateApplication = async (req, res) => {
    try {
        const application = await Application.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id }, // ensures ownership
            req.body,
            { new: true }
        )

        if (!application) {
            return res.status(404).json({ message: "Application not found" })
        }

        res.status(200).json(application)
    } catch (error){
        res.status(500).json({message: error.message})
    }
}

const deleteApplication = async (req, res) => {
    try {
        const application = await Application.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id  // ensures ownership
        })

        if (!application) {
            return res.status(404).json({ message: "Application not found" })
        }

        res.status(200).json({ message: "Application deleted"})
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const checkDuplicate = async (userId, companyName, jobRole) => {
    try {
        const application = await Application.findOne({
            userId,
            companyName,
            jobRole
        });
        return application;
    } catch (error) {
        throw error;
    }
};

module.exports = {
  createApplication,
  getApplication,
  getApplicationById,
  updateApplication,
  deleteApplication,
  checkDuplicate,
};