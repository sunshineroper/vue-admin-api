import { SRouter, LocalUploader } from '@/lib'
import { loginRequired } from '@/middleware'

const file = new SRouter({
  prefix: '/cms/file',
  module: '文件模块',
  mountPermission: false
})

file.post('upload', '/', async ctx => {
  const files = await ctx.multipart()
  const uploader = new LocalUploader()
  let arr = await uploader.upload(files)
  ctx.json(arr)
  
})

export { file }
