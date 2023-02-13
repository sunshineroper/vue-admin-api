const { readFile } = require('koa-cms-lib/utils')
const { config } = require('koa-cms-lib/config')
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
  const { logger } = require('koa-cms-lib/logger')
  app.listen(port, () => {
    logger.info(`this a app listen port ${port}`)
  })
}
run()
