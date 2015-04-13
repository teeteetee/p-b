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
  , users = db.get('users');
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

var lguser = {};
app.use(function(req,res,next){
  console.log("CHECKING COOKIES: "+JSON.stringify(req.session)+" "+req.session.lgn);
   if(req.session.admin === 1){
    lguser = req.session;
    next();}
   else {
   if(req.session && req.session.lgn){
     users.findOne({mail:req.session.mail},function(err,user){
      console.log('found user: '+JSON.stringify(user));
      if(err){
        next();
      }
      else {
        if(user.length>0 && user.hostel != 1){
        lguser = user;
        delete lguser.phr;
        delete lguser._id;
        delete lguser.enquiries;
        delete lguser.regdate;
        req.session = lguser;
        console.log('USER WITH COOOOOKIEES !');
        next();}
      else {next();}
      } 
     });
   }
   else {
    next();
   }
 }
});

//SUBDOMAIN MAGIC 

app.get('*',function(req,res,next){
  if (req.ip === '188.226.189.180') {
    console.log("c'est moi "+req.headers.host);
    next();
  } 
  else{
    next();
  }
});

app.get('*', function(req,res,next) {  

   if(req.headers.host === 'm.peopleandbooks.com')  //if it's a sub-domain
   {req.url = '/m' + req.url; 
    console.log(req.url); //append some text yourself
     next();}
  else{
   console.log('-------------- REQUEST --------------')
   console.log('User-Agent: ' + req.headers['user-agent']);
   console.log('URL: '+req.url);
   console.log(req.ip);
    next();}
   });


app.get('/logout',function(req,res){
  console.log('trying to logout');
  req.session.reset();
  console.log(JSON.stringify(req.session));
  res.redirect('/');
});

app.post('/addbook',function(req,res){
  if (req.session.mail != undefined && req.session.lgn != undefined){
    function getbooksarray (fulldate) {
 users.findOne({uid:vuid},function(err,done){
  if(err){
    return 0
  }
  else {
    if(done)
    {var datearray = done.dates;
     return getdatefromarray(fulldate,datearray)
    }
    else {
      return 0
    }
  }
 }
}

function getdatefromarray(nameKey, myArray){
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i].dateint === nameKey) {
            return myArray[i];
        }
    }
}

function emptydaycheck () {
  users.findOne({uid:vuid,dateint:fulldate},function(err,done){
    if (err)
    {
      console.log('DB ERR emtydaycheck()');
      return 0
    }
    else {
      if(done)
      {
        //empty
        return 0
      }
      else{
        // date has books
        return 1
      }
    }
  });
}
    var ms = {};
    ms.trouble =1;
    var vuid = parseInt(req.params.uid);
    var vbooktitle = req.params.booktitle;
    var vauthor = req.params.author;
    var vstar = req.params.star;
    var vattention = req.params.attention;
    console.log('ADDING A BOOK: '+vuid+' '+vbooktitle+' '+vauthor+' '+vstar+' '+vattention);
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

    if(!vbooktitle){
      vbooktitle = '--';
    }
    if(!author){
      author = '--';
    }
       if(!emptydaycheck){
        // date is empty
          users.insert({uid:vuid},{$push:{dates:{dateint:fulldate,books:[{author:vauthor,booktitle:vbooktitle,star:vstar,attention:vattention}]}}});
          ms.trouble=0;
          res.send(ms);
       }
       else {
        var modifieddate = {
          author:vauthor,
          booktitle:vbooktitle,
          star:vstar,
          attention:vattention};
         var booksarray = getbooksarray(fulldate);
         booksarray.books.push(modifieddate);
         users.insert({uid:vuid},{$push:{dates:booksarray}});
         ms.trouble=0;
          res.send(ms);
       }
  }
  else {
    res.send(ms);
  }
});



app.post('/addmovie',function(req,res){
  if (req.session.mail != undefined && req.session.lgn != undefined){
    var vuid = parseInt(req.params.uid);
    var vmovietitle = req.params.movietitle;
    var vyear = req.params.year;
    
  }
  else {

  }
});

app.get('/register',function(req,res){
 res.render('register');
});

