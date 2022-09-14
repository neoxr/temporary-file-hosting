const express = require('express'),
   multer = require('multer'),
   fs = require('fs'),
   logger = require('morgan'),
   path = require('path'),
   db = require('./lib/db'),
   func = new(require('./lib/function'))
require('dotenv').config()
const PORT = process.env.PORT || 8080
const runServer = async () => {
   const fileStore = await db(process.env.MONGODB_DB_NAME, process.env.MONGODB_COLLECTION)
   const app = express()
   app.set('view engine', 'ejs')
      .use(express.static(path.join(__dirname, 'public')))
      .use(logger('dev'))
      .get('/', (req, res) => {
         res.render(process.cwd() + '/public/index')
      })
      .get('/file/:hash', async (req, res) => {
         const hash = req.params.hash
         const check = await fileStore.find({
            _id: hash
         })
         if (!check) return res.status(404).json({
            status: false,
            msg: 'File not found'
         })
         res.end(check)
      })
      .get('*', (req, res) => {
         return res.status(404).json({
            status: false
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
     	cb(null, (new Date * 1) + path.extname(file.originalname))
         const id = func.makeId(6)
         await fileStore.insert([{
            _id: id,
            filename: id + path.extname(file.originalname),
            uploaded_at: new Date * 1
         }])
         setTimeout(function() {
            res.redirect('/file/' + id)
         }, 1700)
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
            res.end('Upload completed')
         })
      })
      .disable('x-powered-by')
      .listen(PORT, () => console.log(`Server is running in port ${PORT}`))
}

runServer().catch(() => runServer())