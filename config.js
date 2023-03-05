const config = {
  port: 1200, // Server port
  baseURL: "http://localhost:1200", // Base url
  securityLevel: 0, // Security levels | Level 0: Security system is disabled | Level 1: Trusted domains are allowed to access | Level 2: Domain must be trusted domain and have access key
  trustedDomains: ["https://vsldev.tk"], // Trusted domain list level
  authKey: "vsldev", // Access key for uploading
  uploadOnly: ["all"], // You can use 'video/' and 'audio/' for other types of files or type ['all'] for all type of files .exe, .txt and more
  convertImagesTo: "webp", // You can change the type of the image with this and make them all the same. You can set the format you want, such as jpg, jpeg or png, if you do not want the format of the file to change, just type 'default'
  uploadLimit: 999, // File limit
  sizeLimit: 104857600, // Max file size limit for uploading ( Default: 100mb )
  logs: false,
  panel: {
    panelEnabled: true, // Enable disable admin panel
    username: "admin", // Admin panel username
    password: "admin", // Admin panel password
  },
};

module.exports = config;
