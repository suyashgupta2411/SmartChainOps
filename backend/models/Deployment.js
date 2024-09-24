const mongoose = require('mongoose');

const DeploymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  repoUrl: { type: String, required: true },
  status: { type: String, required: true, default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Deployment', DeploymentSchema);
