const express = require('express');
const cors = require('cors');
require('dotenv').config();

const configController = require('./controllers/configController');
const participantController = require('./controllers/participantController');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes

app.get('/api/config', configController.getConfig);
app.post('/api/config', configController.updateConfig);

// 2. Participant registration & scores
app.post('/api/register', participantController.registerParticipant);
app.post('/api/score', participantController.updateScore);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
