const cloudinary = require("../config/cloudinary");

exports.uploadImage = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `devconnect/${folder}`,
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );

    uploadStream.end(buffer);
  });
};

exports.deleteImage = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary deletion error:", error);
  }
};
