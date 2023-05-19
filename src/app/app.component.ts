import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

import { ModalConditionService } from "./services/modal-condition.service";

import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection, Firestore, query, where, getDocs, onSnapshot, doc, getDoc } from "@angular/fire/firestore";
import { Storage } from "@angular/fire/storage";

import { User } from "./models/user";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  public user: User

  public data: any = []

  isAuthorized: boolean = false;
  adminLogged: boolean = false;
  
  constructor(public router: Router, public modalConditionService: ModalConditionService) {
    this.user = {} as User
  }
  
  ngOnInit() {
    const value = localStorage.getItem("userData");
    if(value !== null) { // @ts-ignore
      this.user = new User(JSON.parse(value)[0]);
      if(Object.keys(this.user).length !== 0) this.isAuthorized = true;
      if(this.user.email == "admin") {
        this.adminLogged = true
        this.router.navigate(['/admin']).then()
      }
    }
  }

  handleLogout(e : any) {
    e.composedPath()[2].children[2].classList.toggle("logout-modal-active");
    document.body.classList.add('lock');
  }

  cancelLogout(e : any) {
    e.composedPath()[3].classList.toggle("logout-modal-active");
    document.body.classList.remove('lock');
  }

  logout(e : any) {
    this.adminLogged = false
    this.isAuthorized = false
    setTimeout(() => {
      localStorage.removeItem("userData");
    }, 1500);
    this.router.navigate(['/home']).then()
    document.body.classList.remove('lock')
  }
  
}