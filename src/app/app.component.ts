import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection, Firestore, query, where, getDocs, onSnapshot, doc, getDoc } from "@angular/fire/firestore";
import { Storage } from "@angular/fire/storage";

import { User } from "./user";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  public user: User

  public ads: any = [];
  public data: any = []
  
  auth = getAuth()

  isAuthorized: boolean = false;
  adminLoggined: boolean = false;
  
  constructor(public firestore: Firestore, public storage: Storage, public router: Router) {
    this.user = {} as User
  }
  
  ngOnInit() {
    const value = localStorage.getItem("userData");
    if(value !== null) { // @ts-ignore
      this.user = new User(JSON.parse(value)[0]);
      if(Object.keys(this.user).length !== 0)  this.isAuthorized = true;
      if(this.user.email == "admin") {
        this.adminLoggined = true;
        this.router.navigate(['/admin']);
      }
    }
  }

  register(value: any, e: any) {
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
        addDoc(dbInstance, value)
          .then(() => {
          })
          .catch((err) => {
            alert(err.message)
          })
        signUpForm.closest('.section').classList.remove('show');
        signUpForm.closest('.section').classList.add('show_in');
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

  checkData(value: any, e: any) {
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
              this.isAuthorized = true;

              signInForm.closest('.section').classList.remove('show_in');
              document.body.classList.remove('lock');

              this.addUserToLocal(user);

              window.location.reload();
            })
          } else{
            const admin = new User({})
            admin.email = "admin"
            this.addUserToLocal(admin)
            window.location.reload()
          }
        })
        .catch((err) => {
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

  addUserToLocal(user: User) {
    let userData;

    if(localStorage.getItem("userData") === null) {
      userData = [];
    } else { // @ts-ignore
      userData = JSON.parse(localStorage.getItem("userData"));
    }

    userData.push(user);
    localStorage.setItem("userData", JSON.stringify(userData));
  }

  signUp(e: any) {
    if(e.composedPath()[0].className === 'sign_up') {
      window.scrollTo({top: 0}); e.composedPath()[4].classList.add('show'); document.body.classList.add('lock');
    }
    else if(e.composedPath()[0].className === 'sign_up_back') {
      e.composedPath()[1].classList.remove('show'); document.body.classList.remove('lock');
    }
    else if(e.composedPath()[1].className === 'close_form') {
      e.composedPath()[5].classList.remove('show'); document.body.classList.remove('lock');
    }
    else if(e.composedPath()[0].className === 'link_sign_in') {
      console.log(e.composedPath()[4]);
      e.composedPath()[4].classList.remove('show');
      e.composedPath()[4].classList.add('show_in');
    }
  }
  
  signIn(e: any) {
    console.log(e.composedPath());
    if(e.composedPath()[0].className === 'sign_in') {
      window.scrollTo({top: 0}); e.composedPath()[4].classList.add('show_in'); document.body.classList.add('lock');
    }
    else if(e.composedPath()[0].className === 'sign_in_back') {
      e.composedPath()[1].classList.remove('show_in'); document.body.classList.remove('lock');
    }
    else if(e.composedPath()[1].className === 'close_form_in') {
      e.composedPath()[5].classList.remove('show_in'); document.body.classList.remove('lock');
    }
    else if(e.composedPath()[0].className === 'link_sign_up') {
      e.composedPath()[4].classList.remove('show_in');
      e.composedPath()[4].classList.add('show');
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

  showPassword(e: any, type: string) {
    if(type == 'show') {
      e.composedPath()[2].childNodes[1].type = 'text';
      e.composedPath()[1].classList.add('show');
    } 
    else {
      e.composedPath()[2].childNodes[1].type = 'password';
      e.composedPath()[1].classList.remove('show');
    }
  }
  showPasswordUp(e: any, type: string) {
    if(type == 'show') {
      e.composedPath()[2].childNodes[0].type = 'text';
      e.composedPath()[1].classList.add('show');
    } 
    else {
      e.composedPath()[2].childNodes[0].type = 'password';
      e.composedPath()[1].classList.remove('show');
    }
  }

  logout(e : any) {
    this.adminLoggined = false;
    this.isAuthorized = false;
    setTimeout(() => {
      localStorage.removeItem("userData");
    }, 1500);
    this.router.navigate(['/home']);
    document.body.classList.remove('lock');
  }
  
}