import { Component } from '@angular/core';
import {User} from "../models/user";
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  Firestore,
  getDocs, onSnapshot,
  query,
  updateDoc,
  where
} from "@angular/fire/firestore";
import {Router} from "@angular/router";
import {categories} from "../catalog";
import {getAuth} from "firebase/auth";
import {onAuthStateChanged} from "@angular/fire/auth";

@Component({
  selector: 'app-buy-and-donate',
  templateUrl: './buy-and-donate.component.html',
  styleUrls: ['./buy-and-donate.component.css']
})
export class BuyAndDonateComponent {

  user: User;

  public myFavorites: any[];
  initialMyFav: any = []

  public categories = categories;

  public loaded: boolean;

  constructor(public firestore: Firestore, public router: Router) {
    this.myFavorites = [] as any;
    this.user = {} as User;
    this.loaded = false;
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
          const q = query(collection(this.firestore, "posts"), where("favorite", "array-contains", this.user.userID));
          getDocs(q).then( (data) => {
            this.myFavorites = [...data.docs.map( (item) => {
              return { ...item.data(), id:item.id }})
            ]
            this.initialMyFav = this.myFavorites;
            this.loaded = true;
          })
        })
      }
    });
  }

  search(e: any){
    this.myFavorites = this.initialMyFav;
    if(e.composedPath()[0].value && e.composedPath()[0].value.trim()){
      const res = this.myFavorites.filter(x => {
        let selected = e.composedPath()[0].value.toLowerCase().trim();
        let target = x.title.toLowerCase().trim()
        const reg = new RegExp(`${selected}`)
        return target.match(reg)
      });
      this.myFavorites = res
    }
  }

  forFavorite(e: any, post: any) {
    (e.composedPath()[0].className === 'fav_1') ? this.addToFav(e, post) : this.removeFromFav(e, post);
  }

  addToFav(e: any, post: any) {
    e.composedPath()[3].classList.add('chosen')
    const dataToUpdate = doc(this.firestore, "posts", post.id);
    updateDoc(dataToUpdate, { favorite: arrayUnion(this.user.userID) }).then(() => { }).catch((err) => { alert(err.message) })
  }

  isFavorite(id: any){
    return this.myFavorites.includes(id)
  }

  removeFromFav(e: any, post: any) {
    e.composedPath()[3].classList.remove('chosen')
    const dataToUpdate = doc(this.firestore, "posts", post.id);
    updateDoc(dataToUpdate, { favorite: arrayRemove(this.user.userID) }).then(() => { }).catch((err) => { alert(err.message) }).finally( ()=> location.reload())
  }

  filterByCategory(e: any) {
    this.myFavorites = this.initialMyFav;
    this.myFavorites = this.myFavorites.filter(value => value.category.includes(e.composedPath()[0].childNodes[0].innerHTML))
    console.log(e.composedPath()[0].childNodes[0].innerHTML);
  }

}
