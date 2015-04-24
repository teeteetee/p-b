var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sessions = require('client-sessions');
var Cookies = require('cookies');
var bcrypt = require('bcrypt');

var mongo = require('mongodb');
var db = require('monk')('localhost/tav')
  , users = db.get('users'),insidemsg = db.get('insidemsg'),friends = db.get('friends');
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
  cookie: {
    path:'/',
  httpOnly: true,
  domain:'.peopleandbooks.com'
  }
}));

//var lguser = {};
//app.use(function(req,res,next){
//  console.log("CHECKING COOKIES: "+JSON.stringify(req.session)+" "+req.session.mail);
//   if(req.session.sKK76d === 'porC6S78x0XZP1b2p08zGlq'){
//    lguser = req.session;
//    next();}
//   else {
//   if(req.session.mail){
//     users.findOne({mail:req.session.mail},function(err,user){
//      console.log('found user: '+JSON.stringify(user));
//      if(err){
//        next();
//      }
//      else {
//        if(user)
//        {if(user.length>0 ){
//                lguser = user;
//                delete lguser.phr;
//                delete lguser._id;
//                delete lguser.enquiries;
//                delete lguser.regdate;
//                req.session = lguser;
//                console.log('USER WITH COOOOOKIEES !');
//                next();}
//              else {next();}}
//        else {
//          req.session.reset();
//          next();
//        }
//      } 
//     });
//   }
//   else {
//    next();
//   }
// }
//});

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
  req.session.reset();
  res.redirect('http://peopleandbooks.com/');
  //delete req.session.regdate;
  //res.clearCookie('connect.sid', { path: '/' });
  //// Need to access underlying cookie store to clear authentication cookie since client-session
  //// doesn't get invoked on res.redirects
  //res.send(req.session);
});

//app.get('/getcookie',function(req,res){
//  req.session = {mail:'test@test.test',uid:1,phr:'qiufqieflevflqe',totalbooks:0,totalmoviews:0,newbooks:0,readbooks:0,newmovies:0,seenmovies:0,regdateint:05102015,regdate:{year:2015,month:04,day:17}};
//  res.send('got it',200);
//});
//
//app.get('/checkcookies',function(req,res){
//  res.send(req.session);
//});

app.get('/about',function(req,res){
  if(req.session.mail){
    res.render('about');
  }
  else 
  {res.render('aboutout');}
});

app.get('/lists/:lid',function(req,res){
  if(req.params.lid.length>10) {
    res.redirect('http://yandex.ru');
    return;
  }
  var vuid = parseInt(req.params.lid);
  users.findOne({uid:vuid},function(err,done){
    if(err) {
        res.redirect('/');
    }
    else {
      if(done) {
        if(req.session.mail) {
          if(done.mail===req.session.mail){
            res.redirect('/');
            return;
          }
          if(done.pub===1)
           {
            var booksvar = JSON.stringify(done.books);
                      if(!booksvar) {
                        booksvar =0;
                      }
                      var moviesvar = JSON.stringify(done.movies);
                      if(!moviesvar) {
                        moviesvar =0;
                      }
                    
                    friends.findOne({mail:req.session.mail},function(err,doc){
                      if (err){

                      }
                      else {
                        if(doc.people)
                        {var peoplearr  = doc.people;
                          var addbutton=1;
                          peoplearr.forEach(function(element,index,array){
                          if(element.uid===done.uid){
                            element.newb=0;
                            element.newm=0;
                            addbutton=0;
                            friends.update({mail:req.session.mail},{$set:{people:peoplearr}});
                              }
                              var xx = "'mh':'white','bh':'white','mhl':'#F56979','bhl':'rgb(103, 186, 255)','yet':'0:0','small':'0:0','spanop':'0.1',";
                           eval("res.render('listin',{'button':"+addbutton+","+xx+"'mail':done.mail,'books':booksvar,'movies':moviesvar,'uid':done.uid,'newbooks':done.newbooks,'readbooks':done.readbooks,'newmovies':done.newmovies,'seenmovies':done.seenmovies});");
                        
                            });
                          }
                        
                           else {
                           var xx = "'mh':'white','bh':'white','mhl':'#F56979','bhl':'rgb(103, 186, 255)','yet':'0:0','small':'0:0','spanop':'0.1',";
                           eval("res.render('listin',{'button':1,"+xx+"'mail':done.mail,'books':booksvar,'movies':moviesvar,'uid':done.uid,'newbooks':done.newbooks,'readbooks':done.readbooks,'newmovies':done.newmovies,'seenmovies':done.seenmovies});");
                          
                        }
                      }
                    });
           }
           else {
            res.render('restricted');
           }
        }
        else {
          if(done.pub===1)
           {var booksvar = JSON.stringify(done.books);
                      if(!booksvar) {
                        booksvar =0;
                      }
                      var moviesvar = JSON.stringify(done.movies);
                      if(!moviesvar) {
                        moviesvar =0;
                      }
            var xx = "'mh':'white','bh':'white','mhl':'#F56979','bhl':'rgb(103, 186, 255)','yet':'0:0','small':'0:0','spanop':'0.1',";
            eval("res.render('listout',{"+xx+"'mail':done.mail,'books':booksvar,'movies':moviesvar,'uid':done.uid,'newbooks':done.newbooks,'readbooks':done.readbooks,'newmovies':done.newmovies,'seenmovies':done.seenmovies});");
            }
           else {
            res.render('restricted');
           }
        }
      }
      else {
        res.redirect('/');
      }
    }
  });
});


