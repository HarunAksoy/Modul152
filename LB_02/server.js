const express = require('express');
const path = require('path');
const gm = require('gm');
const multer = require('multer');
const ejs = require('ejs');
const fs = require('fs');


const app = express();


function updateImages() {

    return fs.readdirSync('./files');
}



app.set('view engine', 'ejs');


app.get('/', function (req, res) {
    res.render('gallery_image', {
        images: updateImages()
    })
});


app.post('/api/file', function (req, res) {
        singleupload(req, res, function (err) {
            if (err) {
                res.render('gallery_image', {
                    msg: err,
                    images: updateImages()
                });
            }
            else {
                if (req.file === undefined) {
                    res.render('gallery_image', {
                        msg: 'Error: No image selected!',
                        images: updateImages()
                    });
                }

                else {
                    res.render('gallery_image', {
                        msg: 'Images uploaded!',
                        images: updateImages()
                    });
                    gm(req.file.path)
                        .resize(720, 720)
                        .write('./files/' + 'small_' + req.file.originalname, function (err) {
                            if (err) {
                                res.render('gallery_image', {
                                    msg: err,
                                    images: updateImages()
                                });
                            }
                        });

                    gm(req.file.path)
                        .resize(1280, 1280)
                        .write('./files/' + 'medium_' + req.file.originalname, function (err) {
                            if (err) {
                                res.render('gallery_image', {
                                    msg: err,
                                    images: updateImages()
                                });
                            }
                        });

                    gm(req.file.path)
                        .resize(1920, 1920)
                        .write('./files/' + 'big_' + req.file.originalname, function (err) {
                            if (err) {
                                res.render('gallery_image', {
                                    msg: err,
                                    images: updateImages()
                                });
                            }
                        });
                }
            }

        })
    }
);

app.post('/api/files', function (req, res) {
        multiupload(req, res, function (err) {
            if (err) {
                res.render('gallery_image', {
                    msg: err,
                    images: updateImages()
                });
            }
            else {
                if (req.files.length <= 0 ) {
                    res.render('gallery_image', {
                        msg: 'Error: No images selected!',
                        images: updateImages()
                    });

                }

                else {
                    res.render('gallery_image', {
                        msg: 'Images uploaded!',
                        images: updateImages()
                    });
                    req.files.forEach(function (element) {
                    gm(element.path)
                        .resize(720, 720)
                        .write('./files/' + 'small_' + element.originalname, function (err) {
                            if (err) {
                                res.render('gallery_image', {
                                    msg: err,
                                    images: updateImages()
                                });
                            }
                        });

                        gm(element.path)
                            .resize(1280, 1280)
                            .write('./files/' + 'medium_' + element.originalname, function (err) {
                                if (err) {
                                    res.render('gallery_image', {
                                        msg: err,
                                        images: updateImages()
                                    });
                                }
                            });

                        gm(element.path)
                            .resize(1920, 1920)
                            .write('./files/' + 'big_' + element.originalname, function (err) {
                                if (err) {
                                    res.render('gallery_image', {
                                        msg: err,
                                        images: updateImages()
                                    });
                                }
                            });
                    })
                }
            }

        })
    }
);


app.listen(process.env.PORT || 80, function () {
    console.log('Your node js server is running');
});

app.use('/files', express.static(path.join(__dirname, 'files')));



app.get('*', function (req, res) {
    res.render('gallery_image', {
        images: updateImages()
    })
});


const storage = multer.diskStorage({
    destination: ('files/'),
    filename: function (req, file, cb) {
        cb(/*null, Date.now() + '-' + */null, file.originalname);
    }
});

const singleupload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb)
    }
}).single('singleupload');

const multiupload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb)
    }
}).array('multipleupload', 20);

function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname
    (file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    }
    else {
        cb('Only images!');
    }
}
