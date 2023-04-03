import {Component, OnInit} from '@angular/core';
import {collection, Firestore, getDocs} from "@angular/fire/firestore";
import {Storage} from "@angular/fire/storage";
import {User} from "../user";

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit{
  notifications: any[] | undefined
  user: User;
  authorized: boolean = false;
  constructor(public firestore: Firestore, public storage: Storage) {
    this.getNotifications();
    this.user = {} as User;
  }

  ngOnInit() {
    const value = localStorage.getItem("userData")
    if(value !== null){
      // @ts-ignore
      this.user = new User(JSON.parse(value)[0])
      if(Object.keys(this.user).length !== 0){
        this.authorized = true;
      }
    }
  }

  getNotifications() {
    const dbInstance = collection(this.firestore, 'notifications');
    getDocs(dbInstance).then( (response) => {
      this.notifications = [...response.docs.map( (item) => {
        return { ...item.data(), id:item.id }})
      ].sort((n1, n2) => { // @ts-ignore
        return n2.time - n1.time;
      })
      this.notifications = this.notifications.filter((value) =>  value.userID === this.user.userID)
    }).catch( (err) => { alert(err.message) }
    )
  }

}
