//File dedicated to multer since its not necessary for the purpose of the challenge. I'll make another form and submit a file there.

//Initializing express and multer
const express = require('express')
const multer = require('multer')
const app = express()

//Middleware to encode the form data
app.use(express.urlencoded({extended: true}))

//The multer config 
const storageConfig = multer.diskStorage({
    destination: 'uploads',
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}`)
    }
})

const fileUploader = multer({storage: storageConfig})

//Get that responds with the html for uploading a file. Post that posts the file in uploads folder
app.get('/upload', (req, res) => {
    res.sendFile(__dirname + '/public/upload.html')
})

app.post('/files', fileUploader.single('upload') , (req, res) => {
    res.send(`You've successfullly uploaded a file!`)
})

//Listener for the server in another port so that it differentiates from the index's port
const server = app.listen(8090, () => console.log(`Server active at port: ${server.address().port}`))

//Error handler for the server listener
server.on('error', (error) => console.error(`Error on listening to server: ${error}`));