app.post('/newuser',function(req,res){
    //THOSE USERS ARE NORMAL PEOPLE, HOSTEL STUF WILL BE REGISTERED THROUGH ADMIN
    var vmail = req.body.mail; 
    var vu = req.body.u; //NEEDED TO WRITE COMMENTS, DONT ASK AT REGISTRATION
    if (vu.length === 0 )
      {vu = 0;}
    var vp = bcrypt.hashSync(req.body.p,bcrypt.genSaltSync(10));
    var ms = {};
    ms.trouble=1;
    ms.mtext='email incorrect';
    // MUST INCLUDE enquiries - all  - accepted WHEN WRITING TO THE DB
    // CHECK MAIL BEFOR WRTING
    function validateEmail(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
    } 

    function generateId() {
     users.find({},{limit:1,sort:{pid:-1}},function(err,doc){
     if(err){
         console.log('DB ERR WHILE GENERATING ID')
         return 0;
        }
      else {
        if(doc.length>0){
            var newid = doc[0].pid;
                newid++;
                return newid;
          }
        else {
                return 1;
          }
            }
          });
     } // generateId declaration end

    if (validateEmail(vmail) === true) {
    users.find({mail:vmail},function(err,doc){
      if (err)
      {
        //DO SMTH
      }
      else {
        if(doc.length === 0)
        { var now = new Date();
          var gmonth = now.getMonth();
          var gyear = now.getUTCFullYear();
          var gday = now.getDay();
          var vuid = generateId();
          users.insert({mail:vmail,uid:vuid,phr:vp,lgn:vu,regdate:{year:gyear,month:gmonth,day:gday}});
          users.findOne({mail:vmail},function(err,docdoc){
            console.log('FOUND AFTER INSERTING NEW USER :'+JSON.stringify(docdoc));
            if (err){
              //DO SMTH
            }
            else{
               if (docdoc) {
                req.session = docdoc;
                ms.trouble =0;
                ms.mtext='success';
                // INDEX MUST BE DIFFERENT FOR REGISTERD ONES, IT IS TEMPORARY THE SAME
                console.log('SOMEBODY REGISTERED');
                res.send(ms);
               }
               else {
                  ms.mtext ='fail';
                  res.send(ms);
               }
            }
          });
        }
        else {
           ms.mtext='email exists'
           res.send(ms);
        }
      }// end of err's else
    });
    }   
    else {
      // INCORRECT EMAIL, SO WE SEND A NOTIFICATION
      res.send(ms);
    }

    });

app.post('/check',function(req,res){
  //CHECK FOR PASSPORT PRIOR TO HOSTEL CHECK, SORT THIS OUT AFTER ALPHA
  //"LASTIMEONLINE" MUST BE ADDED AFTER ALPHA
  vphr=req.body.phr;
  vlgn=req.body.lgn; // email
  console.log(vphr+" , "+vlgn);
  //adding a marker to send to client
  // MARKER MECHANICS IS NOT PRESENT YET , NEEDS TO BE IMPLEMENTED
   var  ms = {};
  ms.trouble=1;
  ms.mtext='db';
  //end of marker
  users.findOne({mail:vlgn},function(err,confirmed){
    if (err)
      {res.send(ms);}
    else 
    {
      if (confirmed)
      {console.log('we have found :'+JSON.stringify(confirmed));
         
      
          if(bcrypt.compareSync(vphr,confirmed.phr))
          {
          
          req.session = confirmed;
          console.log("THAT'S WHAT I WROTE TO HIS COOKIES: "+JSON.stringify(req.session));
          ms.trouble = 0;
          ms.mtext= 'success';
          res.send(ms);
           }
           else {
            ms.mtext='wrong pas';
              res.send(ms);
              //WRONG PASSWORD
           }
         
      }
      else {
        ms.mtext='wronguser'
        res.send(ms);
      }
    }
  });
});



 

app.get('/',function(req,res) {
  var userAgent=req.headers['user-agent'];
  var uacheck = userAgent.indexOf("iPhone") != -1 ;
  console.log(uacheck);
   if (req.session.mail != undefined && req.session.lgn != undefined)
        //{res.render('indexreg',{'prfname':"Привет, "+req.session.lgn+"!"});}
        { 
          users.findOne({mail:req.session.mail},function(err,done){
            if(err){
              res.render('indexreg');
            }
            else {
              if(done){

              }
              else {
                res.render('indexreg',{'doc':done.dates,'uid':done.uid});
              }
            }
          });
          res.render('indexreg');
        }
   else {
  res.render('index');}
});

app.get('/books',function(req,res){
res.render('books');
});

app.get('/settings',function(req,res){
res.render('settings');
});


app.get('/m',function(req,res){
        //res.render('index',{'places':doc});
        if (req.session.mail != undefined && req.session.lgn != undefined)
        //{res.render('indexreg',{'prfname':"Привет, "+req.session.lgn+"!"});}
        {res.render('mindexreg');}
   else {
  res.render('mindex');}
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
   users.count({},function(err,c){
    if (err)
    {}
  else {
    res.render('admin',{'users':c});

  }
  });
  
}
   else {
   res.render('index');
 }

});

app.get('/admin/userlist',function(req,res){
  if(req.ip === '188.226.189.180'  || req.session.sKK76d === 'porC6S78x0XZP1b2p08zGlq')
  {
    users.find({},function(err,doc){
    if(err)
    {
      res.send('DB ERR')
    }
    else {
      if(doc.length>0)
      {
         res.render('userlist',{'doc':doc});
      }
      else{
         res.send('NO PLACES - EMPTY DB');
      }
    }
  });
  }
  else{
    res.redirect('http://ya.ru');
  }
});

app.post('/admin/1/:id',function(req,res){
  var pas = req.body.uu;
  if (pas != 'withoutthesecurity') {
    res.redirect('http://recentones.com');
  }
  else 
  {var vpid = parseInt(req.params.id);
    var ms={};
    ms.trouble=1;
    ms.mtext = 'db';
    places.remove({pid:vpid},function(err,done){
      if(err){
        res.send(ms);
      }
      else {
        ms.trouble=0;
        res.send(ms);
      }
    });}
});

// production error handler
// no stacktraces leaked to user
app.use(function(req, res) {
    var err = new Error('Not Found');
    err.status = 404;
    res.render('404');
});


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