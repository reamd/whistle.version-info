const getSettings = require('./getSettings');

module.exports = async (ctx) => {
  let { hostName, envMap } = ctx.request.body;
  if (typeof hostName !== 'string') {
    hostName = '';
  }
  const { localStorage } = ctx.req;
  localStorage.setProperty('hostName', hostName);
  localStorage.setProperty('envMap', typeof envMap === 'string' ? envMap : null);
  getSettings(ctx);
};
