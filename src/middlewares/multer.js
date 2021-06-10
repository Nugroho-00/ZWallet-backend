const multer = require("multer");
const path = require("path");
const responseStandard = require("../helpers/response");

const userStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images/users");
  },
  filename: (req, file, cb) => {
    const nameFormat = `usersProfile-${Date.now()}${path.extname(
      file.originalname
    )}`;
    cb(null, nameFormat);
  },
});

const bytes = 1000;
const power = (byte, n) => {
  if (n) return byte * power(byte, n - 1);
  return 1;
};
const limits = {
  fileSize: 2 * power(bytes, 2),
};

const fileFilter = (req, file, cb) => {
  const acceptedFileType = /jpg|jpeg|gif|png/;
  const isFileTypeAccepted = acceptedFileType.test(
    path.extname(file.originalname)
  );
  if (!isFileTypeAccepted) return cb(new Error("Error: Image only"));
  cb(null, true);
};

const uploadAvatarImage = multer({
  storage: userStorage,
  limits,
  fileFilter,
});

const errorMulterHandler = (uploadFunction) => {
  return (req, res, next) => {
    uploadFunction(req, res, function (err) {
      console.log(err);
      if (err) return responseStandard(res, err, {}, 500, false);
      next();
    });
  };
};

module.exports = {
  errorMulterHandler,
  uploadAvatarImage,
};
