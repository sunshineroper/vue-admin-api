import { Model, DataTypes } from 'sequelize'
import { InforCrudMixin } from '@/util/inforCrudMixin'
import { merge } from 'lodash'
import {sequelize } from '@/lib'

class File extends Model {
  static async createRecord(args, commit) {
    try {
      const file = File.build(args)
      commit && file.save()
      return file
    } catch (error) {
      console.log(error)
    }
   
  }
}

File.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '主键'
    },
    path: {
      type: DataTypes.STRING,
      comment: '文件路径'
    },
    name: {
      type: DataTypes.STRING,
      comment: '文件名称'
    },
    type: {
      type: DataTypes.SMALLINT,
      comment: '1 本地文件 2 远程文件 默认是本地文件',
      defaultValue: 1
    },
    extension: {
      type: DataTypes.STRING,
      comment: '文件后缀名称'
    },
    size: {
      type: DataTypes.INTEGER,
      comment: '文件大小'
    },
    md5: {
      type: DataTypes.STRING,
      comment: '文件的md5'
    }
  },
  merge({
    sequelize,
    tableName: 'file',
    modelName: 'file',
  }, InforCrudMixin.options)

)

export { File as FileModel  }
