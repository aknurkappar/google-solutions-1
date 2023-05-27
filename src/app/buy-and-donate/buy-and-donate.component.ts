import { Component } from '@angular/core';
import {User} from "../models/user";
import {
  arrayRemove,
  arrayUnion,
  collection, deleteDoc,
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

  public buyAndDonates: any[];
  initialBuyAndDonates: any = []
  public myFavorites: any[];

  public categories = categories;

  public loaded: boolean;

  constructor(public firestore: Firestore, public router: Router) {
    this.buyAndDonates = [] as any;
    this.myFavorites = [] as any;
    this.user = {} as User;
    this.loaded = false;
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
        })
      }
    });
    this.getData()
  }

  getData() {
    const dbInstance = collection(this.firestore, 'B&D');
    getDocs(dbInstance).then( (response) => {
      this.buyAndDonates = [...response.docs.map( (item) => {
        return { ...item.data(), id:item.id }})
      ].sort((n1, n2) => {
        // @ts-ignore
        return n2.time - n1.time
      } )
      for(let i of this.buyAndDonates){
        if(i.expiredDate != undefined) this.getDiff(i.expiredDate, i.id);
      }
      this.loaded = true;
      this.initialBuyAndDonates = this.buyAndDonates
    }).catch( (err) => { alert(err.message) }
    ).finally( () => {
      this.myFavorites = this.buyAndDonates.filter( value => {
        if(value.favorite != undefined){
          return value.favorite.includes(this.user.userID)
        }
      }).map((value) => value.id);
    })
  }

  search(e: any){
    this.buyAndDonates = this.initialBuyAndDonates;
    if(e.composedPath()[0].value && e.composedPath()[0].value.trim()){
      const res = this.buyAndDonates.filter(x => {
        let selected = e.composedPath()[0].value.toLowerCase().trim();
        let target = x.title.toLowerCase().trim()
        const reg = new RegExp(`${selected}`)
        return target.match(reg)
      });
      this.buyAndDonates = res
    }
  }

  forFavorite(e: any, post: any) {
    (e.composedPath()[0].className === 'fav_1') ? this.addToFav(e, post) : this.removeFromFav(e, post);
  }

  addToFav(e: any, post: any) {
    e.composedPath()[3].classList.add('chosen')
    const dataToUpdate = doc(this.firestore, "B&D", post.id);
    updateDoc(dataToUpdate, { favorite: arrayUnion(this.user.userID) }).then(() => { }).catch((err) => { alert(err.message) })
  }

  isFavorite(id: any){
    return this.myFavorites.includes(id)
  }

  removeFromFav(e: any, post: any) {
    e.composedPath()[3].classList.remove('chosen')
    const dataToUpdate = doc(this.firestore, "B&D", post.id);
    updateDoc(dataToUpdate, { favorite: arrayRemove(this.user.userID) }).then(() => { }).catch((err) => { alert(err.message) }).finally( ()=> location.reload())
  }

  filterByCategory(e: any) {
    this.buyAndDonates = this.initialBuyAndDonates;
    this.buyAndDonates = this.buyAndDonates.filter(value => value.category.includes(e.composedPath()[0].childNodes[0].innerHTML))
    console.log(e.composedPath()[0].childNodes[0].innerHTML);
  }

  getDiff(expired: any, id: any){
    const time = new Date()
    const diffInMs = expired.seconds - time.getTime()/1000;
    if(diffInMs < 0){
      const docRef = doc(this.firestore, "B&D",  `${id}`);
      deleteDoc(docRef)
      .then(() => {
      })
      .catch(error => {
        console.log(error);
      })
    }
  }

}
