const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { loadConfig } = require('./configController');

const csvPath = path.join(__dirname, '..', 'participants.csv');

// Helper: Append registration to CSV
async function appendParticipantToCsv(participant) {
  const fileExists = fs.existsSync(csvPath) && fs.statSync(csvPath).size > 0;
  
  const csvWriter = createCsvWriter({
    path: csvPath,
    header: [
      { id: 'id', title: 'ID' },
      { id: 'name', title: 'Nama' },
      { id: 'noHp', title: 'No HP' },
      { id: 'email', title: 'Email' },
      { id: 'score', title: 'Score' },
      { id: 'registeredAt', title: 'Registered At' }
    ],
    append: fileExists
  });

  await csvWriter.writeRecords([participant]);
}

// Helper: Update score in CSV
function updateScoreInCsv(id, score) {
  if (!fs.existsSync(csvPath)) return false;
  
  try {
    const csvData = fs.readFileSync(csvPath, 'utf8');
    const lines = csvData.split(/\r?\n/);
    if (lines.length === 0 || !lines[0]) return false;
    
    // Parse headers dynamically
    const headers = lines[0].split(',');
    const idIndex = headers.indexOf('ID');
    const scoreIndex = headers.indexOf('Score');
    
    if (idIndex === -1 || scoreIndex === -1) {
      console.error('CSV headers missing ID or Score columns');
      return false;
    }
    
    let updated = false;
    const newLines = lines.map((line, idx) => {
      if (idx === 0 || !line.trim()) return line;
      
      const cols = line.split(',');
      if (cols[idIndex] === id) {
        cols[scoreIndex] = score.toString();
        updated = true;
      }
      return cols.join(',');
    });
    
    if (updated) {
      fs.writeFileSync(csvPath, newLines.join('\n'), 'utf8');
      return true;
    }
    return false;
  } catch (err) {
    console.error('Error updating score in CSV:', err);
    return false;
  }
}

// Handler: POST /api/register
const registerParticipant = async (req, res) => {
  const { name, noHp, email } = req.body;
  const config = loadConfig();
  const errors = [];

  // Validation
  if (!name || typeof name !== 'string' || !name.trim()) {
    errors.push('Nama harus diisi.');
  }

  if (config.showNoHp && (!noHp || typeof noHp !== 'string' || !noHp.trim())) {
    errors.push('Nomor HP harus diisi.');
  }

  if (config.showEmail && (!email || typeof email !== 'string' || !email.trim())) {
    errors.push('Email harus diisi.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  // Sanitize fields to prevent commas from breaking simple CSV rows
  const cleanName = (name || '').replace(/,/g, ' ');
  const cleanNoHp = (noHp || '').replace(/,/g, ' ');
  const cleanEmail = (email || '').replace(/,/g, ' ');

  // Create participant structure
  const participantId = Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
  const participant = {
    id: participantId,
    name: cleanName,
    noHp: config.showNoHp ? cleanNoHp : '',
    email: config.showEmail ? cleanEmail : '',
    score: 0,
    registeredAt: new Date().toISOString()
  };

  try {
    await appendParticipantToCsv(participant);
    res.json({
      message: 'Registration successful.',
      id: participant.id,
      participant
    });
  } catch (err) {
    console.error('Error writing participant to CSV:', err);
    res.status(500).json({ error: 'Failed to write participant logs locally.' });
  }
};

// Handler: POST /api/score
const updateScore = (req, res) => {
  const { id, score } = req.body;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Valid participant ID is required.' });
  }

  if (typeof score !== 'number') {
    return res.status(400).json({ error: 'Score must be a number.' });
  }

  const success = updateScoreInCsv(id, score);

  if (success) {
    res.json({ message: 'Score updated successfully.', id, score });
  } else {
    res.status(404).json({ error: 'Participant not found or CSV error occurred.' });
  }
};

module.exports = {
  registerParticipant,
  updateScore
};
