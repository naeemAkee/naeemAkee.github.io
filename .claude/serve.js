const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const port = 4321;
const types = {
	'.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
	'.json': 'application/json', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg', '.png': 'image/png', '.pdf': 'application/pdf'
};

http.createServer((req, res) => {
	let urlPath = decodeURIComponent(req.url.split('?')[0]);
	if (urlPath === '/') urlPath = '/index.html';
	const filePath = path.join(root, urlPath);
	if (!filePath.startsWith(root)) { res.writeHead(403); return res.end('Forbidden'); }
	fs.readFile(filePath, (err, data) => {
		if (err) { res.writeHead(404); return res.end('Not found'); }
		res.writeHead(200, { 'Content-Type': types[path.extname(filePath)] || 'application/octet-stream' });
		res.end(data);
	});
}).listen(port, () => console.log(`Serving on http://localhost:${port}`));
