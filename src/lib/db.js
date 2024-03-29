import { Sequelize } from 'sequelize'
import { config } from 'koa-cms-lib'
const db = config.getItem('db')
export const sequelize = new Sequelize(db.database, db.username, db.password, {
  host: db.host,
  dialect: db.dialect,
  logging: db.logging,
})
// sequelize
//   .sync({ force: true })
//   .then(() => {
//     console.log('所有模型均已成功同步.')
//   })
//   .catch((e) => {
//     console.log(e, '-')
//   })
