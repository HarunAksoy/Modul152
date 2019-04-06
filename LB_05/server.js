Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const path = require('path');
const gm = require('gm');
const multer = require('multer');
const ejs = require('ejs');
const fs = require('fs');
const ffmpeg = require('ffmpeg');
var fluent_ffmpeg = require("fluent-ffmpeg");
var http = require("http");
var WebSocket = require("ws");

const app = express();

//initialize a simple http server
var server = http.createServer(app);

//initialize the WebSocket server instance
var wss = new WebSocket.Server({ server: server });


wss.on('connection', function (ws) {

        let join = {
        user: 'Server',
        text: 'Du hast den Chat betreten',
        text2: 'Jemand hat den Chat betreten'
    };


    wss.clients
        .forEach(function (client) {
            if(client != ws){
                client.send(join.user + ': ' + join.text2)
            }
            else {
                ws.send(join.user + ': ' + join.text)
            }
        });


    ws.isAlive = true;
    ws.on('pong', function () {
        ws.isAlive = true;
    });


    //connection is up, let's add a simple simple event
    ws.on('message', function (message) {
        //log the received message and send it back to the client
        console.log('received: %s', message);
        wss.clients
            .forEach(function (client) {
                if (client != ws) {
                    client.send(message);
                }
                else {
                    ws.send(message);
                }
            });
    });
}
);


setInterval(function () {
    wss.clients.forEach(function (ws) {
        if (!ws.isAlive)
            return ws.terminate();
        ws.isAlive = false;
        ws.ping(null, false, true);
    });
}, 15000);

//start our server
server.listen(process.env.PORT || 80, function () {
    console.log("Server started on port " + server.address().port + " :)");
});
//# sourceMappingURL=server.js.map



function updateImages() {

    return fs.readdirSync('./public/files');
}

let myaudioName = '';


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

app.get('/webchat', function (req, res) {
    res.render('webchat')
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

app.get('/audio-player', function (req, res) {
    console.log(req.query.audioName);
    var filename = req.query.audioName.split('.').slice(0, -1).join('.');;
    res.render('aplayer', {
        name: filename
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

app.post('/api/audio', function (req, res) {
    audioupload(req, res, function (err) {
        if (err) {
            console.log(req.files)
            res.render('audio_manager', {
                msg: err,
            });
        }
        else {
            if (req.files.length <= 0) {
                res.render('audio_manager', {
                    msg: 'Error: No files selected!',
                });

            }
            else {
                const name = req.files[0].originalname
                const link = '/audio-player?audioName=' + name;
                console.log(req.files)
                res.render('audio_manager', {
                    msg: ' Audio uploaded!',
                    link: link,
                    watch: 'Click here to listen to the tape',
                });
            }
        }
    })
});


app.use('/public/files', express.static(path.join(__dirname, '/public/files')));
app.use('/public/videos/merged', express.static(path.join(__dirname, '/public/videos/merged')));
app.use('/public/videos/original', express.static(path.join(__dirname, '/public/videos/original')));
app.use('/public/audio', express.static(path.join(__dirname, '/public/audio')));


const storage = multer.diskStorage({
    destination: ('public/files/'),
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const storage2 = multer.diskStorage({
    destination: ('public/videos/original'),
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const storage3 = multer.diskStorage({
    destination: ('public/audio/'),
    filename: function (req, file, cb) {
        var filetype = file.fieldname;
        if(filetype == 'audio'){
            myaudioName = file.originalname.split('.').slice(0, -1).join('.');
            cb(null, file.originalname);
        }
        else if (filetype == 'lyrics') {
            file.originalname = myaudioName + '.vtt'
            cb(null, file.originalname);
        }
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
}).array('videos', 20);


const audioupload = multer({
    storage: storage3,
}).any();


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



