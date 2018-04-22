

const multer = require('multer');
const Stamp = require('./timeModel');
var FB = require('fb');
var id = 0;
const multerConf = {
    storage : multer.diskStorage({
        destination : function(req,file,next){
            next(null,'upload');
        },
    filename: function(req,file,next){
        const ext = file.mimetype.split('/')[1];
        next(null,file.fieldname + '-' + Date.now() + '.' + ext);  
    }    
    }),
    fileFilter: function(req,file,next){
        if(!file){
            next();
        }
        const image = file.mimetype.startsWith('image/');
        if(image){
            next(null,true);
        }else{
        }
    }
}

function postSttFb(content){
	FB.api(
		'/me/feed',
		'POST',
		{"message":content},
		function(response) {
		}
	  );
}

function postImgFb(content){
	FB.api(
		'/me/photos',
		'POST',
		{"url":content.img,"caption":content.caption},
		function(response) {
			console.log(response);
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
            Stamp.find({id:doc}).exec((err,data) =>{
                if(err) console.log(err);
                else{
                    console.log("done r");
                    res.send(data);
                }
            })
        }
    })
}

module.exports = {
    getTimeStamp,
    getId,
    postImgFb,
    postSttFb,
    multerConf,
    saveStamp
}