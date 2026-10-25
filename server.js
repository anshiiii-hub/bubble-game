const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5050;
const SCORES_FILE = path.join(__dirname, 'scores.json');

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ttf': 'font/ttf',
    '.ico': 'image/x-icon'
};

function loadScores() {
    try {
        if (fs.existsSync(SCORES_FILE)) {
            return JSON.parse(fs.readFileSync(SCORES_FILE, 'utf8'));
        }
    } catch (e) {}
    return { arcade: 0, survival: 0, zen: 0, leaderboard: [] };
}

function saveScores(scores) {
    try {
        fs.writeFileSync(SCORES_FILE, JSON.stringify(scores, null, 2));
    } catch (e) {
        console.error('Error saving scores:', e);
    }
}

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let pathname = decodeURIComponent(url.pathname);

    // API Routes
    if (pathname === '/api/scores') {
        if (req.method === 'GET') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify(loadScores()));
        }
        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                try {
                    const data = JSON.parse(body || '{}');
                    const mode = data.mode || 'arcade';
                    const score = parseInt(data.score || 0, 10);
                    const player = data.player || 'Player 1';

                    const scores = loadScores();
                    if (score > (scores[mode] || 0)) {
                        scores[mode] = score;
                    }
                    if (!scores.leaderboard) scores.leaderboard = [];
                    scores.leaderboard.push({ player, score, mode });
                    scores.leaderboard.sort((a, b) => b.score - a.score);
                    scores.leaderboard = scores.leaderboard.slice(0, 20);

                    saveScores(scores);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ success: true, scores }));
                } catch (err) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'Invalid JSON' }));
                }
            });
            return;
        }
    }

    // Static File Serving
    if (pathname === '/') pathname = '/index.html';
    const filePath = path.join(__dirname, pathname);

    // Prevent directory traversal
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        return res.end('Forbidden');
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            return res.end('File Not Found');
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, {
            'Content-Type': contentType,
            'Content-Length': stats.size,
            'Cache-Control': 'no-cache'
        });

        fs.createReadStream(filePath).pipe(res);
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n✨ Bubble Pop Server running at http://0.0.0.0:${PORT}`);
    console.log(`👉 Ready for connections on Render!\n`);
});
