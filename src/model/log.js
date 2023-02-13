import { DataTypes, Model } from 'sequelize'
import { merge } from 'lodash'
import { sequelize } from '../lib'
import { InforCrudMixin } from '../util/inforCrudMixin'
class Log extends Model {
  static createLog(args, commit) {
    const log = Log.build(args)
    commit && log.save()
    return log
  }
}

Log.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    message: {
      type: DataTypes.STRING({ length: 450 }),
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING(20),
    },
    status_code: {
      type: DataTypes.INTEGER,
    },
    method: {
      type: DataTypes.STRING(20),
    },
    path: {
      type: DataTypes.STRING(50),
    },
    permission: {
      type: DataTypes.STRING(100),
    },
  },
  merge(
    {
      sequelize,
      tableName: 'log',
      modelName: 'log',
    },
    InforCrudMixin.options,
  ),
)

export { Log as LogModel }
