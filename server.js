const express = require('express');
const path = require('path');

const app = express();
app.use(express.json({ limit: '100mb' }));
app.use(express.static(__dirname + '/dist/spreadsheet-editor'));

app.get('*', async (req, res) => {
	res.sendFile(path.join(__dirname + '/dist/spreadsheet-editor/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`App listening on ${PORT}`);
});
