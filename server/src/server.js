const express = require("express");
const cors = require("cors");
const expressStaticGzip = require("express-static-gzip");

const app = express();
const PORT = process.env.PORT || 4206;

app.use(cors());
app.use(expressStaticGzip("scans"));
app.listen(PORT, () => {
	console.log(`Server is running on port:${PORT}`);
});
