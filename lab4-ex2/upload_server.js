const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 5001;

app.use(cors());

const UPLOAD_DIR = path.join(__dirname, 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.use('/uploads', express.static(UPLOAD_DIR));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        const error = new Error('Only image files are accepted (JPG, PNG, WEBP)!');
        error.status = 400;
        cb(error, false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: fileFilter
});

app.post('/api/v1/upload-avatar', upload.single('avatar'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Please choose an image file!' });
    }
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({
        success: true,
        message: 'Image uploaded successfully',
        fileInfo: {
            filename: req.file.filename,
            size: req.file.size,
            mimetype: req.file.mimetype,
            url: fileUrl
        }
    });
});

app.get('/api/v1/files', (req, res) => {
    fs.readdir(UPLOAD_DIR, (err, files) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Could not read uploads directory' });
        }
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const fileList = files
            .map(filename => {
                const filePath = path.join(UPLOAD_DIR, filename);
                const stats = fs.statSync(filePath);
                if (!stats.isFile()) return null;
                return {
                    filename: filename,
                    size: stats.size,
                    url: `${baseUrl}/uploads/${filename}`,
                    downloadUrl: `${baseUrl}/api/v1/download/${filename}`
                };
            })
            .filter(Boolean);

        res.json({
            success: true,
            count: fileList.length,
            data: fileList
        });
    });
});

app.get('/api/v1/download/:filename', (req, res) => {
    const safeFilename = path.basename(req.params.filename);
    const filePath = path.join(UPLOAD_DIR, safeFilename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: 'File not found' });
    }

    res.download(filePath);
});

app.delete('/api/v1/files/:filename', (req, res) => {
    const safeFilename = path.basename(req.params.filename);
    const filePath = path.join(UPLOAD_DIR, safeFilename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: 'File not found' });
    }

    fs.unlink(filePath, (err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Could not delete file' });
        }
        res.json({ success: true, message: `Deleted ${safeFilename}` });
    });
});

app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        const message = err.code === 'LIMIT_FILE_SIZE'
            ? 'The file is too large (max 2 MB)!'
            : err.message;
        return res.status(400).json({ success: false, message });
    }
    res.status(err.status || 500).json({ success: false, message: err.message });
});

app.listen(PORT, () => console.log(`Upload server running on port ${PORT}`));