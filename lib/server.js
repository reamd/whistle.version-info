module.exports = (server, { storage }) => {
  server.on('request', (req, res) => {
    const oReq = req.originalReq;
    const hostName = storage.getProperty('hostName');
    const envMap = storage.getProperty('envMap');
    req.passThrough();
  });
  // handle websocket request
  server.on('upgrade', (req/*, socket*/) => {
    // 修改 websocket 请求用，
    req.passThrough(); // 直接透传
  });

  // handle tunnel request
  server.on('connect', (req/*, socket*/) => {
    // 修改普通 tcp 请求用
    req.passThrough(); // 直接透传
  });
};