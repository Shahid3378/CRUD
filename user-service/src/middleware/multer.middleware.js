const multer = require("multer");

const fileFilter = (res, file, cb) => {

    const allowed = {
        image : [ "image/png", "image/jpeg", "image/jpg" ],
        video : [ "video/mp4", "video/webm" ],
        document : [ "application/pdf", "application/msword", "text/csv", "text/xlsx" ]
    }

    const allowedTypes = allowed[file.fieldname]

    console.log("FIELD NAME:", file.fieldname);
    console.log("MIME TYPE:", file.mimetype);

    if(!allowedTypes){
        return cb( new Error (`Field${file.fieldname} is not allowed`))
    }

    if(!allowedTypes.includes(file.mimetype)){
        return cb( new Error(`File ${file.originalname} is not allowed`), false)
    }

    return cb(null, true)

}

const storage = multer.diskStorage({
    destination:function (req, file, cb){
        cb(null, "./public/upload")
    },
    filename: function(req, file, cb){
        cb(null, file.originalname)
    },
    limits:{
        fileSize: 10 * 1024 * 1024
    }
})

module.exports.upload = multer({ storage, fileFilter })
