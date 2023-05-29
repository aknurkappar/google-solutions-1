import { Component, Input } from '@angular/core';
import { Router } from "@angular/router";

import { Location } from '@angular/common'

import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { collection, Firestore, query, where, onSnapshot } from "@angular/fire/firestore";
import { Storage } from "@angular/fire/storage";

import { User } from "../models/user";
import {ModalConditionService} from "../services/modal-condition.service";

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent {

  auth = getAuth()

  constructor(public firestore: Firestore,
              public storage: Storage,
              public router: Router,
              public modalCondition: ModalConditionService,
              private location: Location
  ) { }

  closeModal(){
    this.router.navigate(['/home']).then()
    document.body.classList.remove('lock');
  }
  switchToSigUp(){
    console.log("hereeee")
    this.router.navigate(['/home/sign-up']).then()
  }
  signIn(value: any, e: any) {
    const signInForm = e.composedPath()[0];
    signInWithEmailAndPassword(this.auth, value.email, value.password)
        .then((success) => {
          if(success.user.email !== "admin@bejomart.kz"){
            const dbInstance = collection(this.firestore, 'users');
            const userQuery = query(dbInstance, where("userID", "==", `${success.user.uid}`));

            onSnapshot(userQuery, (data) => {
              const user = new User(data.docs.map((item) => {
                return {...item.data(), uniqID: item.id}
              })[0]);
            })
          }
          this.location.back()
          document.body.classList.remove('lock');

          if(success.user.email == "admin@bejomart.kz"){
            window.location.reload()
          }
        })
        .catch((error) => {
          signInForm.classList.add('occured');
          for(let i = 0; i < signInForm.querySelectorAll('input').length; i++) {
            signInForm.querySelectorAll('input')[i].style.borderColor = '#e81f1f';
          }
          setTimeout(() => {
            signInForm.classList.remove('occured');
            for(let i = 0; i < signInForm.querySelectorAll('input').length; i++) {
              signInForm.querySelectorAll('input')[i].style.borderColor = '#E2E2E2';
              signInForm.querySelectorAll('input')[i].value = "";
            }
          }, 3000);
          // alert(err.message);
        })
  }

  signInOptions(e: any) {
    console.log(e.composedPath());
    if(e.composedPath()[0].className === 'sign_in') {
      window.scrollTo({top: 0}); e.composedPath()[4].classList.add('show_in'); document.body.classList.add('lock');
    }
    else if(e.composedPath()[0].className === 'sign_in_back') {
      e.composedPath()[1].classList.remove('show_in'); document.body.classList.remove('lock');
      this.modalCondition.signInCondition = false
    }
    else if(e.composedPath()[1].className === 'close_form_in') {
      e.composedPath()[5].classList.remove('show_in'); document.body.classList.remove('lock');
      this.modalCondition.signInCondition = false
    }
    else if(e.composedPath()[0].className === 'link_sign_up') {
      e.composedPath()[4].classList.remove('show_in');
      e.composedPath()[4].classList.add('show');
      this.modalCondition.signInCondition = false
      this.modalCondition.signUpCondition = true
    }
  }

  showPassword(e: any, type: string) {
    if(type == 'show') {
      e.composedPath()[2].childNodes[0].type = 'text';
      e.composedPath()[1].classList.add('show');
    }
    else {
      e.composedPath()[2].childNodes[0].type = 'password';
      e.composedPath()[1].classList.remove('show');
    }
  }

}
