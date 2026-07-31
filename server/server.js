require("dotenv").config();

const dns = require("dns");

// Force Google DNS
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const http = require("http");
const app = require("./app");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});