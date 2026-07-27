const Project = require('../models/Project');
const Notification = require('../models/Notification');

const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find()
      .populate('client', 'name company')
      .populate('teamMembers', 'name email');
    res.json({ success: true, data: projects });
  } catch (error) {
    next(error);
  }
};

const createProject = async (req, res, next) => {
  try {
    const project = new Project({
      ...req.body,
      createdBy: req.user._id,
    });
    const createdProject = await project.save();
    
    // Create Notification
    const notification = await Notification.create({
      user: req.user._id,
      message: `New project created: ${project.title}`,
      type: 'project',
    });
    req.io.emit('notification', notification);

    res.status(201).json({ success: true, data: createdProject });
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }
    const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: updatedProject });
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }
    await project.deleteOne();
    res.json({ success: true, message: 'Project removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProjects, createProject, updateProject, deleteProject };
