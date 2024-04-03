const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const cron = require('node-cron');
const { log } = require('console');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

const resultsPath = path.join(__dirname, 'results.json');
if (!fs.existsSync(resultsPath)) {
    console.log('results.json not found. Creating a placeholder.');
    fs.writeFileSync(resultsPath, JSON.stringify([], null, 2), 'utf8');
}

app.get('/results', (req, res) => {
    fs.readFile(resultsPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading results.json:', err);
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).send({ error: "Results currently unavailable." });
        }
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    });
});

app.get('/newpage', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'newpage.html'));
});

io.on('connection', (socket) => {
    console.log('New client connected');
    socket.on('disconnect', () => console.log('Client disconnected'));
});

function notifyClientsOfNewResults() {
    io.emit('update');
    console.log('Notified clients of new results.');
}

fs.watch(resultsPath, (eventType, filename) => {
    if (eventType === 'change') {
        notifyClientsOfNewResults();
    }
});

let hasScraperRunAtLeastOnce = false;

function isWithinScheduledTimes() {
    const currentTime = new Date();
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const time = hours * 100 + minutes;

    const timeRanges = [
        { start: 1000, end: 1100 },
        { start: 1300, end: 1400 },
        { start: 1600, end: 1700 },
        { start: 1800, end: 1900 }
    ];

    return timeRanges.some(range => time >= range.start && time <= range.end);
}

function determineScriptToRun() {
    const currentTime = new Date();
    const formattedTime = currentTime.getHours() * 100 + currentTime.getMinutes();
    return formattedTime < 1500 ? 'node scraper1.js' : 'node scraper.js';
}

function executeScript(scriptToRun) {
    console.log(`Executing ${scriptToRun}`);
    exec(scriptToRun, (error, stdout, stderr) => {
        if (error) {
            console.error(`Execution error: ${error}`);
            return;
        }
        console.log(`Execution result: ${stdout}`);
        if (stderr) {
            console.error(`Execution stderr: ${stderr}`);
        }
        notifyClientsOfNewResults();
        hasScraperRunAtLeastOnce = true;
    });
}

// Execute the script once at server start, regardless of the time
executeScript(determineScriptToRun());

cron.schedule('*/30 * * * * *', function () {
    console.log("hasScraperRunAtLeastOnce",hasScraperRunAtLeastOnce);
    if (!isWithinScheduledTimes()) {
        console.log('Not within the scheduled time windows and scraper has run at least once. Skipping execution.');
        return;
    }
    console.log('Running scraper based on schedule or initial execution requirement.');
    executeScript(determineScriptToRun());
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
