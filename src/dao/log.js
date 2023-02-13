import { set } from 'lodash'
import { Op } from 'sequelize'
import { LogModel } from '@/model/log'

class LogDao {
  static async getAllLogs(v) {
    const page = v.get('query.page')
    const count1 = v.get('query.count')
    const condition = {
      offset: page * count1,
      limit: count1,
    }
    const { count, rows } = await LogModel.findAndCountAll({
      ...condition,
      order: [['create_date', 'DESC']],
    })

    return {
      total: count,
      rows,
    }
  }

  static async searchLogs(v) {
    // method path status_code
    const keyword = v.get('query.keyword', false, '')
    const condition = {}
    v.get('query.start')
      && v.get('query.end')
      && set(condition, 'create_date', {
        [Op.between]: [v.get('query.start'), v.get('query.end')],
      })

    const { count, rows } = await LogModel.findAndCountAll({
      where: Object.assign({}, condition, {
        message: {
          [Op.like]: `%${keyword}%`,
        },
      }),
      order: [['create_date', 'DESC']],
    })
    return {
      total: count,
      rows,
    }
  }
}
export default LogDao
