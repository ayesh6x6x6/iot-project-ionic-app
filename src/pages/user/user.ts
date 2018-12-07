import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { MapPage } from '../map/map';
import { connect, Client } from 'mqtt';
import { Geolocation } from "@ionic-native/geolocation";
import { HTTP } from '@ionic-native/http';

@Component({
  selector: 'page-user',
  templateUrl: 'user.html',
})
export class UserPage {
  username = '';
  client: Client;
  str:string;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private http: HTTP,private geolocation: Geolocation) {
    this.username = this.navParams.get('user');
    this.client = connect('mqtt://broker.hivemq.com/mqtt',{port:8000});
    this.client.subscribe('getloc/EC:9B:F3:BD:1E:13');
    this.client.on('message',(topic:string,payload:string)=>{
      this.geolocation.getCurrentPosition().then((resp)=>{
        this.http.post("http://192.168.1.128:3000/placepins",{lat:resp.coords.latitude,lng:resp.coords.longitude},{}).then(status=>{
          console.log(status);
        });
      });
    });
  }

  onViewPins(){
    this.navCtrl.push(MapPage);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserPage');
  }

}
