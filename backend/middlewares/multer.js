import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
      storage,
      limits: {
            fileSize: 5 * 1024 * 1024, // 5MB limit
      },
      fileFilter: (req, file, cb) => {
            // Accept images for profile photos (both student and recruiter)
            if (file.fieldname === 'profilePhoto') {
                  if (file.mimetype.startsWith('image/')) {
                        cb(null, true);
                  } else {
                        cb(new Error('Only image files are allowed for profile photos'));
                  }
            }
            // Accept PDFs for resumes
            else if (file.fieldname === 'file') {
                  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
                        cb(null, true);
                  } else {
                        cb(new Error('Only image or PDF files are allowed'));
                  }
            }
            // Accept company logo for recruiters
            else if (file.fieldname === 'companyLogo') {
                  if (file.mimetype.startsWith('image/')) {
                        cb(null, true);
                  } else {
                        cb(new Error('Only image files are allowed for company logo'));
                  }
            }
            else {
                  cb(new Error('Unexpected field'));
            }
      }
});
