const config = {
  port: 1200, // Server port
  uploadOnly: ["image/"], // You can use 'video/' and 'audio/' for other types of files or type ['all'] for all type of files .exe, .txt and more
  convertImagesTo: "webp", // You can change the type of the image with this and make them all the same. You can set the format you want, such as jpg, jpeg or png, if you do not want the format of the file to change, just type 'default'
  uploadLimit: 999, // File limit
};

module.exports = config;
