const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'config.json');

// Helper: Load config file
function loadConfig() {
  if (!fs.existsSync(configPath)) {
    const defaultConfig = { showNoHp: true, showEmail: true };
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), 'utf8');
    return defaultConfig;
  }
  try {
    const configData = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(configData);
  } catch (err) {
    console.error('Error reading config file, using defaults:', err);
    return { showNoHp: true, showEmail: true };
  }
}

// Helper: Save config file
function saveConfig(config) {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving config file:', err);
    return false;
  }
}

// Handler: GET /api/config
const getConfig = (req, res) => {
  const config = loadConfig();
  res.json(config);
};

// Handler: POST /api/config
const updateConfig = (req, res) => {
  const { showNoHp, showEmail } = req.body;
  
  if (typeof showNoHp !== 'boolean' || typeof showEmail !== 'boolean') {
    return res.status(400).json({ error: 'showNoHp and showEmail must be boolean values.' });
  }
  
  const newConfig = { showNoHp, showEmail };
  const success = saveConfig(newConfig);
  
  if (success) {
    res.json({ message: 'Configuration updated successfully.', config: newConfig });
  } else {
    res.status(500).json({ error: 'Failed to save configuration.' });
  }
};

module.exports = {
  loadConfig,
  getConfig,
  updateConfig
};
