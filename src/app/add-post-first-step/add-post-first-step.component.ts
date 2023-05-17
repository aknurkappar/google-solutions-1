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
  selector: 'app-add-post-first-step',
  templateUrl: './add-post-first-step.component.html',
  styleUrls: ['./add-post-first-step.component.css']
})
export class AddPostFirstStepComponent implements OnInit{

  public postCategory: any = [];
  public categories = categories;
  public uploaded: boolean;
  public user : User
  constructor(public firestore: Firestore, public storage: Storage, public router: Router, public addPostFormService: AddPostFormService) {
    this.uploaded = false
    this.user = {} as User;
  }

  ngOnInit(): void {
    const value = localStorage.getItem("userData");
    if(value !== null) { // @ts-ignore
      this.user = new User(JSON.parse(value)[0]);
    }
    console.log(this.user)
  }

  handlePostValidation(event : any){
    this.addPostFormService.handleFirstStepValidation(event)
  }
  chooseCategory(e: any) {
    e.composedPath()[1].classList.toggle('open');
  }
  chooseCity(e: any) {
    e.composedPath()[1].classList.toggle('open');
  }
  setCityValue(e: any) {
    this.addPostFormService.post.location = e.composedPath()[0].innerHTML;
    e.composedPath()[2].classList.remove('open');
  }

  selectCategory(e : any, category : Category) {
    this.addPostFormService.categoryText = ""
    if(e.composedPath()[0].className === 'category_top main') {
      this.addPostFormService.postCategory = []
      this.addPostFormService.postCategory.push(category.name.toString())
      e.composedPath()[4].childNodes[0].value = this.postCategory[0]
      e.composedPath()[4].classList.remove('open');
    }
    if(e.composedPath()[0].className === 'category_top middle') {
      this.addPostFormService.postCategory = []
      this.addPostFormService.postCategory.push(e.composedPath()[2].parentElement.childNodes[0].childNodes[0].innerHTML)
      this.addPostFormService.postCategory.push(category.name.toString())
      e.composedPath()[6].childNodes[0].value = this.addPostFormService.postCategory[0] + ' / ' + this.addPostFormService.postCategory[1]
      e.composedPath()[6].classList.remove('open');
    }
    if(e.composedPath()[0].className === 'category_top child') {
      this.addPostFormService.postCategory = []
      this.addPostFormService.postCategory.push(e.composedPath()[2].parentElement.parentElement.parentElement.childNodes[0].childNodes[0].innerHTML)
      this.addPostFormService.postCategory.push(e.composedPath()[2].parentElement.childNodes[0].childNodes[0].innerHTML)
      this.addPostFormService.postCategory.push(category.name.toString())
      e.composedPath()[8].childNodes[0].value = this.addPostFormService.postCategory[0] + ' / ' + this.addPostFormService.postCategory[1] + ' / ' + this.addPostFormService.postCategory[2]
      e.composedPath()[8].classList.remove('open');
    }
    e.stopPropagation();

    this.addPostFormService.post.category = this.addPostFormService.postCategory
    this.convertToCatalog()
  }

  convertToCatalog(){
    for(let i = 0; i < this.addPostFormService.post.category.length; i++){
      this.addPostFormService.categoryText += this.addPostFormService.post.category[i]
      if(i != this.addPostFormService.post.category.length-1){
        this.addPostFormService.categoryText += " / "
      }
    }
  }
}
