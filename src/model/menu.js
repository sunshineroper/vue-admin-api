import { Model, Sequelize } from 'sequelize'
import { sequelize } from '../lib'
class Menu extends Model {}
Menu.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      comment: 'component name'
    },
    parent_id: {
      type: Sequelize.INTEGER,
      comment: '父级菜单id'
    },
    icon: {
      type: Sequelize.STRING,
      comment: '菜单图标'
    },
    path: {
      type: Sequelize.STRING,
      allowNull: false,
      comment: '访问路径'
    },
    keep_alive: {
      type: Sequelize.INTEGER,
      comment: '是否缓存本页面 1是缓存 0是不缓存 默认是0',
      defaultValue: 1
    },
    component: {
      type: Sequelize.STRING,
      allowNull: false,
      comment: '组件路径'
    },
    sort: {
      type: Sequelize.INTEGER,
      comment: '排序'
    },
    title: {
      type: Sequelize.STRING,
      comment: '菜单标题'
    },
    hidden: {
      type: Sequelize.INTEGER,
      comment: '是否隐藏 1是隐藏 0是不隐藏 默认为0',
      defaultValue: 0
    },
    is_nav: {
      type: Sequelize.INTEGER,
      comment: '是否在左侧导航栏显示 1是 0 不是'
    },
    menutype: {
      type: Sequelize.INTEGER,
      comment: '菜单类型 1. folder 子路由 2.折叠siderbar/tab 3.view 直接展示页面 默认是3',
      defaultValue: 3
    }
  },
  {
    sequelize,
    tableName: 'menu',
    modelName: 'menu',
    timestamps: false
  }
)
// Menu.hasMany(Menu, { as: 'children', foreignKey: 'parent_id' })
// Menu.belongsTo(Menu, { foreignKey: 'id' })
export { Menu as MenuModel }
// // 用户表  => 角色表   接口权限  菜单表  接口权限中间表  菜单权限的中间表
