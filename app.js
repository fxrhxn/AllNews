var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var scrapeIt = require("scrape-it");
var Xray = require('x-ray');
var x = Xray();
var request = require('request');
var cheerio = require('cheerio');
var shuffle = require('shuffle-array');
var methodOverride = require('method-override');
//Create a Schema Variable.
var Schema = mongoose.Schema;

//Connect to mongoose.
mongoose.connect('mongodb://localhost/NewsAPP');

//Schema for the Articles.
var ArticleSchema = new Schema({

  articles : [{
    link : String,
    title : String
  }]

});



var Articles = mongoose.model('Article', ArticleSchema);



//All of the News arrays that will hold our information.
var allNews = [{
  link : String,
  title : String
}];

var dailyNews = [{
  link : String,
  title : String
}];

var cnn = [{
  link : String,
  title : String
}];

var yahoo = [{
  link : String,
  title : String
}];

var chan7 = [{
  link : String,
  title : String
}];


  //Other NPM packages you can use to scrape websites.

//   scrapeIt("http://www.nydailynews.com/", {
//         title: "div h3"
//   },  (err, page) => {
//
//     if(err){
//       console.log(err);
//       res.redirect('/home');
//
//     }else{
//
// var title = page.title.split("    ");
//
//     //Function that prints out the articles titles.
//       function printThing(){
//         var a = page.title.split("    ");
//
//        console.log(a);
//
//       }
//             //Console.log to check if your Scraping worked.
//         setTimeout(printThing, 3000);
//
//   //  res.render('test', {title : title});
//
//     }
//
//   });

  //Here is a more decent package for Web Scraping. It has quite fewer/0 bugs, and just works.
  //
  // x('http://www.nydailynews.com/', 'body', [{
  //   title: 'div h3',
  // }])
  //   .paginate('.next_page@href')
  //   .limit(3)
  //   .write('new2.json');
  //


//===============  DAILY NEWS BRANCH ========================//
  request('http://www.nydailynews.com/', function(err,resp,body){

    if(!err && resp.statusCode == 200){

      var $ = cheerio.load(body);

      $( 'div h3 a', '#content_container').each(function(){

        var url = $(this).attr('href');
        var text = $(this).text();
        dailyNews.push({
          link : url,
          title : text
           });
        });
      }
   });


//===============  DAILY NEWS BRANCH ========================//


//===============  CNN NEWS BRANCH ========================//

request('http://www.cnn.com/', function(err,resp,body){

  if(!err && resp.statusCode == 200){

    var $ = cheerio.load(body);
//zn__column--idx-1
$( 'a', '.column').each(function(){

      var url2 = $(this).attr('href');
      var text2 = $(this).text();

    cnn.push({
      link : 'http://www.cnn.com' + url2,
      title : text2
    });
   });
  }
});

//===============  CNN NEWS BRANCH ========================//


//===============  YAHOO BRANCH ========================//

request('https://www.yahoo.com/news/us/', function(err,resp,body){

  if(!err && resp.statusCode == 200){

    var $ = cheerio.load(body);
//zn__column--idx-1
$('a', '.js-stream-content').each(function(){

      var url3 = $(this).attr('href');
      var text3 = $(this).text();

    yahoo.push({
      link : 'https://www.yahoo.com/' + url3,
      title : text3
    });

   });
  }
});

//===============  YAHOO NEWS BRANCH ========================//


//Takes out the 0 element. Do this for EVERY Array passing through.
dailyNews.shift();
cnn.shift();
yahoo.shift();

var savedlength;
var allSavedArticles;

Articles.find({}, function(err,body){
  if(err){
    console.log(err);
  }else{
    //console.log(body);
    //console.log(body.length);
    savedlength = body.length;
    allSavedArticles = body;
  }
});

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride('_method'));

app.get('/', function(req,res){

  Articles.find({}, function(err,body){
    if(err){
      console.log(err);
    }else{
    //  console.log(body);
    //  console.log(body.length);
      savedlength = body.length;

    }

    if(savedlength === 0){
      console.log('HAHAHAHAH ITS 0');
      //Merge in ALL of the arrays into newArray
       var newArray = dailyNews.concat(cnn);
       var newerArray = newArray.concat(yahoo);

     //Randomizes the Array. Why? I was bored.
      var newerArray2 = shuffle(newerArray);

    //See the length.
      console.log(newerArray2.length);


      //Prints out the news in the html.
         res.render('index', {titles : newerArray2, Articles : Articles, savedlength : 0});

    }else{
      res.redirect('/home')

    }

  });

});

app.get('/home', function(req,res){

  //Merge in ALL of the arrays into newArray
   var newArray = dailyNews.concat(cnn);
   var newerArray = newArray.concat(yahoo);

 //Randomizes the Array. Why? I was bored.
  var newerArray2 = shuffle(newerArray);

//See the length.
  console.log(newerArray2.length);

  //Prints out the news in the html.
     res.render('index', {titles : newerArray2, Articles : Articles, savedlength : savedlength});

});

app.listen('3000', function(){
  console.log('Listening On Port 3000');
});

//Below code lets you put the href, and the title in the url, so you can print that shit out in a variable, and but that inside of a database.
app.get('/save/:href(*)/:title', function(req,res){
var linkSaved = req.params.href;
var titleSaved = req.params.title;

var newTest = Articles({

articles : [{
  link : linkSaved,
  title : titleSaved
}]

}).save(function(err,body){
  if (err) return console.error(err);

console.log(body);

});

  res.redirect('/')
});

app.get('/savedArticles', function(req,res){

  Articles.find({}, function(err,body){
    if(err){
      console.log(err);
    }else{
      //console.log(body);
      //console.log(body.length);
      savedlength = body.length;
      allSavedArticles = body;
    }

res.render('saved', { body : body });

  });

});

app.get('/deleteid/:id', function(req,res){
var deleteID = req.params.id;
console.log(deleteID);
  Articles.remove({ title : req.params.id}, function(err,body){
    if(err){
      console.log(err);
    }else{
      res.redirect('/savedArticles');
    }
  });
});

app.get('/clearAll', function(req,res){
  //This below is what clears the database

  Articles.remove({}, function(err){
    if(err){
      console.log(err);
    }else{
      console.log('REMOVED');
      res.redirect('/');
    }
  });

});





////
