export default {
  debug: true,
  apiDir: 'src/router',
  staticDir: 'src/static',
  log: {
    level: 'INFO',
    dir: 'src/logs',
    sizeLimit: 1024 * 1024 * 5,
    requestLog: true,
    file: false
  }
}
