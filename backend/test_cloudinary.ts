import dotenv from 'dotenv';
dotenv.config();

// Override env for testing
process.env.CLOUDINARY_CLOUD_NAME = "zihn8u4b";
process.env.CLOUDINARY_API_KEY = "911613628366449";
process.env.CLOUDINARY_API_SECRET = "XwVi9xQv33Qsu8I3rqoOWxOOCJg";

import { uploadMedia } from './src/services/cloudinaryService';

async function testUpload() {
  try {
    const buffer = Buffer.from("Hello world, this is a test PDF", "utf-8");
    const result = await uploadMedia(buffer, "test_folder", "raw", "test_file.pdf");
    console.log("Upload success:", result);
  } catch (error) {
    console.error("Upload failed:", error);
  }
}

testUpload();
