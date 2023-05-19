import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

import { Category } from "../catalog";
import { categories } from "../catalog";

import { addDoc, Firestore, collection, getDocs, updateDoc, doc, deleteDoc, arrayUnion, arrayRemove, where, query } from '@angular/fire/firestore'
import { Storage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage'
import { PostsService } from "../posts.service";

import { User } from "../user";
import { Subject } from "rxjs";
import {ModalConditionService} from "../services/modal-condition.service";


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{

  public ads: any[];

  public amount: number = 1;
  public myFavorites: any[];

  public uploaded: boolean;
  public isAuthorized: boolean = false;
  public initialPosts: any[]

  public postCategory: any = [];
  public categories = categories;

  public user: User

  public postImages: any = [];
  public images: any = [];

  public loaded: boolean;

  startAt = new Subject()
  endAt = new Subject()

  sliderImages = [
    {
      imageSrc: '../../assets/slider1.jpg',
      imageAlt: 'first'
    },
    {
      imageSrc: '../../assets/slider2.jpg',
      imageAlt: 'second'
    },
    {
      imageSrc: '../../assets/slider3.jpg',
      imageAlt: 'third'
    },
    {
      imageSrc: '../../assets/slider4.jpg',
      imageAlt: 'fourth'
    },
    {
      imageSrc: '../../assets/slider5.jpg',
      imageAlt: 'fourth'
    }
  ]

  constructor(public firestore: Firestore, public storage: Storage, public router: Router, public modalsCondition: ModalConditionService) {
    this.getData();
    this.uploaded = false;
    this.loaded = false;
    this.user = {} as User;
    this.myFavorites = [] as any;
    this.ads = [] as any;
    this.initialPosts = [] as any;
  }

  ngOnInit(): void {
    const value = localStorage.getItem("userData");
    if(value !== null) { // @ts-ignore
      this.user = new User(JSON.parse(value)[0]);
      if(Object.keys(this.user).length !== 0) {
        this.isAuthorized = true;
      }
    }
  }

  upload($event: any) {
    const postForm = $event.target.closest('.post_form');

    if($event.target.files.length > 5 || (this.postImages.length + $event.target.files.length) > 5) {
      postForm.classList.add('limit');
      setTimeout(() => {
        postForm.classList.remove('limit');
      }, 3000);
      return
    }

    for(let i = 0; i < $event.target.files.length; i++) {
      var reader = new FileReader();
      reader.readAsDataURL($event?.target.files[i]);

      if(Number(this.postImages.length) >= 5) {
        postForm.classList.add('limit');
        setTimeout(() => {
          postForm.classList.remove('limit');
        }, 3000);
        return
      }

      reader.onload = (event: any) => {
        this.postImages.push(event.target.result)
      }
      this.images.push($event.target.files[i]);
    }

    this.uploaded = true;
  }
  
  uploadImages(id: string, postForm: any) {
    const len = Number(this.images.length);
    let totalProg = 0;

    for(let i=0; i<this.images.length; i++) {
      const storageRef = ref(this.storage, `images/${this.images[i].name}`);
      const uploadTask = uploadBytesResumable(storageRef, this.images[i]);

      uploadTask.on('state_changed',
        (snapshot) => { },
        (error) => { console.log(error.message) },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            const dataToUpdate = doc(this.firestore, "posts", id);

            if(i == 0) updateDoc(dataToUpdate, { mainIMG: downloadURL }).then(() => { }).catch((err) => { alert(err.message) })
            else updateDoc(dataToUpdate, { images: arrayUnion(downloadURL) }).then(() => { }).catch((err) => { alert(err.message) })

            totalProg += (100 / len);

            if(totalProg >= 100) {
              postForm.querySelector('.progress_bar').style.width = (totalProg + '%');
              this.uploaded = false; window.location.reload();
            } 
            else postForm.querySelector('.progress_bar').style.width = (totalProg + '%');
          });
        }
      )
    }
  }

  addDays(date: Date, days: number) {
    let result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  addData(value: any, e: any) {
    const dbInstance = collection(this.firestore, 'posts');
    const postForm = e.composedPath()[0];
    
    value.images = [];
    value.visibility = "inProgress";
    value.ownerId = this.user.userID
    value.category = this.postCategory;
    value.time = new Date()
    value.expiredDate = this.addDays(value.time, 30)
    value.location = postForm.querySelector('.input_location').value;
    value.code = Math.floor(Math.random() * (999999 - 100000) + 100000)
    value.favorite = []

    if(value.title == "" || value.description == "" || value.catalog == "" || value.location == "" || value.amount == 0 || !this.uploaded) {
      postForm.classList.add('occured');
      for(let i = 0; i < postForm.querySelectorAll('input').length; i++) {
        if(postForm.querySelectorAll('input')[i].value == "" && postForm.querySelectorAll('input')[i].className !== 'input_amount') {
          postForm.querySelectorAll('input')[i].style.borderColor = '#e81f1f';
        }
      }
      if(postForm.querySelector('textarea').value == "") postForm.querySelector('textarea').style.borderColor = '#e81f1f';
      if(postForm.querySelector('.input_amount').value == "") postForm.querySelector('.amount').style.borderColor = '#e81f1f';
      if(!this.uploaded) postForm.querySelector('.file label').style.borderColor = '#e81f1f';
      setTimeout(() => {
        for(let i = 0; i < postForm.querySelectorAll('input').length; i++) {
          postForm.querySelectorAll('input')[i].style.borderColor = '#E2E2E2';
        }
        postForm.querySelector('textarea').style.borderColor = '#E2E2E2';
        postForm.querySelector('.amount').style.borderColor = '#E2E2E2';
        postForm.querySelector('.file label').style.borderColor = '#E2E2E2';
        postForm.classList.remove('occured');
      }, 3000);
      return
    }

    addDoc(dbInstance, value).then((res) => {
        this.uploadImages(res.id, postForm);
        this.images = [];
        this.getData();
      }).catch((err) => { alert(err.message) }
    )
  }

  getData() {
    const dbInstance = collection(this.firestore, 'posts');
    getDocs(dbInstance).then( (response) => {
        this.ads = [...response.docs.map( (item) => {
          return { ...item.data(), id:item.id }})
        ].sort((n1, n2) => {
          console.log(n1, n2)
          // @ts-ignore
          return n2.time - n1.time
        } )
        for(let i of this.ads){
          if(i.expiredDate != undefined) this.getDiff(i.expiredDate, i.id);
        }
        this.loaded = true;
        this.initialPosts = this.ads
      }).catch( (err) => { alert(err.message) }
    ).finally( () => {
      console.log(this.ads)
      this.myFavorites = this.ads.filter( value => {
        if(value.favorite != undefined){
          return value.favorite.includes(this.user.userID)
        }
      }).map((value) => value.id);
    })
  }

  isFavorite(id: any){
    return this.myFavorites.includes(id)
  }

  chooseCity(e: any) {
    e.composedPath()[1].classList.toggle('open');
  }
  setCityValue(e: any) {
    e.composedPath()[2].childNodes[0].value = e.composedPath()[0].innerHTML;
    e.composedPath()[2].classList.remove('open');
  }

  search(e: any){
    this.ads = this.initialPosts;
    if(e.composedPath()[0].value && e.composedPath()[0].value.trim()){
      const res = this.ads.filter(x => {
        let selected = e.composedPath()[0].value.toLowerCase().trim();
        let target = x.title.toLowerCase().trim()
        const reg = new RegExp(`${selected}`)
        return target.match(reg)
      });
      this.ads = res
    }
    else this.ads = this.initialPosts;
  }

  chooseCategory(e: any) {
    e.composedPath()[1].classList.toggle('open');
  }
  selectCategory(e : any, category : Category) {
    if(e.composedPath()[0].className === 'category_top main') {
      this.postCategory = []
      this.postCategory.push(category.name.toString())
      e.composedPath()[4].childNodes[0].value = this.postCategory[0]
      e.composedPath()[4].classList.remove('open');
    }
    if(e.composedPath()[0].className === 'category_top middle') {
      this.postCategory = []
      this.postCategory.push(e.composedPath()[2].parentElement.childNodes[0].childNodes[0].innerHTML)
      this.postCategory.push(category.name.toString())
      e.composedPath()[6].childNodes[0].value = this.postCategory[0] + ' / ' + this.postCategory[1]
      e.composedPath()[6].classList.remove('open');
    }
    if(e.composedPath()[0].className === 'category_top child') {
      this.postCategory = []
      this.postCategory.push(e.composedPath()[2].parentElement.parentElement.parentElement.childNodes[0].childNodes[0].innerHTML)
      this.postCategory.push(e.composedPath()[2].parentElement.childNodes[0].childNodes[0].innerHTML)
      this.postCategory.push(category.name.toString())
      e.composedPath()[8].childNodes[0].value = this.postCategory[0] + ' / ' + this.postCategory[1] + ' / ' + this.postCategory[2]
      e.composedPath()[8].classList.remove('open');
    }
    e.stopPropagation();
  }

  filterByLocation(e: any) {
    e.composedPath()[1].classList.toggle('open');
  }
  changeLocation(e: any) {
    if(e.composedPath()[0].innerHTML.length > 6) {
      e.composedPath()[2].childNodes[0].childNodes[0].innerHTML = e.composedPath()[0].innerHTML.substring(0, 5) + '...';
    } else e.composedPath()[2].childNodes[0].childNodes[0].innerHTML = e.composedPath()[0].innerHTML;
    if(e.composedPath()[2].childNodes[0].childNodes[0].innerHTML == "All"){
      this.getData()
    }
    else {
      const q = query(collection(this.firestore, "posts"), where("location", "==", e.composedPath()[0].innerHTML));
      getDocs(q).then( (data) => {
        this.ads = [...data.docs.map( (item) => {
          return { ...item.data(), id:item.id }})
        ]
        this.initialPosts = this.ads
      })
    }
    e.composedPath()[3].childNodes[1].value = ''
    e.composedPath()[2].classList.remove('open');
  }

  forFavorite(e: any, post: any) {
    if(e.composedPath()[0].className === 'fav_1' && Object.keys(this.user).length) {
      this.addToFav(e, post);
    } 
    else if(!Object.keys(this.user).length) {
      window.scrollTo({top: 0}); e.composedPath()[10].childNodes[0].classList.add('show_in'); document.body.classList.add('lock');
    }
    else this.removeFromFav(e, post);
  }

  addToFav(e: any, post: any) {
    e.composedPath()[3].classList.add('chosen')
    const dataToUpdate = doc(this.firestore, "posts", post.id);
    updateDoc(dataToUpdate, { favorite: arrayUnion(this.user.userID) }).then(() => { }).catch((err) => { alert(err.message) })
  }

  removeFromFav(e: any, post: any){
    e.composedPath()[3].classList.remove('chosen')
    const dataToUpdate = doc(this.firestore, "posts", post.id);
    updateDoc(dataToUpdate, { favorite: arrayRemove(this.user.userID) }).then(() => { }).catch((err) => { alert(err.message) })
  }

  createPost(e: any) {
    if(e.composedPath()[0].className === 'add_ad' && Object.keys(this.user).length) {
      window.scrollTo({top: 0}); e.composedPath()[1].classList.add('create'); document.body.classList.add('lock');
    }
    else if(e.composedPath()[0].className === 'create_post_back') {
      e.composedPath()[1].classList.remove('create'); document.body.classList.remove('lock');
    }
    else if(e.composedPath()[1].className === 'close_post') {
      e.composedPath()[5].classList.remove('create'); document.body.classList.remove('lock');
    }
    else if(!Object.keys(this.user).length) {
      window.scrollTo({top: 0}); document.body.classList.add('lock'); this.modalsCondition.signInCondition = true
    }
  }

  photosRedactor(e: any) {
    if(e.composedPath()[0].className === "makemain") {
      [this.postImages[0], this.postImages[e.composedPath()[2].childNodes[0].alt]] = [this.postImages[e.composedPath()[2].childNodes[0].alt], this.postImages[0]];
      [this.images[0], this.images[e.composedPath()[2].childNodes[0].alt]] = [this.images[e.composedPath()[2].childNodes[0].alt], this.images[0]];
    }
    if(e.composedPath()[0].className === "deleteimg") {
      this.postImages.splice(e.composedPath()[2].childNodes[0].alt, 1);
      this.images.splice(e.composedPath()[2].childNodes[0].alt, 1);
    }
  }

  getDiff(expired: any, id: any){
    const time = new Date()
    const diffInMs = expired.seconds - time.getTime()/1000;
    if(diffInMs < 0){
      const docRef = doc(this.firestore, "posts",  `${id}`);
      deleteDoc(docRef)
          .then(() => {
          })
          .catch(error => {
            console.log(error);
          })
    }
  }

  filterByCategory(e: any) {
    this.ads = this.initialPosts;
    this.ads = this.ads.filter(value => value.category.includes(e.composedPath()[0].childNodes[0].innerHTML))
    console.log(e.composedPath()[0].childNodes[0].innerHTML);
  }

}