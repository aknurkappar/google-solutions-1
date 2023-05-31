import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

import { Category } from "../catalog";
import { categories } from "../catalog";

import {
  addDoc,
  Firestore,
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  where,
  query,
  onSnapshot
} from '@angular/fire/firestore'
import { Storage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage'
import { PostsService } from "../posts.service";

import { User } from "../models/user";
import { Subject } from "rxjs";
import {ModalConditionService} from "../services/modal-condition.service";
import {getAuth} from "firebase/auth";
import {onAuthStateChanged} from "@angular/fire/auth";


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{

  public ads: any[];
  public myFavorites: any[];
  public uploaded: boolean;
  public isAuthorized: boolean = false;
  public initialPosts: any[]
  public postCategory: any = [];
  public categories = categories;
  public user: User
  public loaded: boolean;
  public leaderboard : any[] = [];

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

  constructor(public firestore: Firestore, public storage: Storage, public router: Router) {
    this.getData();
    this.getLeaderboard()
    this.uploaded = false;
    this.loaded = false;
    this.user = {} as User;
    this.myFavorites = [] as any;
    this.ads = [] as any;
    this.leaderboard = [] as any;
    this.initialPosts = [] as any;
  }

  ngOnInit(): void {
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
            this.isAuthorized = true;
          }
        })
      }
    });
  }

  getData() {
    const dbInstance = collection(this.firestore, 'posts');
    getDocs(dbInstance).then( (response) => {
        this.ads = [...response.docs.map( (item) => {
          return { ...item.data(), id:item.id }})
        ].sort((n1, n2) => { // @ts-ignore
          return n2.time - n1.time
        } )
        for(let i of this.ads){
          if(i.expiredDate != undefined) this.getDiff(i.expiredDate, i.id);
        }
        this.loaded = true;
        this.initialPosts = this.ads
      }).catch( (err) => { alert(err.message) }
    ).finally( () => {
      this.myFavorites = this.ads.filter( value => {
        if(value.favorite != undefined){
          return value.favorite.includes(this.user.userID)
        }
      }).map((value) => value.id);
    })
  }

  getLeaderboard() {
    const dbInstance = collection(this.firestore, 'users');
    getDocs(dbInstance).then( (response) => {
      this.leaderboard = [...response.docs.map( (item) => {
        return { ...item.data(), id:item.id }})
      ].sort((n1, n2) => { // @ts-ignore
        return n2.baursaks - n1.baursaks;
      })
    }).catch( (err) => { alert(err.message) }
    ).finally( () => {
      this.leaderboard = this.leaderboard.slice(0, 10)
    })
  }

  isFavorite(id: any){
    return this.myFavorites.includes(id)
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

  handleAddPost() {
    document.body.classList.toggle('lock');
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
  }

  sortBy(e: any) {
    this.ads = this.initialPosts
    if(e.composedPath()[0].value == "Top") {
      this.ads.sort((a, b) => {
        if(a.time > b.time) return -1
        else return 1
      })
    } else {
      this.ads.sort((a, b) => {
        if(a.time < b.time) return -1
        else return 1
      })
    }
  }

}
