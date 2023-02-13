import { LocalUploader, SRouter } from '@/lib'

const file = new SRouter({
  prefix: '/cms/file',
  module: '文件模块',
  mountPermission: false,
})

file.post('upload', '/', async (ctx) => {
  const files = await ctx.multipart()
  const uploader = new LocalUploader()
  const arr = await uploader.upload(files)
  ctx.json(arr)
})

export { file }
