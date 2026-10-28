const multer = require("multer");

const fileFilter = (req, file, cb) => {
    const allowed = {
        image: ["image/png", "image/jpeg", "image/jpg"],
        video: ["video/mp4", "video/webm"],
        document: ["text/csv"]
    };

    const allowedTypes = allowed[file.fieldname];

    if (!allowedTypes) {
        return cb(
            new Error(`Field ${file.fieldname} is not allowed`)
        );
    }

    if (!allowedTypes.includes(file.mimetype)) {
        return cb(
            new Error(`File ${file.originalname} is not allowed`)
        );
    }

    cb(null, true);
};

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB
    }
});

module.exports = { upload };