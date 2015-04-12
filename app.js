var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sessions = require('client-sessions');
var bcrypt = require('bcrypt');

var mongo = require('mongodb');
var db = require('monk')('localhost/tav')
  , places = db.get('places'),adminplaces = db.get('adminplaces'),top = db.get('top'),clientmail = db.get('clientmail'),clients = db.get('clients'),insidemsg = db.get('insidemsg');
// POSTS and OBJECTS BELONGS TO MALESHIN PROJECT DELETE WHEN PUSHING TOPANDVIEWS TO PRODUCTION
var fs = require('fs-extra');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
//app.use(require('connect').bodyParser());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.compress());
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 2540000000 }));
app.use(sessions({
  cookieName: 'session',
  secret:'2342kjhkj2h3i2uh32j3hk2jDKLKSl23kh42u3ih4',
  duration:4320 * 60 *1000,
  activeduration:1440 * 60 * 1000,
  httpOnly: true
}));

//var lguser = {};
//app.use(function(req,res,next){
//  console.log("CHECKING COOKIES: "+JSON.stringify(req.session)+" "+req.session.lgn);
//   if(req.session.admin === 1){
//    lguser = req.session;
//    next();}
//   else if(req.session.hostel === 1) 
//    {lguser = req.session;
//      next();}
//   else {
//   if(req.session && req.session.lgn){
//     users.findOne({mail:req.session.mail},function(err,user){
//      console.log('found user: '+JSON.stringify(user));
//      if(err){
//        next();
//      }
//      else {
//        if(user.length>0 && user.hostel != 1){
//        lguser = user;
//        delete lguser.phr;
//        delete lguser._id;
//        delete lguser.enquiries;
//        delete lguser.regdate;
//        req.session = lguser;
//        console.log('USER WITH COOOOOKIEES !');
//        next();}
//      else {next();}
//      } 
//     });
//   }
//   else {
//    next();
//   }
// }
//});

//app.get('/logout',function(req,res){
//  console.log('trying to logout');
//  req.session.reset();
//  console.log(JSON.stringify(req.session));
//  res.redirect('/');
//});


//SUBDOMAIN MAGIC 


app.get('*', function(req,res,next) {   var d = new Date();
  if(req.headers.host === 'api.recentones.com')  //if it's a sub-domain
   {console.log(d+' got an api request from '+req.ip);
    req.url = '/api' + req.url; 
    console.log(req.url); //append some text yourself
  next();}
  else if(req.headers.host === 'm.recentones.com')  //if it's a sub-domain
   {req.url = '/m' + req.url; 
    console.log(req.url); //append some text yourself
     next();}
  else if (req.ip === '188.226.189.180') {
    console.log("c'est moi");
    next();
  } 
  else{
   console.log('-------------- REQUEST --------------')
   console.log('User-Agent: ' + req.headers['user-agent']);
   console.log('URL: '+req.url);
   console.log(req.ip);
    next();}
   });
 
app.get('/transitions',function(req,res){
  res.render('transitions');
});


app.get('/',function(req,res) {
  var userAgent=req.headers['user-agent'];
  var uacheck = userAgent.indexOf("iPhone") != -1 ;
  console.log(uacheck);
  res.render('/index');
});

app.get('/books',function(req,res){
res.render('books');
});

app.get('/settings',function(req,res){
res.render('settings');
});

 
app.post('/m/keepintouch',function(req,res,next){
  req.url='/keepintouch';
  next();
});

app.post('/keepintouch',function(req,res){
  var cmail = req.body.cm;
  function validateEmail(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
 }  
    var ms = {};
    ms.trouble = 1;
    ms.mtext = 'spelling';
    if (validateEmail(cmail) === true) {
      var dd= new Date();
      var vday = dd.getDate().toString();
      if (vday.length===1){
        vday='0'+vday;
      }
      var vmonth = dd.getMonth()+1;
      vmonth = vmonth.toString();
      if (vmonth.length===1){
        vmonth='0'+vmonth;
      }
      var vyear = dd.getUTCFullYear().toString();
      var fulldate = vyear+vmonth+vday;
      fulldate = parseInt(fulldate);
     clientmail.find({},{ limit:1,sort : { cid : -1 } },function(err,doc){
      if(doc.length>0)
      { 
        var newid = doc[0].cid+1;
        clientmail.insert({cid:newid,mail:cmail,regdate:fulldate});
        ms.trouble=0;
        res.send(ms);
      }
      else {
        clientmail.insert({cid:1,mail:cmail,regdate:fulldate});
        ms.trouble=0;
        res.send(ms);
      }
    });
}
    else {
      res.send(ms);
    }
});

app.get('/m',function(req,res){
  places.find({},{ limit:9,sort : { founddateint: -1 } },function(err,doc){
    if(err)
    {
      res.render('memptyindex');
    }
    else {
      if(doc.length>0)
      {
        //res.render('index',{'places':doc});
        res.render('mindex',{'doc':JSON.stringify(doc)});
      }
      else{
        res.render('memptyindex');
      }
    }
  });
});

app.get('/dropplaces',function(req,res){
  if(req.ip === '188.226.189.180' || req.session.sKK76d === 'porC6S78x0XZP1b2p08zGlq')
    {places.remove({},function(err,done){
        if(err)
        {
          res.send('98');
        }
        else {
          res.send('SUCCESS');
        }
        });}
  else {
    res.redirect('http://yandex.ru');
  }
  });

app.get('/admax',function(req,res){
  console.log("CHECKING COOKIES: "+JSON.stringify(req.session)+" "+req.session.lgn);
  var lguser={};
   if(req.session.sKK76d === 'porC6S78x0XZP1b2p08zGlq')
   {
    var vratingnum;
   top.count({},function(err,c){
    if (err)
    {}
  else {
    vratingnum= c;

  }
  });
  var vplacenum; 
  places.count({},function(err,c){
    if (err)
    {}
  else {
    vplacenum= c;
    var vinterested ;
  clientmail.count({},function(err,c){
    if (err)
    {}
  else {
    vinterested= c;
    var vaccepts; 
    clients.count({},function(err,c){
    if (err)
    {}
  else {
    vaccepts= c;
    var market;
    adminplaces.count({},function(err,c){
      if(err)
      {}
      else
        market = c;
     {console.log(c);
      insidemsg.find({},{sort:{mid:-1}},function(err,c){
        if(err)
      {}
      else{
              res.render('admin',{'ratingnum':vratingnum,'placenum':vplacenum,'interested':vinterested,'accepts':vaccepts,'market':market,'doc':c});

      }
      });
 }
    });
  }
  });
  }
  });
  }
  });
}

   else {
   res.render('auth');
 }

});

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
app.listen(80,'188.166.118.116');
// zero downtime with naught
if (process.send) process.send('online');
process.on('message', function(message) {
  if (message === 'shutdown') {
    //Do whatever you need to do before shutdown (cleanup, saving stuff, etc.)
    process.exit(0);
  }
});