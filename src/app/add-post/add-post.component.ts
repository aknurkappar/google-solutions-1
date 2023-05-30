import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Category} from "../catalog";

import { categories } from "../catalog";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  Firestore,
  onSnapshot,
  query,
  updateDoc,
  where
} from "@angular/fire/firestore";
import {getDownloadURL, ref, Storage, uploadBytesResumable} from "@angular/fire/storage";
import {Router} from "@angular/router";
import {onAuthStateChanged, user} from '@angular/fire/auth';
import {User} from "../models/user";
import {AddPostFormService} from "../services/add-post-form.service";
import {getAuth} from "firebase/auth";
import {Location} from "@angular/common";

@Component({
  selector: 'app-add-post',
  templateUrl: './add-post.component.html',
  styleUrls: ['./add-post.component.css']
})


export class AddPostComponent implements OnInit{
  public user : User

  constructor(public firestore: Firestore, public storage: Storage, public router: Router, private addPostFormService: AddPostFormService, private location: Location) {
    this.user = {} as User
  }

  ngOnInit(): void {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const uid = user.uid;
        const dbInstance = collection(this.firestore, 'users');
        const userQuery = query(dbInstance, where("userID", "==", `${uid}`));
        onSnapshot(userQuery, (data) => {
          this.user = new User(data.docs.map((item) => {
            return {...item.data(), uniqID: item.id}
          })[0]);
        })
      }
    });
  }

  closeModal(e: any) {
    if(e.composedPath()[0].className == "create_post_back") {
      this.router.navigate(["/home"]); document.body.classList.toggle('lock')
    }
    if(e.composedPath()[1].className == "close_post") {
      this.router.navigate(["/home"]); document.body.classList.toggle('lock')
    }
  }
  post(event : any) {
    if(this.user.specialStatus) {
      this.addPostFormService.handleSecondStepValidation(event)
    } else {
      this.addPostFormService.handleFirstStepValidation(event)
    }
  }
}
