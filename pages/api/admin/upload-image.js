import fs from 'fs';
import path from 'path';
import formidable from 'formidable';
import { requireAdmin } from '../../../lib/_auth';
import { error, apiLog } from '../../../utils/logger';

export const config = {
  api: {
    bodyParser: false,
  },
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

function isValidImageFile(file) {
  const ext = path.extname(file.originalFilename || file.name || '').toLowerCase();
  const mimeType = file.mimetype || '';
  
  return (
    ALLOWED_EXTENSIONS.includes(ext) &&
    ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase())
  );
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check content type
  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('multipart/form-data')) {
    apiLog('/api/admin/upload-image', 'Invalid content type', { level: 'error', contentType });
    return res.status(400).json({ error: 'Request must be multipart/form-data' });
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');

  try {
    await fs.promises.mkdir(uploadDir, { recursive: true });
  } catch (dirError) {
    apiLog('/api/admin/upload-image', 'Error creating upload directory', { level: 'error', error: dirError.message });
    return res.status(500).json({ error: 'Failed to create upload directory' });
  }

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: MAX_FILE_SIZE,
    multiples: true,
    allowEmptyFiles: false,
  });

  return new Promise((resolve) => {
    form.parse(req, async (err, _fields, files) => {
      if (err) {
        apiLog('/api/admin/upload-image', 'Error parsing upload', { 
          level: 'error', 
          error: err.message,
          code: err.code 
        });
        
        if (err.code === 'LIMIT_FILE_SIZE') {
          res.status(400).json({ error: 'File size exceeds 5MB limit' });
        } else if (err.message && err.message.includes('File type')) {
          res.status(400).json({ error: 'Invalid file type. Only JPG and PNG files are allowed.' });
        } else {
          res.status(400).json({ 
            error: 'Failed to parse upload',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
          });
        }
        return resolve();
      }

      try {
        // Handle both single and multiple file uploads
        let fileArray = [];
        
        if (files.image) {
          fileArray = Array.isArray(files.image) ? files.image : [files.image];
        } else if (files.file) {
          fileArray = Array.isArray(files.file) ? files.file : [files.file];
        } else {
          // Check if there are any files in the files object
          const fileKeys = Object.keys(files);
          if (fileKeys.length > 0) {
            const firstKey = fileKeys[0];
            const firstFile = files[firstKey];
            fileArray = Array.isArray(firstFile) ? firstFile : [firstFile];
          }
        }

        if (fileArray.length === 0) {
          res.status(400).json({ error: 'No image file provided' });
          return resolve();
        }

        const uploadedFiles = [];
        const errors = [];

        for (const uploaded of fileArray) {
          // Skip if file doesn't exist (might have been filtered out)
          if (!uploaded || !uploaded.filepath) {
            continue;
          }

          // Validate file type
          if (!isValidImageFile(uploaded)) {
            errors.push(`File "${uploaded.originalFilename || 'unknown'}" is not a valid image. Only JPG and PNG files are allowed.`);
            // Clean up invalid file
            try {
              if (uploaded.filepath) {
                await fs.promises.unlink(uploaded.filepath);
              }
            } catch {}
            continue;
          }

          // Validate file size (double check)
          try {
            const stats = await fs.promises.stat(uploaded.filepath);
            if (stats.size > MAX_FILE_SIZE) {
              errors.push(`File "${uploaded.originalFilename || 'unknown'}" exceeds 5MB size limit.`);
              // Clean up the file
              try {
                await fs.promises.unlink(uploaded.filepath);
              } catch {}
              continue;
            }

            const filename = path.basename(uploaded.filepath);
            const url = `/uploads/products/${filename}`;
            uploadedFiles.push(url);
          } catch (statError) {
            apiLog('/api/admin/upload-image', 'Error checking file stats', { level: 'error', error: statError.message });
            errors.push(`File "${uploaded.originalFilename || 'unknown'}" could not be processed.`);
            continue;
          }
        }

        if (errors.length > 0 && uploadedFiles.length === 0) {
          res.status(400).json({ error: errors.join(' ') });
          return resolve();
        }

        // Return single URL for backward compatibility, or array of URLs for multiple files
        if (fileArray.length === 1 && uploadedFiles.length === 1) {
          res.status(200).json({ url: uploadedFiles[0] });
        } else {
          res.status(200).json({ 
            urls: uploadedFiles,
            ...(errors.length > 0 && { warnings: errors })
          });
        }
      } catch (processError) {
        apiLog('/api/admin/upload-image', 'Error processing files', { level: 'error', error: processError.message });
        res.status(500).json({ error: 'Error processing uploaded files' });
      }
      
      return resolve();
    });
  });
}

export default requireAdmin(handler);


