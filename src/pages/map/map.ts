import { Component, NgZone, OnInit } from "@angular/core/";
import { connect, Client } from 'mqtt';
import { HTTP } from '@ionic-native/http';
import _ from "lodash";
import { GoogleMap, GoogleMapsEvent, Marker, GoogleMapOptions, GoogleMaps, HtmlInfoWindow } from '@ionic-native/google-maps';
import { Geolocation } from "@ionic-native/geolocation";

@Component({
  selector: 'page-map',
  templateUrl: 'map.html'
})
export class MapPage implements OnInit {
  map:GoogleMap;
  
  //setting a random center for the map to initialize to 
  dubai_airport = { lat: 25.2532, lng: 55.3657 };

  //setting a custom icon for the bins
  icon='../../assets/imgs/bin.png';
  pins; //the array for locations
  bins; //the array for bins
  show = false;
  bin_list = []; //an array with the bin object and a show flag for each to display when the mouse hovers over
  client:Client;  //mqtt client
  zone:any;
  lat:number;
  lng:number;

  //the constructor
  constructor(private http: HTTP,private geolocation: Geolocation) { 
    //initializing the angular zone to render live changes of class variables without refreshing
    this.zone = new NgZone({ enableLongStackTrace: false });

    //creating an mqtt client and connecting to hivemq through websockets
    this.client = connect('mqtt://broker.hivemq.com/mqtt',{port:8000});

    //function which will be called when the connection is made
    this.client.on('connect', ()=>{
      console.log('connected to mqtt broker');
      // this.mqtt_connected = true;
    });

    //callback function when mqtt message is received
    this.client.on('message', (topic: string, payload: string) => {
      console.log(`message from ${topic}: ${payload}`);
      //parsing the stringified JSON payload received
      var newLocation = JSON.parse(payload);
      //adding the new location to the marked locations array
      this.pins.push(newLocation);
    });
   }
  
  //initialization logic when the component is created
  ngOnInit() {
    this.geolocation.getCurrentPosition().then((resp) => {
      this.lat = resp.coords.latitude
      this.lng = resp.coords.longitude
      console.log('Latitude:'+this.lat+":Longitude:"+this.lng);
      let mapOptions: GoogleMapOptions = {
        camera: {
           target: {
             lat: this.lat,
             lng: this.lng
           },
           zoom: 12,
           tilt: 30
         }
      };
  
      this.map = GoogleMaps.create('map', mapOptions);
      //subscribing to the topic new litter when a user uses smart watch to mark a new location as littered it will show up on the browser
      this.client.subscribe('trashmanage/newlitter');
      let marker: Marker = this.map.addMarkerSync({
        title: 'You are here!',
        icon: 'blue',
        animation: 'DROP',
        position: {
          lat: this.lat,
          lng: this.lng
        }
      });
      let htmlInfoWindow = new HtmlInfoWindow();

      let frame: HTMLElement = document.createElement('div');
      frame.innerHTML = [
        '<h3>Your current location</h3>'
      ].join("");
      frame.getElementsByTagName("h3")[0].addEventListener("click", () => {
        htmlInfoWindow.setBackgroundColor('red');
      });
      htmlInfoWindow.setContent(frame, {
        width: "280px",
        height: "330px"
      });

      htmlInfoWindow.open(marker);

      console.log('Inside init');
      //initializing the bins array with all bins from the database
      this.http.get('http://192.168.1.128:3000/getbins',{},{}).then(response=>{
        console.log(response.data);
        this.bins = _.uniqBy(response.data,'bin_id');
        console.log(this.bins);
        this.bins.forEach(bin=>{
          let marker: Marker = this.map.addMarkerSync({
            title: bin.bin_id,
            icon: 'blue',
            animation: 'DROP',
            position: {
              lat: bin.lat,
              lng: bin.lng
            }
          });
          let htmlInfoWindow = new HtmlInfoWindow();
    
          let frame: HTMLElement = document.createElement('div');
          frame.innerHTML = [
            '<h3>Hearst Castle</h3>'
          ].join("");
          frame.getElementsByTagName("h3")[0].addEventListener("click", () => {
            htmlInfoWindow.setBackgroundColor('red');
          });
          htmlInfoWindow.setContent(frame, {
            width: "280px",
            height: "330px"
          });
    
          htmlInfoWindow.open(marker);
          marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
            alert('clicked');
          });
        });
      });
  
      //getting all locations marked by users using their watches from the database through the server
      this.http.get('http://192.168.1.128:3000/getpins',{},{}).then(response=>{  
        this.pins = response.data;
        console.log(this.pins);
      });
     }).catch((error) => {
       console.log('Error getting location', error);
     });

    // this.loadMap();
  }
  
}