const application = require('./dist');
const path = require('path');
const fs = require('fs');

module.exports = application;

if (require.main === module) {
  // Run the application
  const config = {
    rest: {
      port: +(process.env.PORT || 3000),
      host: process.env.HOST,
      key: fs.readFileSync(path.join(__dirname, './key.pem')),
      cert: fs.readFileSync(path.join(__dirname, './cert.pem')),
      protocol: 'https',
      gracePeriodForClose: 5000, // 5 seconds
      openApiSpec: {
        // useful when used with OpenAPI-to-GraphQL to locate your application
        setServersFromRequest: true,
      },
      // Use the LB4 application as a route. It should not be listening.
      listenOnStart: false,
    },
  };
  application.main(config).catch((err) => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
