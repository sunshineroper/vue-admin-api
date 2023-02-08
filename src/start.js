const { readFile, config, logger } = require('koa-cms-lib')

const loadConfig = () => {
  const dir = `${process.cwd()}/src/config/development`
  const files = readFile(dir)

  for (const file of files) {
    const mod = require(file)
    const keys = Object.keys(mod)
    for (const key of keys)
      config.setItem(key, mod[key])
  }
}

const run = async () => {
  loadConfig()
  const { createApp } = require('./app')
  const app = await createApp()
  const port = config.getItem('port', 4000)
  app.listen(port, () => {
    logger.info(`this a app listen port ${port}`)
  })
}
run()
