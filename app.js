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
  , users = db.get('users'),insidemsg = db.get('insidemsg');
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
   if(req.session.sKK76d === 'porC6S78x0XZP1b2p08zGlq'){
    lguser = req.session;
    next();}
   else {
   if(req.session.lgn){
     users.findOne({mail:req.session.mail},function(err,user){
      console.log('found user: '+JSON.stringify(user));
      if(err){
        next();
      }
      else {
        if(user)
        {if(user.length>0 ){
                lguser = user;
                delete lguser.phr;
                delete lguser._id;
                delete lguser.enquiries;
                delete lguser.regdate;
                req.session = lguser;
                console.log('USER WITH COOOOOKIEES !');
                next();}
              else {next();}}
        else {
          req.session.reset();
          next();
        }
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
  console.log('adding a book');
  var ms = {};
  ms.trouble =1;
  if (req.session.mail && req.session.lgn ){
    var vuid = parseInt(req.body.uid);
    var vbooktitle = req.body.booktitle;
    var vnewbook = req.body.newbook;
    if(vnewbook) {
      vnewbook = 0;
    }
    else {
      vnewbook=1;
    }
    console.log('breakpoint one');
    var vauthor = req.body.author;
    var vstar = req.body.star;
    var vattention = req.body.attention;
    console.log('ADDING A BOOK: '+vuid+' '+vbooktitle+' '+vauthor+' '+vstar+' '+vattention);
    var dd= new Date();
    var vday = dd.getDate().toString();
    if (vday.length===1){
      vday='0'+vday;
    }
    var vmonth = dd.getMonth()+1;
    console.log('breakpoint two');
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
    console.log('breakpoint three');
    if(!vauthor){
      vauthor = '--';
    }
       emptydaycheck(scenario1(vuid),scenario2(vuid),fulldate);
        function scenario2(vuid){
        // date is empty
          users.update({uid:vuid},{$push:{bookdates:{dateint:fulldate,books:[{newbook:vnewbook,author:vauthor,booktitle:vbooktitle,star:vstar,attention:vattention}]}}});
          users.update({uid:vuid},{$inc:{newbooks:1}});
          ms.trouble=0;
          res.send(ms);
       }
       function scenario1(vuid) {
        var modifieddate = {
          newbook:vnewbook,
          author:vauthor,
          booktitle:vbooktitle,
          star:vstar,
          attention:vattention};
         var booksarray = getbooksarray(fulldate,getdatefromarray);
         function ending (booksarray)
         {booksarray.books.push(modifieddate);
                  users.update({uid:vuid},{$push:{bookdates:booksarray}});
                  users.update({uid:vuid},{$inc:{newbooks:1}});
                  ms.trouble=0;
                   res.send(ms);}
       }
  }
  else {
    res.send(ms);
  }
});

function getbooksarray (fulldate,callback) {
 users.findOne({uid:vuid},function(err,done){
  if(err){
    return 0;
  }
  else {
    if(done)
    {var datearray = done.bookdates;
     callback(fulldate,datearray,ending);
    }
    else {
      return 0;
    }
  }
 });
}

function getdatefromarray(nameKey, myArray,callback){
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i].dateint === nameKey) {
            callback(myArray[i]);
        }
    }
}

