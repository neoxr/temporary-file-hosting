const express = require('express'),
   multer = require('multer'),
   fs = require('fs'),
   favicon = require('serve-favicon'),
   logger = require('morgan'),
   path = require('path'),
   db = require('./lib/db'),
   func = new(require('./lib/function'))
require('dotenv').config()
const creator = `@neoxrs – Wildan Izzudin`
const PORT = process.env.PORT || 8080
const runServer = async () => {
   var redirect
   const mongo = await db(process.env.MONGODB_DB_NAME, process.env.MONGODB_COLLECTION)
   setInterval(async function() {
      const data = await mongo.find().toArray()
      if (data.length == 0) return
      data.filter(v => (new Date * 1) >= v.expired).map(async v => {
         await mongo.deleteOne({
            _id: v._id
         })
         fs.unlinkSync('./public/uploads/' + v.filename)
         await func.delay(1500)
      })
   }, 10_000)
   const app = express()
   app.set('view engine', 'ejs')
      .use(express.static(path.join(__dirname, 'public')))
      .use(logger('dev'))
      .use(favicon(process.cwd() + '/public/favicon.ico'))
      .get('/', (req, res) => {
         res.render(process.cwd() + '/public/index', {
            title: 'Temporary File Hosting'
         })
      })
      .get('/file/:hash', async (req, res) => {
         const hash = req.params.hash
         const check = await mongo.findOne({
            _id: hash
         })
         if (!check) return res.status(404).json({
            creator,
            status: false,
            msg: 'File not found'
         })
         const size = func.formatSize(fs.statSync('./public/uploads/' + check.filename).size)
         res.render(process.cwd() + '/public/detail', {
            title: check.filename + ' | Temporary File Hosting',
            data: {
               ...check,
               size,
               timeout: func.timeout(check.expired - (new Date * 1))
            }
         })
      })
      .get('*', (req, res) => {
         return res.status(404).json({
            creator,
            status: false,
            msg: 'Page not found'
         })
      })

   const storage = multer.diskStorage({
      destination: function(req, file, cb) {
         var dir = process.cwd() + '/public/uploads'
         if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir)
         }
         cb(null, dir)
      },
      filename: async function(req, file, cb) {
         const id = func.makeId(6)
         cb(null, id + path.extname(file.originalname))
         redirect = id
         await mongo.insertOne({
            _id: id,
            filename: id + path.extname(file.originalname),
            expired: (new Date * 1) + 3_600_000
         })
      }
   })

   const upload = multer({
      storage: storage,
      fileFilter: function(req, file, cb) {
         var mime = file.mimetype
         if (!/image|video|audio/i.test(mime)) {
            return cb(new Error('Invalid file type'))
         }
         cb(null, true)
      },
      limits: {
         fileSize: Number(process.env.MAX_UPLOAD_SIZE) * 1000 * 1000
      }
   }).array('files', 12)

   app.post('/upload', async function(req, res, next) {
         upload(req, res, function(err) {
            if (err) {
               console.log(err)
               return res.end(err.message)
            }
            res.end('Upload completed : ' + redirect)
         })
      })
      .disable('x-powered-by')
      .listen(PORT, () => console.log(`Server is running in port ${PORT}`))
}

runServer().catch(() => runServer())