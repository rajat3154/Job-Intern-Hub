import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
      storage,
      limits: {
            fileSize: 5 * 1024 * 1024, // 5MB limit
      },
      fileFilter: (req, file, cb) => {
            // Accept images for profile photos
            if (file.fieldname === 'profilePhoto') {
                  if (file.mimetype.startsWith('image/')) {
                        cb(null, true);
                  } else {
                        cb(new Error('Only image files are allowed for profile photos'));
                  }
            }
            // Accept PDFs for resumes
            else if (file.fieldname === 'file') {
                  if (file.mimetype === 'application/pdf') {
                        cb(null, true);
                  } else {
                        cb(new Error('Only PDF files are allowed for resumes'));
                  }
            }
            else {
                  cb(new Error('Unexpected field'));
            }
      }
});
