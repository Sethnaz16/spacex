var express = require('express');
var app = express();
var fetch = require('node-fetch');
//var nock = require('nock'); // for testing
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
var global;
var flightMap = new Map();


// Class to create object
class Flight {
    constructor(id, year, date, name, type, location, pType, pMass, detail, aLink, vLink){
        this.id = id;
        this.year = year;
        this.date = date;
        this.name = name;
        this.type = type;
        this.location = location;
        this.pType = pType;
        this.pMass = pMass;
        this.detail = detail;
        this.aLink = aLink;
        this.vLink = vLink;
    }
}

// Fetch
fetch('https://api.spacexdata.com/v1/launches')
    .then((res) => {
    return res.json();  
}).then((json) => {
    global = json;
});

// Set timeout
setTimeout(function(){
    global.forEach(function(item){
        let flight = new Flight(item.flight_number, item.launch_year, item.launch_date_utc, item.rocket.rocket, item.rocket.rocket_type, item.launch_site.site_name, item.payloads[0].payload_type, item.payloads[0].payload_mass_kg, item.details, item.links.article_link, item.links.video_link);
        flightMap.set(item.flight_number, flight);
    });
}, 2000);

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
  res.render('pages/index');
});

app.get('/launches', function(req, res) {
  var myArray = [];
  for(var i = 0; i <= flightMap.size; i++){
      myArray.push(flightMap.get(i));
  }
    
  res.send(myArray);
  //res.send(global);
});

//Update
app.put('/update/:id', function(req, res){
   let id = parseInt(req.params.id);
   let flight = new Flight(id, req.body.year, req.body.date, req.body.name, req.body.type, req.body.location, req.body.pType, req.body.pMass, req.body.aLink, req.body.vLink);
    
   flightMap.set(id, flight);
   res.redirect('/launches');
});

// Post to create
app.post('/add', function(req, res){
    let id = flightMap.size + 1; 
    let flight = new Flight(id, req.body.year, req.body.date, req.body.name, req.body.type, req.body.location, req.body.pType, req.body.pMass, req.body.aLink, req.body.vLink);
    
    flightMap.set(id, flight);
    res.redirect('/launches');
});

// Delete to delete
app.delete('/remove/:id', function(req, res){
    let id = parseInt(req.params.id);
    flightMap.delete(id);
    res.redirect('/launches');
});

// By id
app.get('/launches/:id', function(req, res) {
  let id = parseInt(req.params.id);
  res.send(flightMap.get(id));
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