app.post('/modbook',function(req,res){
  var ms={};
  ms.trouble=1;
  var rem = parseInt(req.body.rem);
  var vuid = parseInt(req.body.uid);
  var vbid = parseInt(req.body.bid);
  console.log('rem: '+rem+',vuid: '+vuid+', vbid: '+vbid);
  users.findOne({uid:vuid},function(err,doc){
    if(err){
       ms.mtext='db';
       res.send(ms);
    }
    else {
      doc.books.forEach(function(element,index,array){
        if(element.bid===vbid) {
          var bookstatus;
          if(rem){
            bookstatus = element.newbook;
           doc.books.splice(index, 1);
           users.update({uid:vuid},{$set:{books:doc.books}});
           users.update({uid:vuid},{$inc:{totalbooks:-1}});
           if(element.newbook===1){
            users.update({uid:vuid},{$inc:{newbooks:-1}});
           }
           else {
            users.update({uid:vuid},{$inc:{readbooks:-1}});
           }
           ms.trouble=0;
           ms.bookstatus=bookstatus;
           res.send(ms);
           console.log('removed a book;');
          }
          else {
           element.newbook=0;
           users.update({uid:vuid},{$set:{books:doc.books}});
           users.update({uid:vuid},{$inc:{newbooks:-1,readbooks:1}});
           ms.trouble=0;
           ms.bookstatus=1;
           res.send(ms); 
           console.log('changed books property');
          }
        }
      });
    }
  });
});


app.post('/addbook',function(req,res){
  console.log('adding a book');
  var ms = {};
  ms.trouble =1;
  //if(req.body.uid.length >30 || req.body.booktitle.length >30 ||req.body.newbook.length >30 || req.body.author.length >30 || req.body.star.length >30 || req.body.attention.length >30) {
  //  res.send(ms);
  //  return;
  //}
  if (req.session.mail ){
    var vuid = parseInt(req.body.uid);
    var vbooktitle = req.body.booktitle;
    var vnewbook = parseInt(req.body.newbook);
    console.log('breakpoint one');
    var vauthor = req.body.author;
    var vstar = parseInt(req.body.star);
    var vattention = parseInt(req.body.attention);
    console.log('ADDING A BOOK: vuid'+vuid+' ,booktitle:'+vbooktitle+' ,author: '+vauthor+' ,star: '+vstar+' ,attention '+vattention+', newbook'+vnewbook);
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
      //SEND ERROR
    }
    console.log('breakpoint three');
    if(!vauthor){
      vauthor = '--';
    }
    users.findOne({uid:vuid},function(err,doc){
      if(err) {
        res.send(ms);
      }
      else {
        var vbid = doc.totalbooks+1;
            users.update({uid:vuid},{$push:{books:{bid:vbid,author:vauthor,booktitle:vbooktitle,newbook:vnewbook,star:vstar,attention:vattention,regdateint:fulldate}}});
            if(vnewbook)
            {users.update({uid:vuid},{$inc:{newbooks:1,totalbooks:1}});}
            else {
              users.update({uid:vuid},{$inc:{readbooks:1,totalbooks:1}});
            }
            //friends.update({uid:vuid},{$set:{newb:1}});
            //ms.trouble=0;
            //ms.bid = vbid;
            //res.send(ms);
            friends.findOne({uid:vuid},function(err,done){
              console.log('1. query friedns list, got: '+JSON.stringify(done));
              if(err)
              {
              }
              else{
                if(done.updatelist)
                { console.log('2. query has updatelist: '+done.updatelist);
                  var updatearray=done.updatelist;
                                updatearray.forEach(function(element,index,array){
                                  console.log('3. Iterate through updatelist, element: '+element);
                                  friends.findOne({uid:element},function(err,fin){
                                    console.log('4. query for that id returned: '+JSON.stringify(fin));
                                    if(err){

                                    }
                                    else {
                                      var peoplearr = fin.people;
                                      console.log('5. People array in what have returned: '+JSON.stringify(peoplearr));
                                      peoplearr.forEach(function(element2,index2,array2){
                                        console.log('5.5 Iterating through peoplearr');
                                        console.log('vuid: '+vuid+', element2.uid: '+element2.uid);
                                        if(element2.uid===vuid) {
                                          console.log('6. Found an element in array with our id: '+JSON.stringify(element2));
                                          var newelem = element2;
                                          newelem.newb=1;
                                          console.log('7. Changed data and produced new element: '+JSON.stringify(newelem));
                                          console.log('7.5 index2: '+index2);
                                          if(peoplearr.length>1)
                                          {peoplearr.splice(index2,1);
                                          peoplearr.push(newelem);}
                                          else {
                                            peoplearr[0]=newelem;
                                          }
                                           console.log('8. Modified peoplearr to include changed element: '+JSON.stringify(peoplearr));
                                          friends.update({uid:element},{$set:{people:peoplearr}});
                                        }
                                      });
                                     //peoplearr.foreach
                                    }
                                  })
                                });
                  console.log('success ?');
                  ms.trouble=0;
                   ms.bid = vbid;
                   res.send(ms);
                }
                else
                {
                  console.log('there was no updatelist');
                  ms.trouble=0;
                  ms.bid = vbid;
                  res.send(ms);}
              }
            });
           }
    });
  }
    else {
      res.send(ms);
    }   
});

