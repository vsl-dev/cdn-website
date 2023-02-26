const config = {
  port: 1200,
  uploadOnly: ["image/", "video/"], // You can use 'video/' and 'audio/' for other types of files
  convertImagesTo: "default", // You can change the type of the image with this and make them all the same. You can set the format you want, such as jpg, jpeg or png, if you do not want the format of the file to change, just type 'default'
  uploadLimit: 999,
};

module.exports = config;