function emptydaycheck (callback1,callback2,fulldate) {
  users.findOne({uid:vuid,dateint:fulldate},function(err,done){
    if (err)
    {
      console.log('DB ERR emtydaycheck()');
      return 0;
    }
    else {
      if(done)
      {
        done.bookdates.forEach(function(element,index,array){
          if(element.dateint === fulldate)
          {callback1;
            return;}
          else {
            if(index+1 === done.bookdates.length) {
              callback2;
            }
          }
        });
      }
      else{
        callback2;
      }
    }
  });
}

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

    function generateId(callback) {
     users.find({},{limit:1,sort:{uid:-1}},function(err,doc){
     if(err){
         console.log('DB ERR WHILE GENERATING ID');
         callback(0);
        }
      else {
        if(doc.length>0){
            var newid = doc[0].uid;
                newid++;
                console.log('returning uid='+newid);
                callback(newid);
          }
        else {
              console.log('returning uid=');
                callback(1);
          }
            }
          });
     } // generateId declaration end

     function blanktest () {
      return 1;
     }

    if (validateEmail(vmail) === true) {
    users.find({mail:vmail},function(err,doc){
      if (err)
      {
        //DO SMTH
      }
      else {
        if(doc.length === 0)
        { //generate date
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
          // end of generate date
          generateId(insert);
          function insert(vuid) {
          users.insert({mail:vmail,uid:vuid,phr:vp,lgn:vu,newbooks:0,readbooks:0,regdateint:fulldate,regdate:{year:vyear,month:vmonth,day:vday}});
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
  vphr=req.body.phr;
  vlgn=req.body.lgn; // email
  console.log(vphr+" , "+vlgn);
   var  ms = {};
  ms.trouble=1;
  ms.mtext='db';
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
        { console.log(req.session);
          users.findOne({mail:req.session.mail},function(err,done){
            console.log('-----found-----');
            console.log(done);
            if(err){
              res.render('indexreg');
            }
            else {
              if(done){
                if(done.dates)
                {
                  res.render('indexreg',{'doc':done.dates,'uid':done.uid});
                }
                else {
                  res.render('emptyindexreg',{'uid':done.uid});
                }
              }
              else {
                res.render('index');
              }
            }
          });
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
        console.log('---------going to render midexes----------');
        if (req.session.mail != undefined && req.session.lgn != undefined)
        //{res.render('indexreg',{'prfname':"Привет, "+req.session.lgn+"!"});}
        {
           console.log('going to query');
           console.log(req.session.mail);
          users.findOne({mail:req.session.mail},function(err,done){
            if(err){
              //do a mistake template
              console.log('DB ERR');
              res.render('emptymindexreg',{'uid':done.uid});
            }
            else {
              if(done){
                console.log(done);
                if(!done.dates){
                  res.render('emptymindexreg',{'uid':done.uid});
                }
                else
                  {
                    console.log('!DONE.DATES');
                    res.render('mindexreg',{'bookdoc':JSON.stringify(done.bookdates),'moviedoc':JSON.stringify(done.moviedates),'uid':done.uid,'newbooks':done.newbooks,'readbooks':done.readbooks});
                 }
              }
              else {
                //do a mistake template
                console.log('!DONE');
                res.render('emptymindexreg',{'uid':done.uid});
              }
            }
          });
        }
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

function messagescount () {
  insidemsg.count({},function(err,c){
    if(err) {
      return 0;
    }
    else {
      return c;
    }
  });
}

function getmessages () {
  insidemsg.find({},function(err,doc){
    if (err)
    {
      return 0;
    }
    else {
      return doc;
    }
  });
}

app.get('/admax',function(req,res){
  console.log("CHECKING COOKIES: "+JSON.stringify(req.session)+" "+req.session.lgn);
  var lguser={};
   if(req.session.sKK76d === 'porC6S78x0XZP1b2p08zGlq')
   {
    var vratingnum;
   users.count({},function(err,c){
    if (err)
    {
      res.send('DB ERR')
    }
  else {
    if(messagescount)
    {
       var messages = getmessages;
      res.render('admin',{'users':c,'doc':messages});
     }
     else {
      res.render('adminzeromsg',{'users':c});
     }

  }
  });
  
}
   else {
   res.render('adminauth');
 }

});

app.post('/admax',function(req,res){
  var pas = 'christ';
  var log = 'jesus';
  var vpas = req.body.vpas;
  var vlog = req.body.vlog;
  if(pas === vpas && log === vlog) {
    req.session.sKK76d = 'porC6S78x0XZP1b2p08zGlq';
    res.redirect('http://peopleandbooks.com/admax');
  }
  else {
    res.render('adminauth');
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

app.post('/drop/users',function(req,res){
  if(req.ip === '188.226.189.180' || req.session.sKK76d === 'porC6S78x0XZP1b2p08zGlq')
  {
    var pp = 'secureshit';
     if(req.body.p ===  pp)
     {users.remove({});
     console.log('USERS DB DROPPED FROM '+ req.ip);
     res.redirect('http://peopleandbooks.com/admax');}
    else {
      res.redirect('http://peopleandbooks.com');
    }
  }
  else {
    res.redirect('http://peopleandbooks.com');
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

app.post('/admin/insidemsg/remove',function(req,res){
  console.log('removing a message');
  var vmid = parseInt(req.body.mid);
  var pas = req.body.pas;
  if (pas != 'withoutthesecurity' || !vmid) {
    res.redirect('http://recentones.com');
  }
  else 
  { var ms={};
    ms.trouble=1;
    ms.mtext = 'db';
    insidemsg.remove({mid:vmid},function(err,done){
      if(err){
        res.send(ms);
      }
      else {
        ms.trouble=0;
        res.send(ms);
      }
    });
  }

});

app.post('/admin/insidemsg',function(req,res){
  console.log('creating message;');
  var vheading = req.body.heading;
  var vtextbody = req.body.textbody;
  var d = new Date();
  var vday = d.getDate().toString();
  var vmonth = d.getMonth()+1;
  vmonth = vmonth.toString();
  var vyear = d.getUTCFullYear().toString();
  console.log('beginning');
  if (vday.length===1){
         vday='0'+vday;
       }
  if (vmonth.length===1){
         vmonth='0'+vmonth;
       }
  var vregdateint= vyear+vmonth+vday;
  vregdateint = parseInt(vregdateint);
  var ms = {};
  ms.trouble=1;
  ms.mtext = 'db';
  console.log('middle');
  insidemsg.find({},{limit:1,sort:{mid:-1}},function(err,doc){
    if(err)
    {
      //clap your hands
      res.send(ms);
    }
   else {
    if(doc.length>0){
      console.log('end');
         var newid = doc[0].mid;
         newid++;
         console.log(newid);
         insidemsg.insert({mid: newid,heading: vheading,textbody: vtextbody,regdateint: vregdateint,regdate:{day:vday,month:vmonth,year:vyear}});
      ms.trouble=0;
      res.send(ms);
       }
       else {
         insidemsg.insert({mid: 1,heading: vheading,textbody: vtextbody,regdateint: vregdateint,regdate:{day:vday,month:vmonth,year:vyear}});
         ms.trouble=0;
      res.send(ms);
       }
   }
  });
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