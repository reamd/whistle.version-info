const axios = require('axios');

const formatObject = (str) => {
  const itemList = str.match(/.+/g);
  const map = {};
  itemList.forEach(item => {
    const iArr = item.trim().split(' ');
    map[iArr[0]] = iArr[1];
  })
  return map;
};
module.exports = (server, opt) => {
  // options 同上，initial.js的options是同一个对象
  const { storage, config } = opt;
  server.on('request', (req, res) => {
    const oReq = req.originalReq;
    const rHeaderHost = oReq.headers['replace-host'];
    if (rHeaderHost) {
      const hostName = (rHeaderHost === 'remote'? storage.getProperty('hostName') : rHeaderHost);
      const envMap = storage.getProperty('envMap');
      axios.get(`${hostName}${oReq.relativeUrl}`)
      .then(function (response) {
        const envMapObj = formatObject(envMap);
        const { data } = response;
        res.end(`${oReq.url} resBody://(${JSON.stringify(Object.assign(
          { 
            envMap: envMapObj,
            serverIp: oReq.ruleValue || '',
            whistlePort: config.port,
          },
          data
        ))})`);
      })
      .catch(function (error) {
        res.end(`${oReq.url} resScript://lib/tpl/index.js`);
      });
    } else {
      res.end(`${oReq.url} resScript://lib/tpl/index.js`);
    }
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

/* req.clientIp: 请求的客户端IP，注意：挂在req里面
oReq.id: 请求的ID，每个请求对应一个唯一的ID
oReq.headers: 请求的原始headers，而req.headers包含了一些插件自定义字段
oReq.ruleValue: 配置的规则值， 如：whistle.xxx://ruleValue
oReq.url: 请求的完整url
oReq.realUrl: 请求的真实url，一般为空
oReq.method: 请求方法
oReq.clientPort: 请求的客户端端口
oReq.globalValue: pattern @globalValue
oReq.proxyValue: 配置的代理规则，一般为空
oReq.pacValue: 配置的pac规则，一般为空

oRes.serverIp: 服务端IP，只有在server或resServer、resStatsServer才能获取到
oRes.statusCode: 响应状态码，同 oRes.serverIp */