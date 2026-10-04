import { v2 as cloudinary, UploadApiOptions, UploadApiResponse } from "cloudinary";
import { Readable } from "stream";

if (!process.env.CLOUDINARY_CLOUD_NAME) {
  console.error("⚠️ CLOUDINARY_CLOUD_NAME is missing in environment variables!");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Extracts the public ID from a Cloudinary URL
 */
export const extractPublicId = (url: string): string | null => {
  if (!url || !url.includes("cloudinary.com")) return null;
  
  try {
    const parts = url.split("/");
    const uploadIndex = parts.findIndex(p => p === "upload");
    
    if (uploadIndex === -1) return null;
    
    // The public ID includes the folder path and the filename (without extension usually, but Cloudinary handles it)
    // Example: .../upload/v1234567890/lms/pdfs/courses/xyz.pdf -> lms/pdfs/courses/xyz.pdf
    let publicIdWithExt = parts.slice(uploadIndex + 2).join("/"); // skip "upload" and "v..."
    
    // Remove the file extension if present (though Cloudinary destroy works with raw files by keeping the extension if resource_type is raw)
    const lastDotIndex = publicIdWithExt.lastIndexOf(".");
    if (lastDotIndex !== -1) {
      publicIdWithExt = publicIdWithExt.substring(0, lastDotIndex);
    }
    
    return publicIdWithExt;
  } catch (error) {
    console.error("Error extracting public ID from URL", error);
    return null;
  }
};

/**
 * Uploads a file buffer to Cloudinary
 */
export const uploadMedia = async (
  fileBuffer: Buffer,
  folder: string,
  resourceType: "image" | "video" | "raw" | "auto" = "auto",
  originalName?: string
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const options: UploadApiOptions = {
      folder: folder,
      resource_type: resourceType,
    };
    
    // For raw files like PDFs, preserving the name helps
    if (resourceType === "raw" && originalName) {
      options.public_id = originalName;
      options.use_filename = true;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error || !result) {
          console.error("Cloudinary upload error:", error);
          return reject(error || new Error("Failed to upload to Cloudinary"));
        }
        resolve(result);
      }
    );
    
    const readable = new Readable();
    readable.push(fileBuffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

/**
 * Deletes media from Cloudinary
 */
export const deleteMedia = async (urlOrPublicId: string, resourceType: "image" | "video" | "raw" = "image"): Promise<any> => {
  let publicId = urlOrPublicId;
  
  if (urlOrPublicId.includes("http")) {
    const extracted = extractPublicId(urlOrPublicId);
    if (!extracted) return null;
    publicId = extracted;
  }
  
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(
      publicId,
      { resource_type: resourceType },
      (error, result) => {
        if (error) {
          console.error("Cloudinary deletion error:", error);
          return reject(error);
        }
        resolve(result);
      }
    );
  });
};
