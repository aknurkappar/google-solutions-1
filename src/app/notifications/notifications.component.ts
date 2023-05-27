import {Component, OnInit} from '@angular/core';
import {collection, Firestore, getDocs, onSnapshot, query, where} from "@angular/fire/firestore";
import {Storage} from "@angular/fire/storage";
import {User} from "../models/user";
import {getAuth} from "firebase/auth";
import {onAuthStateChanged} from "@angular/fire/auth";

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {

  notifications: any[] | undefined
  user: User;
  authorized: boolean = false;
  constructor(public firestore: Firestore, public storage: Storage) {
    this.user = {} as User;
  }

  ngOnInit() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if(user) {
        const uid = user.uid;
        const dbInstance = collection(this.firestore, 'users');
        const userQuery = query(dbInstance, where("userID", "==", `${uid}`));

        onSnapshot(userQuery, (data) => {
          this.user = new User(data.docs.map((item) => {
            return {...item.data(), uniqID: item.id}
          })[0]);
          if(this.user.email !== "admin@bejomart.kz"){
            this.authorized = true;
          }
        })
      }
    });
    this.getNotifications();
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
