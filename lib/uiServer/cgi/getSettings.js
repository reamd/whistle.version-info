module.exports = (ctx) => {
  const { localStorage } = ctx.req;
  ctx.body = {
    hostName: localStorage.getProperty('hostName'),
    envMap: localStorage.getProperty('envMap'),
  };
};
