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
const Controller = require('./controller');
const multer = require('multer');
app.use(bodyParser.json({ extend: true }));
app.use(bodyParser.urlencoded({ extend: true }));
const mongoose = require('mongoose');
const connectionString = "mongodb://Trinhngockhang1503:khangkhang123@ds213759.mlab.com:13759/fbgmailapi" || "mongodb://localhost/fbgmailapi";
app.get('/',(req,res) =>{
	res.render("trangchu.ejs");
})

app.post('/getdata',(req,res) =>{
	var info = {};
	token = req.body.token;
	FB.setAccessToken(token);
	FB.api(
		'/me',
		'GET',
		{"fields":"name,picture"},
		function(response) {
			info.name = response.name;
			info.ava = response.picture;
			res.send(info);
		}
	  );
})

app.get('/imageupload',(req,res) =>{
	var path = req.query.path;
	console.log(path);
	var img = fs.readFileSync('./upload/'+ path);
	res.writeHead(200, {'Content-Type': 'image/gif' });
    res.end(img, 'binary');
})

app.post('/sendmail',multer(Controller.multerConf).single('img'),(req,res) => {
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
	console.log(req.file);
	const mailOptions = {
		from: accountSender.user, // sender address
		to: receivers, // list of receivers
		subject: subject, // Subject line
		text:content
	  };   
	  if(req.file){
		attachments:[
			{
			  filename: req.file.filename,
			  content: fs.createReadStream(req.file.path),
			  contentType : req.file.mimetype
			}
		  ]
	  }
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

app.get('/timestamp',(req,res) =>{
	var token = req.query.token;
	Controller.getTimeStamp(req,res,token);
})

app.post("/postfb",multer(Controller.multerConf).single('img'),(req,res)=>{
	var token;
	var status = req.body.title +"\n" +req.body.caption;
	var data = {
		title: req.body.title,
		content: req.body.caption
	}
	token = req.body.token;
	FB.setAccessToken(token);
	
	console.log("body" + req.body);
	console.log("file" + req.file);
	
	if(req.file){
		var content = {
			img : "https://facebookgmailapi.herokuapp.com/imageupload?path=" + req.file.filename,
			caption : req.body.title +"\n" +req.body.caption
		}
		Controller.postImgFb(content);			
		res.send("da up anh");
	}else{
		Controller.postSttFb(status);
		res.send("da up stt");
	}
	Controller.getId((err,doc) => {
		data.id = doc;
		Controller.saveStamp(data,(err,doc)=>{
			if(err) console.log(err);
			else console.log("da luu tc");
		})
	});
})

app.post('/deletedata',(req,res) =>{
	Controller.deleteStamp(req,res,req.body.token);
})

app.listen(PORT, err => {
	if (err) throw err;
	console.log(`Server listening on ${PORT}`);
});

mongoose.connect(connectionString, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Connect DB success !');
    }
});

