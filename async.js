const Jimp = require('jimp')
const fs = require('fs')
const images = require('./images')
const { promisify } = require('util')
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

process.nextTick(async () => {
  console.time('async: resize image')
  await Promise.all(images.map((item, index) => {
    return new Promise(async (resolve) => {
      const buf = await readFile(item)
      const img = await Jimp.read(buf)
      // img.cover(120, 120)
      img.posterize(3)
      img.brightness(1)
      img.sepia()
      const buf2 = await new Promise((resolve, reject) => {
        img.getBuffer(Jimp.MIME_JPEG, (err, result) => {
          if (err) {
            return reject(err)
          }
          resolve(result)
        })
      })
      // await writeFile(item + `-${index}.jpg`, buf2)
      resolve()
    })
  }))
  console.timeEnd('async: resize image')
})
