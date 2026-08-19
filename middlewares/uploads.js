const multer = require('multer');
const { storage } = require("../cloudconfig.js");
const upload = multer({ storage });



module.exports = upload;
