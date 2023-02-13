module.exports = {
  debug: true,
  apiDir: '/src/api',
  staticDir: '/src/static',
  logger: {
    level: 'INFO',
    dir: 'src/logs',
    limit: 1024 * 1024 * 5,
    requestLog: true,
    file: false,
  },
}
