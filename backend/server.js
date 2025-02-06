require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const FormData = require('./models/file');


// Mongo URI
const MONGO_URI = "mongodb+srv://admin:admin@cluster0.egsdr.mongodb.net/transactiontestdb";

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Update CORS configuration
const corsOptions = {
  origin: 'https://127.0.0.1:3000',
  methods: "GET, POST, PUT, DELETE, OPTIONS",
  allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept"
};

app.use(cors(corsOptions));

// init gfs
let gfs;

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    // init gfs stream
    gfs = Grid(mongoose.connection.db, mongoose.mongo);
    gfs.collection('uploads'); // collection name
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// multer setup for file upload
const storage = new GridFsStorage({
  url: MONGO_URI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  }
});

const upload = multer({ storage });

app.delete('/file/:filename', async (req, res) => {
  try {
    await gfs.files.deleteOne({ filename: req.params.filename });
    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// @route POST /submit
// @desc  Save form data to DB
app.post("/submit", async (req, res) => {
  console.log("Request Headers:", req.headers); // Log request headers
  console.log("Request Body:", req.body); // Log request body

  const { name, email, amount, type, attempts, fileId } = req.body;
  const newFormData = new FormData({
    name,
    email,
    amount,
    type,
    attempts,
    fileId,
  });

  // @route POST /upload
  // @desc  Uploads file to DB
  app.post("/upload", upload.single("file"), (req, res) => {
    res.json({ file: req.file });
  });

  try {
    const savedFormData = await newFormData.save();
    res.json(savedFormData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/file/:name', async (req, res) => {
  try {
    const file = await gfs.files.findOne({ filename: req.params.name });
    const result = [];

    await gfs.createReadStream(file)
      .pipe()
      .on('data', (chunk) => {
        result.push(chunk);
      })
      .on('end', () => {
        console.log('File fetched successfully');
        res.send(Buffer.concat(result));
      }
      );
  } catch (error) {
    console.error('Error getting file:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/file/:name', async (req, res) => {
  try {
    const file = await gfs.files.findOne({ name: req.params.name });
    console.log('file: ', file);
    const readStream = gfs.createReadStream(file.name);
    readStream.pipe(res);
  } catch (error) {
    console.error('Error getting file:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.post('/file/upload', upload.single('img'), async (req, res) => {
  if (req.file === undefined) {
    return res.status(400).json({ message: 'Please upload a file' });
  }

  const newFile = new fileModel({
    data: req.file.buffer,
    contentType: req.file.mimetype,
  });

  try {
    await newFile.save();
    res.status(201).json({ message: 'File uploaded successfully', file: newFile });
  } catch (error) {
    console.error('Error uploading file:', error);
    console.log("req.file: ", req.file);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// @route GET /file/:filename
// @desc  Download single file
app.get("/file/:filename", (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: "No file exists",
      });
    }

    // Check if file
    if (file.contentType === "application/pdf") {
      // Read output to browser
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({
        err: "Not a PDF",
      });
    }
  });
});

// use env port or default
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});