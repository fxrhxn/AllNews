var request = require('request');
var cheerio = require('cheerio');
var express = require('express');
var app = express();

var url = [{
  title : String,
  link : String
}];



request('https://www.yahoo.com/news/us/', function(err,resp,body){

  if(!err && resp.statusCode == 200){

    var $ = cheerio.load(body);
//zn__column--idx-1
//console.log($);
$('a', '.js-stream-content').each(function(){

      var url2 = $(this).attr('href');
      var text2 = $(this).text();

    url.push({
      title : text2,
     link : url2
   });
console.log(url);

   });
  }
});


 app.set('view engine', 'ejs');
 app.get('/', function(req,res){
console.log(url.length);
console.log(url);
   res.render('deleteLater', {url : url});
 });


app.listen('3000', function(){
  console.log('Listening on PORT 3000');
});



 //
