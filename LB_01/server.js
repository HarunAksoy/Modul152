const express = require('express');
const path = require('path');
const gm = require('gm');
const multer = require('multer');


const app = express();

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/test', function (req, res) {
    res.send("Hallo Welt");
});


app.post('/api/file', function (req, res) {
        upload(req, res, function (err) {
                if (err) {
                    res.render('index', {
                        msg: err
                    });
                }
                else {
                    res.send('Successful: You can find the picture under https://h-152.herokuapp.com/files/' + req.file.originalname + ' ' + 'PS: put in front of the filename (small_, medium_ or big_) to see the picture in different sizes' );
                    gm(req.file.path)
                        .resize(720, 720)
                        .write('./uploads/files/' + 'small_' + req.file.originalname, function (err) {
                            if (err) {
                                res.render('index', {
                                    msg: err
                                });
                            }
                        });
                    gm(req.file.path)
                        .resize(1280, 1280)
                        .write('./uploads/files/' + 'medium_' + req.file.originalname, function (err) {
                            if (err) {
                                res.render('index', {
                                    msg: err
                                });
                            }
                        });
                    gm(req.file.path)
                        .resize(1920, 1920)
                        .write('./uploads/files/' + 'big_' + req.file.originalname, function (err) {
                            if (err) {
                                res.render('index', {
                                    msg: err
                                });
                            }
                        });
                }
            }

        )
    }
);

app.listen(process.env.PORT || 80, function () {
    console.log('Your node js server is running');
});

app.use(express.static('uploads'));


const storage = multer.diskStorage({
    destination: ('uploads/files'),
    filename: function (req, file, cb) {
        cb(/*null, Date.now() + '-' + */null, file.originalname);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb)
    }
}).single('');

function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname
    (file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    }
    else {
        cb('only images!');
    }
}