app.post('/addmovie',function(req,res){
 console.log('adding a movie');
  var ms = {};
  ms.trouble =1;
  //if(req.body.uid.length >30 || req.body.movietitle.length >30 ||req.body.newmovie.length >30 || req.body.year.length >30 || req.body.star.length >30 || req.body.attention.length >30) {
  //  res.send(ms);
  //  return;
  //}
  if (req.session.mail ){
    var vuid = parseInt(req.body.uid);
    var vmovietitle = req.body.movietitle;
    var vnewmovie = parseInt(req.body.newmovie);
    console.log('breakpoint one');
    var vmovieyear = req.body.year;
    var vmoviestar = parseInt(req.body.moviestar);
    var vmovieattention = parseInt(req.body.movieattention);
    console.log('ADDING A movie: vuid'+vuid+' ,movietitle:'+vmovietitle+' ,year: '+vmovieyear+' ,star: '+vmoviestar+' ,attention '+vmovieattention+', newmovie'+vnewmovie);
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

    if(!vmovietitle){
      vmovietitle = '--';
      //SEND ERROR
    }
    console.log('breakpoint three');
    if(!vmovieyear){
      vvmovieyear = '--';
    }
    users.findOne({uid:vuid},function(err,doc){
      if(err) {
        res.send(ms);
      }
      else {
        var vmid = parseInt(doc.totalmovies)+1;
            console.log(vmid);
            users.update({uid:vuid},{$push:{movies:{mid:vmid,year:vmovieyear,movietitle:vmovietitle,newmovie:vnewmovie,star:vmoviestar,attention:vmovieattention,regdateint:fulldate}}});
            if(vnewmovie)
            {users.update({uid:vuid},{$inc:{newmovies:1,totalmovies:1}});}
            else {
              users.update({uid:vuid},{$inc:{seenmovies:1,totalmovies:1}});
            }
            //friends.update({uid:vuid},{$set:{newm:1}});
            //ms.trouble=0;
            //ms.bid = vmid;
            //res.send(ms);
            friends.findOne({uid:vuid},function(err,done){
              if(err)
              {
              }
              else{
                if(done.updatelist)
                {var updatearray=done.updatelist;
                                updatearray.forEach(function(element,index,array){
                                  console.log(element);
                                  friends.findOne({uid:element},function(err,fin){
                                    if(err){

                                    }
                                    else {
                                      var peoplearr = fin.people;
                                      peoplearr.forEach(function(element2,index2,array2){
                                        if(element2.uid===vuid) {
                                          var newelem = element2;
                                          newelem.newm=1;
                                          peoplearr.splice(index2,1);
                                          peoplearr.push(newelem);
                                          console.log(JSON.stringify(newelem));
                                          friends.update({uid:element},{$set:{people:peoplearr}});
                                        }
                                      });
                                      ms.trouble=0;
                                      ms.mid = vmid;
                                      res.send(ms);
                                    }
                                  })
                                });}
                else
                {ms.trouble=0;
                 ms.bid = vmid;
                 res.send(ms);}
              }
            });
           }
    });
  }
    else {
      res.send(ms);
    }    
});

