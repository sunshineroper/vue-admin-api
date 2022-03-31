import { Model, DataTypes } from 'sequelize'
import { merge } from 'lodash'
import { sequelize } from '../lib'
import { InforCrudMixin } from '../util/inforCrudMixin'
import { get, has, set } from 'lodash'
class Group extends Model {
  toJSON() {
    const origin = { id: this.id, name: this.name, info: this.info }
    if (has(this, 'menu_permission')) {
      set(origin, 'menu_permission', get(this, 'menu_permission'), [])
    }
    if (has(this, 'permission')) {
      set(origin, 'permission', get(this, 'permission'), [])
    }
    return origin
  }
}

Group.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING({ length: 60 }),
      allowNull: false,
      comment: '分组名称，例如：搬砖者'
    },
    info: {
      type: DataTypes.STRING({ length: 255 }),
      allowNull: true
    },
    level: {
      type: DataTypes.INTEGER(2),
      defaultValue: 3,
      comment: '分组级别 1：root 2：guest 3：user（root、guest分组只能存在一个)'
    }
  },
  merge(
    {
      sequelize,
      tableName: 'group',
      modelName: 'group'
    },
    InforCrudMixin.options
  )
)

export { Group as GroupModel }
