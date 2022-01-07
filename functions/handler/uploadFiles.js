const { admin } = require('../util/admin');
const config = require('../util/config');

module.exports = (req, res) => {
    const busBoy  = require('busboy');
    const path = require('path');
    const os = require('os');
    const fs = require('fs');
    const busboy = new busBoy({ headers: req.headers});

    let fileToBeUploaded = {};
    busboy.on('file', (filedname, file, filename, encoding, mimetype) => {
        console.log('File [' + filedname + ']: filename: ' + filename + 'mimetype: ' + mimetype);
        const filepath = path.join(os.tmpdir(), filename);
        console.error(filepath);
        fileToBeUploaded = { filepath, mimetype, filename };
        file.pipe(fs.createWriteStream(filepath));
    });
    busboy.on('finish', () => {
        if(fileToBeUploaded.mimetype.split('/')[0] === 'image') {
            fileToBeUploaded.destination = `Photos/${fileToBeUploaded.filename}`;
        } else if(fileToBeUploaded.mimetype.split('/')[0] === 'video') {
            fileToBeUploaded.destination = `Videos/${fileToBeUploaded.filename}`;
        } else {
            fileToBeUploaded.destination = `Docs/${fileToBeUploaded.filename}`;
        }
        admin.storage().bucket().upload(fileToBeUploaded.filepath, {
            resumable: false,
            destination: fileToBeUploaded.destination,
            metadata: {
                metadata: {
                    contentType: fileToBeUploaded.mimetype
                }
            }
        })
        .then( () => {
            const filePath = fileToBeUploaded.destination.replace('/','%2F').replace(/ /g,'%20');

            const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${filePath}?alt=media`;
            return res.status(201).json({fileUrl});
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({error : err.code})
        })
    });
    busboy.end(req.rawBody);
}