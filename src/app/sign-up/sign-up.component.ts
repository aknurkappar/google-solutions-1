import { Component } from '@angular/core';
import { Router } from "@angular/router";

import { ModalConditionService } from "../services/modal-condition.service";

import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection, Firestore } from "@angular/fire/firestore";
import { Storage } from "@angular/fire/storage";
import {Location} from "@angular/common";

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent {

  auth = getAuth()
  constructor(public firestore: Firestore, public storage: Storage, public router: Router, public modalCondition: ModalConditionService, private location: Location) { }

  closeModal(){
    this.router.navigate(['/home']).then()
    document.body.classList.remove('lock');
  }

  switchToSigIn(){
    this.router.navigate(['/home/sign-in']).then()
  }

  signUp(value: any, e: any) {
    const signUpForm = e.composedPath()[0];

    if(value.fName == "" || value.lName == "" || value.city == "" || value.email == "" || value.password == "") {
      signUpForm.classList.add('occured');
      for(let i = 0; i < signUpForm.querySelectorAll('input').length; i++) {
        if(signUpForm.querySelectorAll('input')[i].value == "") {
          signUpForm.querySelectorAll('input')[i].style.borderColor = '#e81f1f';
        }
      }
      setTimeout(() => {
        signUpForm.classList.remove('occured');
        for(let i = 0; i < signUpForm.querySelectorAll('input').length; i++) {
          signUpForm.querySelectorAll('input')[i].style.borderColor = '#E2E2E2';
        }
      }, 3000);

      return
    }
    else if(value.fName != "" && value.lName != "" && value.city != "" && value.email != "" && value.password != "" && value.password != value.passwordconfirm) {
      signUpForm.classList.add('correct');
      signUpForm.querySelector('.userpassword').style.borderColor = '#e81f1f';
      signUpForm.querySelector('.passwordconfirm').style.borderColor = '#e81f1f';
      setTimeout(() => {
        signUpForm.classList.remove('correct');
        signUpForm.querySelector('.userpassword').style.borderColor = '#E2E2E2';
        signUpForm.querySelector('.passwordconfirm').style.borderColor = '#E2E2E2';
      }, 3000);

      signUpForm.querySelector('.userpassword').value = "";
      signUpForm.querySelector('.passwordconfirm').value = "";

      return
    }
    else if(value.password.length < 8) {
      signUpForm.classList.add('length');
      signUpForm.querySelector('.userpassword').style.borderColor = '#e81f1f';
      signUpForm.querySelector('.passwordconfirm').style.borderColor = '#e81f1f';
      setTimeout(() => {
        signUpForm.classList.remove('length');
        signUpForm.querySelector('.userpassword').style.borderColor = '#E2E2E2';
        signUpForm.querySelector('.passwordconfirm').style.borderColor = '#E2E2E2';
      }, 3000);

      signUpForm.querySelector('.userpassword').value = "";
      signUpForm.querySelector('.passwordconfirm').value = "";

      return
    }

    createUserWithEmailAndPassword(this.auth, value.email, value.password)
      .then((succes) => {
        const dbInstance = collection(this.firestore, 'users');
        value.userID = succes.user.uid;
        value.baursaks = 0;
        value.avatar = "";
        value.donatedValue = 0;
        addDoc(dbInstance, value)
            .then(() => {
            })
            .catch((err) => {
              alert(err.message)
            })
        this.location.back()
        document.body.classList.remove('lock');
      })
      .catch((err) => {
        signUpForm.classList.add('exist');
        signUpForm.querySelector('.useremail').style.borderColor = '#e81f1f';
        setTimeout(() => {
          signUpForm.classList.remove('exist');
          signUpForm.querySelector('.useremail').style.borderColor = '#E2E2E2';
        }, 3000);
        signUpForm.querySelector('.useremail').value = "";
      })
  }

  signUpOptions(e: any) {
    if(e.composedPath()[0].className === 'sign_up') {
      window.scrollTo({top: 0}); e.composedPath()[4].classList.add('show'); document.body.classList.add('lock');
    }
    else if(e.composedPath()[0].className === 'sign_up_back') {
      e.composedPath()[1].classList.remove('show'); document.body.classList.remove('lock');
      this.modalCondition.signUpCondition = false
    }
    else if(e.composedPath()[1].className === 'close_form') {
      e.composedPath()[5].classList.remove('show'); document.body.classList.remove('lock');
      this.modalCondition.signUpCondition = false
    }
    else if(e.composedPath()[0].className === 'link_sign_in') {
      e.composedPath()[4].classList.remove('show');
      e.composedPath()[4].classList.add('show_in');
      this.modalCondition.signUpCondition = false
      this.modalCondition.signInCondition = true
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