app.post('/modmovie',function(req,res){
  var ms={};
  ms.trouble=1;
  var rem = parseInt(req.body.rem);
  var vuid = parseInt(req.body.uid);
  var vmid = parseInt(req.body.mid);
  //if(!rem||!vuid||!vmid) {
  //  ms.mtext='db';
  //  res.send(ms);
  //  return;
  //}
  console.log('rem: '+rem+',vuid: '+vuid+', vmid: '+vmid);
  users.findOne({uid:vuid},function(err,doc){
    if(err){
       ms.mtext='db';
       res.send(ms);
    }
    else {
      doc.movies.forEach(function(element,index,array){
        if(element.mid===vmid) {
          var moviestatus;
          if(rem){
            moviestatus = element.newmovie;
           doc.movies.splice(index, 1);
           users.update({uid:vuid},{$set:{movies:doc.movies}});
           users.update({uid:vuid},{$inc:{totalmovies:-1}});
           if(element.newmovie===1){
            users.update({uid:vuid},{$inc:{newmovies:-1}});
           }
           else {
            users.update({uid:vuid},{$inc:{seenmovies:-1}});
           }
           ms.trouble=0;
           ms.moviestatus=moviestatus;
           res.send(ms);
           console.log('removed a movie;');
          }
          else {
           element.newmovie=0;
           users.update({uid:vuid},{$set:{movies:doc.movies}});
           users.update({uid:vuid},{$inc:{newmovies:-1,seenmovies:1}});
           ms.trouble=0;
           ms.moviestatus=1;
           res.send(ms); 
           console.log('changed movies property');
          }
        }
      });
    }
  });
});

app.get('/register',function(req,res){
 res.render('register');
});

