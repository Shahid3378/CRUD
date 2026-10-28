const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath, mimetype) => {
    if (!localFilePath) return null;

    try {
        let resourceType = "raw";

        if (mimetype?.startsWith("image/")) {
            resourceType = "image";
        } else if (mimetype?.startsWith("video/")) {
            resourceType = "video";
        }

        // console.log("Uploading with resource type:", resourceType);
        // console.log("Local file path:", localFilePath);

        const result = await cloudinary.uploader.upload(
            localFilePath,
            {
                resource_type: resourceType,
            }
        );

        const mediaURL = {
            url: result.secure_url,
            public: result.public_id,
            resource_type: result.resource_type,
            format: result.format,
        };

        console.log("Cloudinary upload successful:", mediaURL);

        return mediaURL;
    } catch (error) {
        console.error("Cloudinary upload failed:", error.message);
        console.dir(error, { depth: 5 });
        throw error;
    } finally {
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
    }
};

module.exports = { cloudinary, uploadOnCloudinary };