import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

import { ModalConditionService } from "./services/modal-condition.service";

import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection, Firestore, query, where, getDocs, onSnapshot, doc, getDoc } from "@angular/fire/firestore";
import { Storage } from "@angular/fire/storage";

import { User } from "./models/user";
import {onAuthStateChanged, signOut} from "@angular/fire/auth";
import {Location} from "@angular/common";
import {ChatService} from "./services/chat.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  public user: User

  public data: any = []

  isAuthorized: boolean = false
  adminLogged: boolean = false
  userLoaded = 0
  
  constructor(public router: Router, public modalConditionService: ModalConditionService, public firestore: Firestore, private location: Location, public chatService: ChatService) {
    this.user = {} as User
  }
  
  ngOnInit() {
    this.chatService.urlPath = !!location.pathname.includes("chat")
    const auth = getAuth()
    onAuthStateChanged(auth, (user) => {
      if(user) {
        const uid = user.uid
        if(uid == "GUWLnRf5Fdbb4ITZE4uu21yzL782") {
          this.adminLogged = true
          this.router.navigate(['/admin']).then()
          this.userLoaded = 1
        } else {
          const dbInstance = collection(this.firestore, 'users');
          const userQuery = query(dbInstance, where("userID", "==", `${uid}`))
          onSnapshot(userQuery, (data) => {
            this.user = new User(data.docs.map((item) => {
              return {...item.data(), uniqID: item.id}
            })[0]);
            this.isAuthorized = true
            this.userLoaded = 1
          })
        }
      } else this.userLoaded = 2
    })
  }
  handleOpenModal(){
    document.body.classList.add('lock');
  }

  handleLogout(e : any) {
    e.composedPath()[2].children[2].classList.toggle("logout-modal-active");
    document.body.classList.add('lock');
  }

  cancelLogout(e : any) {
    e.composedPath()[3].classList.toggle("logout-modal-active");
    document.body.classList.remove('lock');
  }

  logout() {
    this.adminLogged = false
    this.isAuthorized = false

    const auth = getAuth();
    signOut(auth).then(() => {
      this.userLoaded = 2
    }).catch((error) => {});
    this.router.navigate(['/home']).then()
    document.body.classList.remove('lock')
  }

  chatOptions(option: boolean) {
    if(option) {
      this.location.back()
      this.chatService.urlPath = false
    }
    else {
      this.router.navigate(["/chat"]).then()
      this.chatService.urlPath = true
    }
  }
  
}
