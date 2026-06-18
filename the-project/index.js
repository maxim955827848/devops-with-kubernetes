// Exercise 1.3 "The project"
// A minimal web server that logs the port it started on. No real functionality yet;
// later parts of the course grow this into the todo application.
const http = require('http');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('The project is up and running.\n');
});

server.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`);
});
