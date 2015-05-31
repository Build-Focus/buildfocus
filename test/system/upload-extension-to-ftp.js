// Send extension to the webdriver server
var FtpDeploy = require('ftp-deploy');
var ftpDeploy = new FtpDeploy();

var config = {
  username: "anonymous",
  password: "ignored",
  host: "localhost",
  port: 32805,
  localRoot: __dirname + "/../../dist",
  remoteRoot: "/uploaded",
  exclude: ['.git', '.idea', 'tmp/*']
};

ftpDeploy.deploy(config, function(err) {
  if (err) console.log(err)
  else console.log('Upload completed');
});