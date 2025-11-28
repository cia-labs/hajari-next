import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuid } from "uuid";

// R2 client configuration
const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export interface UploadResult {
  success: boolean;
  fileUrl?: string;
  error?: string;
}

/**
 * Upload a file to R2 bucket
 * @param file - The file to upload
 * @param folder - Optional folder prefix (e.g., 'attendance-exceptions')
 * @returns Promise with upload result
 */
export async function uploadToR2(
  file: File, 
  folder: string = "attendance-exceptions"
): Promise<UploadResult> {
  try {
    if (!file || file.size === 0) {
      return { success: false, error: "No file provided" };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; 
    if (file.size > maxSize) {
      return { success: false, error: "File size exceeds 5MB limit" };
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: "File type not allowed. Only JPG, PNG, and PDF files are supported" };
    }

    // Generate unique filename
    const ext = file.name.split(".").pop() || "bin";
    const fileName = `${uuid()}.${ext}`;
    const key = folder ? `${folder}/${fileName}` : fileName;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      ContentLength: file.size,
    });

    await r2Client.send(command);

    // Generate public URL
    const fileUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

    return {
      success: true,
      fileUrl,
    };
  } catch (error) {
    console.error("R2 upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

/**
 * Delete a file from R2 bucket
 * @param fileUrl - The public URL of the file to delete
 * @returns Promise<boolean> - Success status
 */
export async function deleteFromR2(fileUrl: string): Promise<boolean> {
  try {
    const publicUrl = process.env.R2_PUBLIC_URL;
    if (!fileUrl || !publicUrl || !fileUrl.includes(publicUrl)) {
      return false;
    }

    // Extract key from URL
    const key = fileUrl.replace(`${process.env.R2_PUBLIC_URL}/`, "");

    const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    });

    await r2Client.send(command);
    return true;
  } catch (error) {
    console.error("R2 delete error:", error);
    return false;
  }
}