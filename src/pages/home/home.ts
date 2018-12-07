import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { NgForm } from '@angular/forms';
import { HTTP } from '@ionic-native/http';
import { UserPage } from '../user/user';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  user = {
    username:'',
    password:'',
    email:''
  };

  constructor(public navCtrl: NavController, public http:HTTP,private storage: Storage,
    public loadingCtrl: LoadingController) {

  }

  onLogin(form:NgForm){
    if(form.valid){
      let loading = this.loadingCtrl.create({
        spinner: 'bubbles',
        content: 'Logging in...'
      });
      loading.present();
      this.http.post('http://192.168.1.128:3000/loginAttempt',this.user,{}).then(data=>{
        console.log(data.data);
        const response = JSON.parse(data.data);
        loading.dismiss();
        if(response.response == 'success'){
          this.storage.set('user',{username:this.user.username,password:this.user.password});
          this.navCtrl.setRoot(UserPage,{user:this.user.username});
        }        
      });
    }
  }

}
