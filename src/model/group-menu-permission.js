import { sequelize } from '../lib'
import { Model, DataTypes } from 'sequelize'

class GroupMenuPermission extends Model {}

GroupMenuPermission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    group_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '分组id'
    },
    menu_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '菜单id'
    }
  },
  {
    sequelize,
    timestamps: false,
    tableName: 'menu_permission',
    modelName: 'menu_permission'
  }
)
export { GroupMenuPermission as GroupMenuPermissionModel }
