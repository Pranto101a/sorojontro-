/* eslint-disable no-console */
const http = require("http");
const path = require("path");
const express = require("express");
const { ExpressPeerServer } = require("peer");

const PORT = Number(process.env.PORT || 3000);

const app = express();

// Serve the web game (index.html + images + PWA assets)
app.use(
  express.static(path.join(__dirname), {
    index: "index.html",
    // basic hardening: don't serve dotfiles
    dotfiles: "ignore",
  })
);

const server = http.createServer(app);

// PeerJS signaling server (used by Online Host/Join mode)
const peerServer = ExpressPeerServer(server, {
  path: "/",
  proxied: true, // important for Render/Reverse proxy (HTTPS termination)
});
app.use("/peerjs", peerServer);

peerServer.on("connection", (client) => {
  console.log("[peer] connected:", client.getId());
});
peerServer.on("disconnect", (client) => {
  console.log("[peer] disconnected:", client.getId());
});

server.listen(PORT, () => {
  console.log(`Shorojontro server running on :${PORT}`);
});

