const express = require('express');
const app = express();
const fetch = require('node-fetch');
//const nock = require('nock'); // for testing
let global;

var flightMap = new Map();

class Flight {
    constructor(id, year, date, name, type, location, pType, pMass, detail){
        this.id = id;
        this.year = year;
        this.date = date;
        this.name = name;
        this.type = type;
        this.location = location;
        this.pType = pType;
        this.pMass = pMass;
        this.detail = detail;
    }
    
}

fetch('https://api.spacexdata.com/v1/launches')
    .then((res) => {
    return res.json();  
}).then((json) => {
    global = json;
});

setTimeout(function(){ 
    global.forEach(function(item){
        let flight = new Flight(item.flight_number, item.launch_year, item.launch_date_utc, item.rocket.rocket, item.rocket.rocket_type, item.launch_site.site_name, item.payloads.payload_type, item.payloads.payload_mass_kg, item.details);
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
  for(var i = 0; i < flightMap.size; i++){
      myArray.push(flightMap.get(i));
  }
    
  res.send(JSON.stringify(myArray, null, 4));
});

app.get('/launches/:id', function(req, res) {
  let id = parseInt(req.params.id);
  res.send(flightMap.get(id));
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
