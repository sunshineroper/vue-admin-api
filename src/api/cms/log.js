import { SRouter } from '../../lib'
import { groupRequired } from '../../middleware'
import { LogFindValidator } from '../../validator/log'
import LogDao from '../../dao/log'

const logRouter = new SRouter({
  prefix: '/cms/log',
  module: '日志',
})

logRouter.get('getAllLog', '/', groupRequired, async (ctx) => {
  const v = await new LogFindValidator().validate(ctx)
  const { rows, total } = await LogDao.getAllLogs(v)
  ctx.json({
    rows,
    total,
    page: v.get('query.page'),
    count: v.get('query.count'),
  })
})

logRouter.get('searhLog', '/search', groupRequired, async (ctx) => {
  const v = await new LogFindValidator().validate(ctx)
  const { rows, total } = await LogDao.searchLogs(v)
  ctx.json({
    rows,
    total,
    page: v.get('query.page'),
    count: v.get('query.count'),
  })
})

export default logRouter
