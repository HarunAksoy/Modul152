const express = require('express');
const path = require('path');
const gm = require('gm');
const multer = require('multer');
const ejs = require('ejs');
const fs = require('fs');
const ffmpeg = require('ffmpeg');
var fluent_ffmpeg = require("fluent-ffmpeg");


const app = express();


function updateImages() {

    return fs.readdirSync('./public/files');
}





app.set('view engine', 'ejs');


app.get('/', function (req, res) {
    res.render('gallery_image', {
        images: updateImages()
    })
});

app.get('/gallery_image', function (req, res) {
    res.render('gallery_image', {
        images: updateImages()
    })
});

app.get('/video_manager', function (req, res) {
    res.render('video_manager')
});

app.get('/audio_manager', function (req, res) {
    res.render('audio_manager')
});

app.get('/play_video', function (req, res) {
    console.log(req.query.videoName);
    var filename = req.query.videoName;
    res.render('player', {
        name: fs.readdirSync(__dirname + '/public/videos/merged/').filter(function (file) {
            return file === filename;
        })
    })});

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
                            .write('./public/files/' + 'small_' + req.file.originalname, function (err) {
                                if (err) {
                                    res.render('gallery_image', {
                                        msg: err,
                                        images: updateImages()
                                    });
                                }
                            });

                        gm(req.file.path)
                            .resize(1280, 1280)
                            .write('./public/files/' + 'medium_' + req.file.originalname, function (err) {
                                if (err) {
                                    res.render('gallery_image', {
                                        msg: err,
                                        images: updateImages()
                                    });
                                }
                            });

                        gm(req.file.path)
                            .resize(1920, 1920)
                            .write('./public/files/' + 'big_' + req.file.originalname, function (err) {
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
                    if (req.files.length <= 0) {
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
                                .write('./public/files/' + 'small_' + element.originalname, function (err) {
                                    if (err) {
                                        res.render('gallery_image', {
                                            msg: err,
                                            images: updateImages()
                                        });
                                    }
                                });

                            gm(element.path)
                                .resize(1280, 1280)
                                .write('./public/files/' + 'medium_' + element.originalname, function (err) {
                                    if (err) {
                                        res.render('gallery_image', {
                                            msg: err,
                                            images: updateImages()
                                        });
                                    }
                                });

                            gm(element.path)
                                .resize(1920, 1920)
                                .write('./public/files/' + 'big_' + element.originalname, function (err) {
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

    app.post('/api/videos', function (req, res) {
        videosupload(req, res, function (err) {
            if (err) {
                res.render('video_manager', {
                    msg: err,
                    //images: updateImages()
                });
            }
            else {
                console.log(req.body.videoName);
                const name = req.body.videoName + '.mp4';
                const link = '/play_video?videoName=' + name;
                console.log(req.files);
                if (req.files <= 0) {
                    res.render('video_manager', {
                        msg: 'Error: No videos selected!',
                        //images: updateImages()
                    });
                }
                else {
                    var mergedVideo = fluent_ffmpeg();
                    var videoNames = req.files;
                    videoNames.forEach(function (videoName) {
                        mergedVideo = mergedVideo.addInput(videoName.path);
                    });
                    mergedVideo.mergeToFile('public/videos/merged/' + name)
                        .on('error', function (err) {
                            console.log('Error ' + err.message);
                        })
                        .on('end', function () {
                            console.log('Finished!');
                        });
                    res.render('video_manager', {
                        msg: 'Video uploaded!',
                        link: link,
                        watch: 'Click here to watch the video, may take a few seconds/minutes depends on the video',
                    });
                }

            }
        })
    });


    app.listen(process.env.PORT || 80, function () {
        console.log('Your node js server is running');
    });

    app.use('/public/files', express.static(path.join(__dirname, '/public/files')));
    app.use('/public/videos/merged', express.static(path.join(__dirname, '/public/videos/merged')));
    app.use('/public/videos/original', express.static(path.join(__dirname, '/public/videos/original')));



    const storage = multer.diskStorage({
        destination: ('public/files/'),
        filename: function (req, file, cb) {
            cb(/*null, Date.now() + '-' + */null, file.originalname);
        }
    });

    const storage2 = multer.diskStorage({
        destination: ('public/videos/original'),
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

    const videosupload = multer({
        storage: storage2,
        /*fileFilter: function (req, file, cb) {
            checkFileType(file, cb)
        }*/
    }).array('videos', 20);

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


