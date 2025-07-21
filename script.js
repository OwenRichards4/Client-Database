const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname))); // Serve index.html

app.post('/submit', (req, res) => {
    const filename = 'test.json';

    const userData = req.body;
    const jsonFilePath = path.join(__dirname, filename);

    fs.writeFile(jsonFilePath, JSON.stringify(userData, null, 2), (err) => {
        if (err) {
            console.error('Error writing file', err);
            return res.status(500).send('Failed to save data');
        }
        res.send('Data saved to user_data.json');
    });
});

app.post('/add-column', (req, res) => {
  const { tableName, columnName, defaultValue } = req.body;
  const filePath = path.join(__dirname, `${tableName}.json`);

  // Read the current JSON file
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('File read error:', err);
      return res.status(404).send('Table not found');
    }

    let records;
    try {
      records = JSON.parse(data);
    } catch (parseErr) {
      console.error('Invalid JSON format:', parseErr);
      return res.status(500).send('Invalid JSON structure');
    }

    // Add new column to each object
    const updated = records.map(entry => ({
      ...entry,
      [columnName]: defaultValue
    }));

    // Write back to the file
    fs.writeFile(filePath, JSON.stringify(updated, null, 2), err => {
      if (err) {
        console.error('Write error:', err);
        return res.status(500).send('Failed to update table');
      }
      res.send(`Added column "${columnName}" to ${tableName}.json`);
    });
  });
});

app.post('/add-row', (req, res) => {
  const { tableName, newRow } = req.body;
  const filePath = path.join(__dirname, `${tableName}.json`);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Read error:', err);
      return res.status(404).send('Table not found');
    }

    let tableData;
    try {
      tableData = JSON.parse(data);
    } catch (parseErr) {
      console.error('JSON parse error:', parseErr);
      return res.status(500).send('Invalid JSON structure');
    }

    if (!Array.isArray(tableData)) {
      return res.status(500).send('Table is not a valid list');
    }

    tableData.push(newRow);

    fs.writeFile(filePath, JSON.stringify(tableData, null, 2), err => {
      if (err) {
        console.error('Write error:', err);
        return res.status(500).send('Failed to add row');
      }

      res.send(`Row added to ${tableName}.json`);
    });
  });
});

app.delete('/delete-table', (req, res) => {
  const { tableName } = req.body; // Expecting JSON body with "tableName"
  const filePath = path.join(__dirname, `${tableName}.json`);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Delete failed:', err);
      return res.status(404).send(`File "${tableName}.json" not found or couldn't be deleted`);
    }
    res.send(`File "${tableName}.json" deleted successfully`);
  });
});

app.post('/update-ths', (req, res) => {
    const newThs = req.body.ths;
    const thsPath = path.join(__dirname, 'ths.json'); // adjust path

    fs.writeFileSync(thsPath, JSON.stringify(newThs, null, 2), 'utf-8');
    res.send('ths.json updated successfully');
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));