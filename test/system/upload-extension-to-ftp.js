// Send extension to the webdriver server
// This script assumes it's running in a container linked to the selenium-chrome-ftp container

var FtpDeploy = require('ftp-deploy');
var ftpDeploy = new FtpDeploy();

var config = {
  username: "anonymous",
  password: "ignored",
  host: process.env.SELENIUM_CHROME_FTP_PORT_21_TCP_ADDR,
  port: process.env.SELENIUM_CHROME_FTP_PORT_21_TCP_PORT,
  localRoot: __dirname + "/../../dist",
  remoteRoot: "/uploaded",
  exclude: ['.git', '.idea', 'tmp/*']
};

ftpDeploy.on('uploading', function(data) {
  console.log("Uploading: ", JSON.stringify(data));
});

ftpDeploy.on('uploaded', function(data) {
  console.log("Upload completed: ", JSON.stringify(data));
});

ftpDeploy.on('upload-error', function (data) {
  console.log("Upload error: ", data.err);
});

ftpDeploy.deploy(config, function(err) {
  if (err) console.log(err)
  else console.log('Upload completed');
});