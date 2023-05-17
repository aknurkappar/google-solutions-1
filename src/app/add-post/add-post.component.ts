import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Category} from "../catalog";

import { categories } from "../catalog";
import {addDoc, arrayUnion, collection, doc, Firestore, updateDoc} from "@angular/fire/firestore";
import {getDownloadURL, ref, Storage, uploadBytesResumable} from "@angular/fire/storage";
import {Router} from "@angular/router";
import { user } from '@angular/fire/auth';
import {User} from "../models/user";
import {AddPostFormService} from "../services/add-post-form.service";

@Component({
  selector: 'app-add-post',
  templateUrl: './add-post.component.html',
  styleUrls: ['./add-post.component.css']
})


export class AddPostComponent implements OnInit{
  public user : User
  constructor(public firestore: Firestore, public storage: Storage, public router: Router, private addPostFormService: AddPostFormService) {
    this.user = {} as User
  }

  closeModal(){
    document.body.classList.toggle('lock');
  }
  post(event : any){
    if(this.user.specialStatus){
      this.addPostFormService.handleSecondStepValidation(event)
    } else {
      this.addPostFormService.handleFirstStepValidation(event)
    }
  }

  ngOnInit(): void {
    const value = localStorage.getItem("userData");
    if(value !== null) { // @ts-ignore
      this.user = new User(JSON.parse(value)[0]);
    }
  }
}
