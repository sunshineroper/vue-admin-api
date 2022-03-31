import { sequelize } from '../lib'
import { Model, Sequelize } from 'sequelize'

class GroupPermission extends Model {}

GroupPermission.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    group_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment: '分组id'
    },
    permission_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment: '权限id'
    }
  },
  {
    sequelize,
    timestamps: false,
    tableName: 'group_permission',
    modelName: 'group_permission',
    indexes: [
      {
        name: 'group_id_permission_id',
        using: 'BTREE',
        fields: ['group_id', 'permission_id']
      }
    ]
  }
)

export { GroupPermission as GroupPermissionModel }