app.post('/newuser',function(req,res){
    var ms = {};
    ms.trouble=1;
    ms.mtext='email incorrect';
    var vmail = req.body.mail; 
    if(req.body.p.length >30 || req.body.mail.length>30) {
      ms.mtext('fail');
      res.send(ms);
      return;
    }
    var vp = bcrypt.hashSync(req.body.p,bcrypt.genSaltSync(10));
    var ms = {};
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
            //lgn:vu
          users.insert({pub:0,styleint:1,mail:vmail,uid:vuid,phr:vp,totalbooks:0,totalmovies:0,newbooks:0,readbooks:0,newmovies:0,seenmovies:0,regdateint:fulldate,regdate:{year:vyear,month:vmonth,day:vday}});
          friends.insert({uid:vuid,mail:vmail});
          req.session.mail=vmail;
          ms.trouble =0;
          ms.mtext='success';
          res.send(ms);
          //users.findOne({mail:vmail},function(err,docdoc){
          //  console.log('FOUND AFTER INSERTING NEW USER :'+JSON.stringify(docdoc));
          //  if (err){
          //    //DO SMTH
          //  }
          //  else{
          //     if (docdoc) {
          //      req.session = docdoc;
          //      delete req.session.phr;
          //      ms.trouble =0;
          //      ms.mtext='success';
          //      // INDEX MUST BE DIFFERENT FOR REGISTERD ONES, IT IS TEMPORARY THE SAME
          //      console.log('SOMEBODY REGISTERED');
          //      res.send(ms);
          //     }
          //     else {
          //        ms.mtext ='fail';
          //        res.send(ms);
          //     }
          //  }
          //});
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
          
          req.session.mail = confirmed.mail;
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
  console.log('----- ON / ROUTE:'+JSON.stringify(req.session));
  var userAgent=req.headers['user-agent'];
  var uacheck = userAgent.indexOf("iPhone") != -1 ;
  console.log(uacheck);
   if (req.session.mail)
        //{res.render('indexreg',{'prfname':"Привет, "+req.session.lgn+"!"});}
        { console.log(req.session);
          users.findOne({mail:req.session.mail},function(err,done){
            console.log('-----found-----');
            console.log(done);
            if(err){
              //err page ?
              res.render('index');
            }
            else {
              if(done){
                  console.log('----------'+done.styleint+'-----------');
                    if(!done.books&&!done.movies)
                      {//res.render('emptyindexreg',{'uid':done.uid});
                      var style='';
                      //var style1 = "'mh':'#FAB142','bh':'#52CA8F','mhl':'#FAC26C','bhl':'rgb(123, 226, 175)',";
                      //var style2 = "'mh':'rgb(213, 74, 95)','bh':'#00788E','mhl':'#F56B80','bhl':'rgb(0, 176, 208)',";
                      //var style3 = "'mh':'#00657C','bh':'rgb(0, 182, 205);','mhl':'#003945','bhl':'rgb(82, 214, 231)',";
                      var style1 = "'bcl':'white','mcl':'white','mh':'#FAB142','bh':'#52CA8F','mhl':'#FAC26C','bhl':'rgb(123, 226, 175)','yet':'color:white','small':'color:white;opacity: 0.68;','spanop':'0.3','headingsspanop':'0.3','addbook':'rgba(255, 255, 255, 0.38)','addmovie':'rgba(255, 255, 255, 0.38)',";
                      var style2 = "'bcl':'white','mcl':'white','mh':'rgb(213, 74, 95)','bh':'#00788E','mhl':'#F56B80','bhl':'rgb(0, 176, 208)','yet':'color:white','small':'color:white;opacity: 0.68;','spanop':'0.3','headingsspanop':'0.3','addbook':'rgba(255, 255, 255, 0.38)','addmovie':'rgba(255, 255, 255, 0.38)',";
                      var style3 = "'bcl':'white','mcl':'white','mh':'#00657C','bh':'rgb(0, 182, 205);','mhl':'#003945','bhl':'rgb(82, 214, 231)','yet':'color:white','small':'color:white;opacity: 0.68;','spanop':'0.3','headingsspanop':'0.3','addbook':'rgba(255, 255, 255, 0.38)','addmovie':'rgba(255, 255, 255, 0.38)',";
                      var style4 = "'bcl':'rgb(103, 186, 255)','mcl':'#F56979','mh':'white','bh':'white','mhl':'#F56979','bhl':'rgb(103, 186, 255)','yet':'0:0','small':'0:0','spanop':'0.1','headingsspanop':'0.3','addbook':'rgba(103, 186, 255, 0.63)','addmovie':'rgba(245, 105, 121, 0.65)',";
                      var style5 = "'bcl':'white','mcl':'white','mh':'#2e83b0','bh':'#2e83b0','mhl':'#F56979','bhl':'rgb(103, 186, 255)','yet':'color:white','small':'color:white;opacity:0.5;','spanop':'0.1','headingsspanop':'0.3','addbook':'rgba(103, 186, 255, 0.63)','addmovie':'rgba(245, 105, 121, 0.83)',";

                      if(done.styleint===1){
                        style=style1;
                      }
                      if(done.styleint===2){
                        style=style2;
                      }
                      if(done.styleint===3){
                        style=style3;
                      }
                      if(done.styleint===4){
                        style=style4;
                      }
                      if(done.styleint===5){
                        style=style5;
                      }
                       //res.render('newemptyindexreg',{'uid':done.uid,'newbooks':0,'readbooks':0,'newmovies':0,'seenmovies':0});
                       eval("res.render('newemptyindexreg',{"+style+"'uid':done.uid,'newbooks':0,'readbooks':0,'newmovies':0,'seenmovies':0});");
                      }
                    else{
                      var booksvar = JSON.stringify(done.books);
                      if(!booksvar) {
                        booksvar =0;
                      }
                      var moviesvar = JSON.stringify(done.movies);
                      if(!moviesvar) {
                        moviesvar =0;
                      }
                      var style='';
                      var style1 = "'bcl':'white','mcl':'white','mh':'#FAB142','bh':'#52CA8F','mhl':'#FAC26C','bhl':'rgb(123, 226, 175)','yet':'color:white','small':'color:white;opacity: 0.68;','spanop':'0.3','headingsspanop':'0.3','addbook':'rgba(255, 255, 255, 0.38)','addmovie':'rgba(255, 255, 255, 0.38)',";
                      var style2 = "'bcl':'white','mcl':'white','mh':'rgb(213, 74, 95)','bh':'#00788E','mhl':'#F56B80','bhl':'rgb(0, 176, 208)','yet':'color:white','small':'color:white;opacity: 0.68;','spanop':'0.3','headingsspanop':'0.3','addbook':'rgba(255, 255, 255, 0.38)','addmovie':'rgba(255, 255, 255, 0.38)',";
                      var style3 = "'bcl':'white','mcl':'white','mh':'#00657C','bh':'rgb(0, 182, 205);','mhl':'#003945','bhl':'rgb(82, 214, 231)','yet':'color:white','small':'color:white;opacity: 0.68;','spanop':'0.3','headingsspanop':'0.3','addbook':'rgba(255, 255, 255, 0.38)','addmovie':'rgba(255, 255, 255, 0.38)',";
                      var style4 = "'bcl':'rgb(103, 186, 255)','mcl':'#F56979','mh':'white','bh':'white','mhl':'#F56979','bhl':'rgb(103, 186, 255)','yet':'0:0','small':'0:0','spanop':'0.1','headingsspanop':'0.3','addbook':'rgba(103, 186, 255, 0.63)','addmovie':'rgba(245, 105, 121, 0.65)',";
                      var style5 = "'bcl':'white','mcl':'white','mh':'#2e83b0','bh':'#2e83b0','mhl':'#F56979','bhl':'rgb(103, 186, 255)','yet':'color:white','small':'color:white;opacity:0.5;','spanop':'0.1','headingsspanop':'0.3','addbook':'rgba(103, 186, 255, 0.63)','addmovie':'rgba(245, 105, 121, 0.83)',";

                      if(done.styleint===1){
                        style=style1;
                      }
                      if(done.styleint===2){
                        style=style2;
                      }
                      if(done.styleint===3){
                        style=style3;
                      }
                      if(done.styleint===4){
                        style=style4;
                      }
                      if(done.styleint===5){
                        style=style5;
                      }
                    eval("res.render('indexreg',{"+style+"'mail':done.mail,'books':booksvar,'movies':moviesvar,'uid':done.uid,'newbooks':done.newbooks,'readbooks':done.readbooks,'newmovies':done.newmovies,'seenmovies':done.seenmovies});");
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
  if(req.session.mail)
  {users.findOne({mail:req.session.mail},function(err,done){
              if(err){
                res.redirect('/');
              }
              else {
                if(done){
                  var checkbox ='';
                  switch(done.styleint) {
                    case(1):
                     checkbox='first';
                    break
                    case(2):
                     checkbox='second';
                    break
                    case(3):
                     checkbox='third';
                    break
                    case(4):
                     checkbox='fourth';
                    break
                  }
                  res.render('newsettings',{'mail':done.mail,'uid':done.uid,'checkbox':checkbox,'pub':done.pub});
                }
                else{
                  res.redirect('/');
                }
              }

      });
}
      else {
        res.redirect('/');
      }
});

app.post('/settings/cc',function(req,res){
  if(req.session.mail)
   {console.log('going to change a color');
    var vuid = parseInt(req.body.uid);
    var vstyle = parseInt(req.body.stylenum);
    console.log(vuid+" "+vstyle);
     users.update({uid:vuid},{$set:{styleint:vstyle}});
     var ms = {};
     ms.trouble = 0;
     res.send(ms);
    }
  else {
    res.redirect('/')
  }

});

app.post('/addfriend',function(req,res){
  var friendid = parseInt(req.body.uid);
  if(req.session.mail){
    var ms={};
                 ms.trouble=1;
                 ms.mtext='db';
    users.findOne({uid:friendid},function(err,done){
      if(err)
      {
      res.send(ms);
      }
      else {
        if(done.uid)
        {
          var person ={};
                person.uid=friendid;
                person.mail=done.mail;
                person.totalbooks= done.totalbooks;
                person.totalmovies= done.totalmovies;
                if(person.totalbooks!=0)
                 {person.newb =1;}
                else {
                  person.newb =0;
                }
                if(person.totalmovies!=0)
                 {person.newm =1;}
                else {
                  person.newm =0;
                }
                 friends.update({mail:req.session.mail},{$push:{people:person}});
                 users.findOne({mail:req.session.mail},function(err,doc){
                  if(err){

                  }
                  else {
                    if(doc){
                      friends.update({uid:friendid},{$push:{updatelist:doc.uid}});
                      ms.trouble=0;
                     res.send(ms);
                    }
                    else {

                    }
                  }
                 });
        }
      else 
      {
        //away
      }
      }
    });
  }
  else {

  }
});

app.post('/remfriend',function(req,res){
  var friendid = parseInt(req.body.uid);
  if(req.session.mail){
    var ms={};
    ms.trouble=1;
    ms.mtext='db';
    friends.findOne({mail:req.session.mail},function(err,done){
      if(err)
      {
      res.send(ms);
      }
      else {
        if(done.uid)
        {
          var peoplearr  = done.people;
          var remindex;
             peoplearr.forEach(function(element,index,array){
               if(element.uid===friendid){
                remindex=index;
              }
               });
             peoplearr.splice(remindex, 1);
             friends.update({mail:req.session.mail},{$set:{people:peoplearr}});
             friends.findOne({uid:friendid},function(err,doc){
              if(err){

              }
              else {
                if(doc.updatelist)
                 { updatelistarr = doc.updatelist;
                   var remindex;
                  updatelist.forEach(function(element,index,array){
                    if(element===friendid){
                      remindex=index;
                    }
                  });
                    updatelistarray.splice(remindex,1);
                    friends.update({uid:friendid},{$set:{updatelist:updatelistarr}});
                    ms.trouble=0;
                 res.send(ms);
              }
              else {
                ms.trouble=0;
              res.send(ms);
              }
            }
             });
            
        }
      else 
      {
        //away
      }
      }
    });
  }
  else {

  }
});

app.get('/friends/:uid',function(req,res){
  var vuid = parseInt(req.params.uid);
  friends.findOne({uid:vuid},function(err,done){
    res.send(JSON.stringify(done));
  });
});


app.post('/settings/pc',function(req,res){
  if(req.session.mail)
   {console.log('going to change public avaliability');
    var vuid = parseInt(req.body.uid);
    var vpub = parseInt(req.body.pub);
    console.log(vuid+" "+vpub);
     users.update({uid:vuid},{$set:{pub:vpub}});
     var ms = {};
     ms.trouble = 0;
     res.send(ms);
    }
  else {
    res.redirect('/')
  }

});



app.get('/people',function(req,res){
  if(req.session.mail)
  {users.findOne({mail:req.session.mail},function(err,done){
              if(err){
                res.redirect('/');
              }
              else {
                if(done){
                  friends.findOne({mail:req.session.mail},function(err,donetwo){
                    if(err){

                    }
                    else {
                      if(donetwo.people)
                      {
                       res.render('people',{'mail':done.mail,'uid':done.uid,'people':JSON.stringify(donetwo.people)});
                      }
                      else {
                         res.render('people',{'mail':done.mail,'uid':done.uid,'people':0});
                      }
                    }
                  });
                }
                else{
                  res.redirect('/');
                }
              }

      });
}
      else {
        res.redirect('/');
      }
});


app.get('/m',function(req,res){
        console.log('---------going to render midexes----------');
        if (req.session.mail != undefined )
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
                     if(!done.books&&!done.movies)
                      {//res.render('emptyindexreg',{'uid':done.uid});
                       var style;
                       var style1 = "'bcl':'white','mcl':'white','mh':'#FAB142','bh':'#52CA8F','mhl':'#FAC26C','bhl':'rgb(123, 226, 175)','yet':'color:white','small':'color:white;opacity: 0.68;','spanop':'0.3','headingsspanop':'0.3','addbook':'rgba(255, 255, 255, 0.38)','addmovie':'rgba(255, 255, 255, 0.38)',";
                      var style2 = "'bcl':'white','mcl':'white','mh':'rgb(213, 74, 95)','bh':'#00788E','mhl':'#F56B80','bhl':'rgb(0, 176, 208)','yet':'color:white','small':'color:white;opacity: 0.68;','spanop':'0.3','headingsspanop':'0.3','addbook':'rgba(255, 255, 255, 0.38)','addmovie':'rgba(255, 255, 255, 0.38)',";
                      var style3 = "'bcl':'white','mcl':'white','mh':'#00657C','bh':'rgb(0, 182, 205);','mhl':'#003945','bhl':'rgb(82, 214, 231)','yet':'color:white','small':'color:white;opacity: 0.68;','spanop':'0.3','headingsspanop':'0.3','addbook':'rgba(255, 255, 255, 0.38)','addmovie':'rgba(255, 255, 255, 0.38)',";
                      var style4 = "'bcl':'rgb(103, 186, 255)','mcl':'#F56979','mh':'white','bh':'white','mhl':'#F56979','bhl':'rgb(103, 186, 255)','yet':'0:0','small':'0:0','spanop':'0.1','headingsspanop':'0.3','addbook':'rgba(103, 186, 255, 0.63)','addmovie':'rgba(245, 105, 121, 0.65)',";
                      var style5 = "'bcl':'white','mcl':'white','mh':'#2e83b0','bh':'#2e83b0','mhl':'rgb(255, 119, 95)','bhl':'rgb(0, 142, 184)','yet':'color:white','small':'color:white;opacity:0.5;','spanop':'0.1','headingsspanop':'0.3','addbook':'rgba(103, 186, 255, 0.63)','addmovie':'rgba(245, 105, 121, 0.83)',";

                      if(done.styleint===1){
                        style=style1;
                      }
                      if(done.styleint===2){
                        style=style2;
                      }
                      if(done.styleint===3){
                        style=style3;
                      }
                      if(done.styleint===4){
                        style=style4;
                      }
                      if(done.styleint===5){
                        style=style5;
                      }
                       eval("res.render('emptymindexreg',{"+style+"'uid':done.uid,'newbooks':0,'readbooks':0,'newmovies':0,'seenmovies':0});");

                      }
                    else{
                      var booksvar = JSON.stringify(done.books);
                      if(!booksvar) {
                        booksvar =0;
                      }
                      var moviesvar = JSON.stringify(done.movies);
                      if(!moviesvar) {
                        moviesvar =0;
                      }
                      var style;
                       var style1 = "'bcl':'white','mcl':'white','mh':'#FAB142','bh':'#52CA8F','mhl':'#FAC26C','bhl':'rgb(123, 226, 175)','yet':'color:white','small':'color:white;opacity: 0.68;','spanop':'0.3','headingsspanop':'0.3','addbook':'rgba(255, 255, 255, 0.38)','addmovie':'rgba(255, 255, 255, 0.38)',";
                      var style2 = "'bcl':'white','mcl':'white','mh':'rgb(213, 74, 95)','bh':'#00788E','mhl':'#F56B80','bhl':'rgb(0, 176, 208)','yet':'color:white','small':'color:white;opacity: 0.68;','spanop':'0.3','headingsspanop':'0.3','addbook':'rgba(255, 255, 255, 0.38)','addmovie':'rgba(255, 255, 255, 0.38)',";
                      var style3 = "'bcl':'white','mcl':'white','mh':'#00657C','bh':'rgb(0, 182, 205);','mhl':'#003945','bhl':'rgb(82, 214, 231)','yet':'color:white','small':'color:white;opacity: 0.68;','spanop':'0.3','headingsspanop':'0.3','addbook':'rgba(255, 255, 255, 0.38)','addmovie':'rgba(255, 255, 255, 0.38)',";
                      var style4 = "'bcl':'rgb(103, 186, 255)','mcl':'#F56979','mh':'white','bh':'white','mhl':'#F56979','bhl':'rgb(103, 186, 255)','yet':'0:0','small':'0:0','spanop':'0.1','headingsspanop':'0.3','addbook':'rgba(103, 186, 255, 0.63)','addmovie':'rgba(245, 105, 121, 0.65)',";
                      var style5 = "'bcl':'white','mcl':'white','mh':'#2e83b0','bh':'#2e83b0','mhl':'rgb(255, 119, 95)','bhl':'rgb(0, 142, 184)','yet':'color:white','small':'color:white;opacity:0.5;','spanop':'0.1','headingsspanop':'0.3','addbook':'rgba(103, 186, 255, 0.63)','addmovie':'rgba(245, 105, 121, 0.83)',";

                      if(done.styleint===1){
                        style=style1;
                      }
                      if(done.styleint===2){
                        style=style2;
                      }
                      if(done.styleint===3){
                        style=style3;
                      }
                      if(done.styleint===4){
                        style=style4;
                      }
                      if(done.styleint===5){
                        style=style5;
                      }
                    eval("res.render('mindexreg',{"+style+"'books':booksvar,'movies':moviesvar,'uid':done.uid,'newbooks':done.newbooks,'readbooks':done.readbooks,'newmovies':done.newmovies,'seenmovies':done.seenmovies});");
                  }  
                    
                 
              }
              else {
                //do a mistake template
                console.log('!DONE');
                res.render('newmindex');
              }
            }
          });
        }
   else {
  res.render('newmindex');}
  });

app.get('/m/people',function(req,res){
  if(req.session.mail)
  {users.findOne({mail:req.session.mail},function(err,done){
              if(err){
                res.redirect('/');
              }
              else {
                if(done){
                  friends.findOne({mail:req.session.mail},function(err,donetwo){
                    if(err){

                    }
                    else {
                      if(donetwo.people)
                      {
                       res.render('mpeople',{'mail':done.mail,'uid':done.uid,'people':JSON.stringify(donetwo.people)});
                      }
                      else {
                         res.render('mpeople',{'mail':done.mail,'uid':done.uid,'people':0});
                      }
                    }
                  });
                }
                else{
                  res.redirect('/');
                }
              }

      });
}
      else {
        res.redirect('/');
      }
});

app.get('/m/settings',function(req,res){
  if(req.session.mail)
  {users.findOne({mail:req.session.mail},function(err,done){
              if(err){
                res.redirect('/');
              }
              else {
                if(done){
                  var checkbox ='';
                  switch(done.styleint) {
                    case(1):
                     checkbox='first';
                    break
                    case(2):
                     checkbox='second';
                    break
                    case(3):
                     checkbox='third';
                    break
                    case(4):
                     checkbox='fourth';
                    break
                    case(5):
                     checkbox='fifth';
                    break
                  }
                  res.render('msettings',{'mail':done.mail,'uid':done.uid,'checkbox':checkbox,'pub':done.pub});
                }
                else{
                  res.redirect('/');
                }
              }

      });
}
      else {
        res.redirect('/');
      }
});

app.get('/m/about',function(req,res){
  if(req.session.mail){
    res.render('mabout');
  }
  else
  {res.render('maboutout');
 }
})

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
  console.log("CHECKING COOKIES: "+JSON.stringify(req.session));
  var lguser={};
   if(req.session.sKK76d === 'porC6S78x0XZP1b2p08zGlq')
   {
   users.count({},function(err,c){
    if (err)
    {
      res.send('DB ERR')
    }
  else {
    friends.count({},function(err,d){
      if(err)
      {
         res.send('DB ERR');
      }
      else {
        if(messagescount)
    {
       var messages = getmessages;
      res.render('admin',{'users':c,'friends':d,'doc':messages});
     }
     else {
      res.render('adminzeromsg',{'users':c,'friends':d});
     }
      }

    });

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

app.get('/admin/friendlist',function(req,res){
  if(req.ip === '188.226.189.180'  || req.session.sKK76d === 'porC6S78x0XZP1b2p08zGlq')
  {
    friends.find({},function(err,doc){
    if(err)
    {
      res.send('DB ERR')
    }
    else {
      if(doc.length>0)
      {  
         console.log(doc);
         res.render('friendlist',{'doc':doc});
      }
      else{
         res.send('NO friends - EMPTY DB');
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
      friends.remove({});
     console.log('USERS DB DROPPED FROM '+ req.ip);
     req.session.reset();
     res.redirect('http://peopleandbooks.com/admax');}
    else {
      res.redirect('http://peopleandbooks.com');
    }
  }
  else {
    res.redirect('http://peopleandbooks.com');
  }
});

app.post('/admin/1/:uid',function(req,res){
  var pas = req.body.uu;
  if (pas != 'withoutthesecurity') {
    res.redirect('http://recentones.com');
  }
  else 
  {var vuid = parseInt(req.params.uid);
    var ms={};
    ms.trouble=1;
    ms.mtext = 'db';
    users.remove({uid:vuid},function(err,done){
      if(err){
        res.send(ms);
      }
      else {
        friends.remove({uid:vuid},function(err,done){
      if(err){
        res.send(ms);
      }
      else {
        ms.trouble=0;
        res.send(ms);
      }
    });
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