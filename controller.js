

const multer = require('multer');
const Stamp = require('./timeModel');
var FB = require('fb');
var id = 0;
// const multerConf = {
//     storage : multer.diskStorage({
//         destination : function(req,file,next){
//             next(null,'upload');
//         },
//     filename: function(req,file,next){
//         const ext = file.mimetype.split('/')[1];
//         next(null,file.fieldname + '-' + Date.now() + '.' + ext);  
//     }    
//     }),
//     fileFilter: function(req,file,next){
//         if(!file){
//             next();
//         }
//         const image = file.mimetype.startsWith('image/');
//         if(image){
//             next(null,true);
//         }else{
//         }
//     }
// }

var fs = require('fs');
var rootFolder = 'public';
var dir = rootFolder + '/uploads';
var multerConf = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync(rootFolder)) {
            fs.mkdirSync(rootFolder);
        }
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir)
    },
    filename: function (req, file, cb) {
        console.log(file)
        var fileObj = {
            "image/png": ".png",
            "image/jpeg": ".jpeg",
            "image/jpg": ".jpg"
        };
        if (fileObj[file.mimetype] == undefined) {
            cb(new Error("file format not valid"));
        } else {
            cb(null, file.fieldname + '-' + Date.now() + fileObj[file.mimetype])
        }
    }
})


function postSttFb(content){
	FB.api(
		'/me/feed',
		'POST',
		{"message":content},
		function(response) {
            console.log("stt " + response);
		}
	  );
}

function postImgFb(content){
	FB.api(
		'/me/photos',
		'POST',
		{"source":content.img,"caption":content.caption},
		function(response) {
			console.log("img" + response);
		}
	  );
}

getId = (callback) => {
    var id = 0;
	FB.api(
		'/me',
		'GET',
		{"fields":"id"},
		function(response) {
           id = response.id;
           callback(null,id);
        }
    );
}

const saveStamp = (object,cb) =>{
    Stamp.create(object,(err,doc) => {
        if(err) return cb(err);
        else{
            console.log('save sc');
            return cb(null,doc);
        }
    })
}

function getTimeStamp(req,res,token){
    FB.setAccessToken(token);
    getId((err,doc) => {
        if(err) console.log(err);
        else{
            Stamp.find({id:doc}).sort( { time : -1 } ).limit(20).exec((err,data) =>{
                if(err) console.log(err);
                else{
                    console.log("done r");
                    res.send(data);
                }
            })
        }
    })
}

function deleteStamp(req,res,token){
    FB.setAccessToken(token);
    getId((err,doc) => {
        if(err) console.log(err);
        else{
            Stamp.remove({id:doc}).exec((err,data) =>{
                if(err) console.log(err);
                else{
                    console.log("done r");
                    res.send('Delete timestamp success');
                }
            })
        }
    })
}

module.exports = {
    deleteStamp,
    getTimeStamp,
    getId,
    postImgFb,
    postSttFb,
    multerConf,
    saveStamp
}