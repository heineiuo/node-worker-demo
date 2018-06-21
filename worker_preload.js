const {
  Worker, isMainThread, parentPort, workerData
} = require('worker_threads')
const images = require('./images')
const Jimp = require('jimp')
const fs = require('fs')
const { promisify } = require('util')
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

if (isMainThread) {
  let count = 0
  const workers = images.map((item, index) => {
    // console.time('new worker')
    const worker = new Worker(__filename, {
      workerData: { item, index }
    })
    // console.timeEnd('new worker')
    worker.on('message', () => {
      count++
      if (count === images.length) {
        console.timeEnd('worker: resize image')
        process.exit(0)
      }
    })
    worker.on('error', (e) => {
      console.log(e)
    })
    worker.on('exit', (code) => {
      if (code !== 0) {
        console.log(new Error(`Worker stopped with exit code ${code}`))
      }
    })
    return worker
  })

  console.time('worker: resize image')
  images.forEach((item, index) => {
    workers[index].postMessage({
      item,
      index
    })
  })
} else {
  parentPort.on('message', async ({ item, index }) => {
    // console.time('readFile')
    const buf = await readFile(workerData.item)
    // console.timeEnd('readFile')
    const img = await Jimp.read(buf)
    // img.cover(120, 120)
    img.brightness(1)
    img.posterize(3)
    img.sepia()
    const buf2 = await new Promise((resolve, reject) => {
      img.getBuffer(Jimp.MIME_JPEG, (err, result) => {
        if (err) {
          return reject(err)
        }
        resolve(result)
      })
    })
    // await writeFile(workerData.item + `-${workerData.index}.jpg`, buf2)
    parentPort.postMessage(1)
  })
}
