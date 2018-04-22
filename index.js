

var express = require("express");
var app = express();
const fs = require('fs');
const nodemailer = require('nodemailer');
var request = require('request');
var FB = require('fb');
app.set("view engine","ejs");
app.set("vỉews","./views");
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 6969;
const multer = require('multer');

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

app.use(bodyParser.json({ extend: true }));
app.use(bodyParser.urlencoded({ extend: true }));

app.get('/',(req,res) =>{
	res.render("trangchu.ejs");
})

app.post('/getdata',(req,res) =>{
	var info = {};
})

app.get('/imageupload',(req,res) =>{
	var path = req.query.path;
	console.log(path);
	var img = fs.readFileSync('./upload/'+ path);
	res.writeHead(200, {'Content-Type': 'image/gif' });
    res.end(img, 'binary');
})

app.post('/sendmail',(req,res) => {
	var accountSender = {
		user:req.body.user,
		pass:req.body.pass
	}
	var subject = req.body.subject;
	var receivers = req.body.receivers;
	var content = req.body.content;
	var transporter = nodemailer.createTransport({
		host:'https://facebookgmailapi.herokuapp.com',
		service: 'gmail',
		auth: {
			   user: accountSender.user,
			   pass: accountSender.pass
		   }
	   });
	const mailOptions = {
		from: accountSender.user, // sender address
		to: receivers, // list of receivers
		subject: subject, // Subject line
		html:content// plain text body
	  };   
	  transporter.sendMail(mailOptions, function (err, info) {
		if(err){
			res.send(err);
			console.log(err);
		}
		else{
			res.send('done');
			console.log(info);
		}
		  
	 });
})

app.post("/poststtfb",(req,res) =>{
	var token;
	var content;
	content = req.body.content;
	token = req.body.token;
	FB.setAccessToken(token);
	postSttFb(content);
	res.send("done");
})

app.post("/postimgfb",multer(multerConf).single('img'),(req,res)=>{
	var token;
	var content = {
		img : "https://facebookgmailapi.herokuapp.com/imageupload?path=" + req.file.filename,
		caption : req.body.caption
	}
	token = req.body.token;
	console.log(req.file);
	FB.setAccessToken(token);
	postImgFb(content);	
	res.send(req.file);
})

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

app.listen(PORT, err => {
	if (err) throw err;
	console.log(`Server listening on ${PORT}`);
});
