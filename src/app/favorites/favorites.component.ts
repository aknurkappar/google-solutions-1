import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

import {
    Firestore,
    collection,
    getDocs,
    arrayUnion,
    query,
    where,
    doc,
    updateDoc,
    arrayRemove,
    onSnapshot
} from '@angular/fire/firestore'
import { User } from "../models/user";

import { Category } from "../catalog";
import { categories } from "../catalog";
import {getAuth} from "firebase/auth";
import {onAuthStateChanged} from "@angular/fire/auth";

@Component({
    selector: 'app-favorites',
    templateUrl: './favorites.component.html',
    styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit {

    user: User;

    public myFavorites: any[];
    initialMyFav: any = []

    public categories = categories;

    public loaded: boolean;
    url1: string = '/buy-and-donate/';
    url2: string = '/postdetails/';

    constructor(public firestore: Firestore, public router: Router) {
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
                    const q = query(collection(this.firestore, "posts"), where("favorite", "array-contains", this.user.userID));
                    const q2 = query(collection(this.firestore, "B&D"), where("favorite", "array-contains", this.user.userID));
                    getDocs(q).then( (data) => {
                        this.myFavorites = [...data.docs.map( (item) => {
                            return { ...item.data(), id:item.id, donate: false}})
                        ]
                        this.initialMyFav = this.myFavorites;
                        this.loaded = true;
                    })
                    getDocs(q2).then((data)=> {
                        this.myFavorites.push(...[...data.docs.map( (item) => {
                            return { ...item.data(), id:item.id, donate: true}})
                        ])
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
        const dataToUpdate = post.donate == false ? doc(this.firestore, "posts", post.id) : doc(this.firestore, "B&D", post.id)
        updateDoc(dataToUpdate, { favorite: arrayUnion(this.user.userID) }).then(() => { }).catch((err) => { alert(err.message) })
    }

    removeFromFav(e: any, post: any) {
        e.composedPath()[3].classList.remove('chosen')
        const dataToUpdate = post.donate == false ? doc(this.firestore, "posts", post.id) : doc(this.firestore, "B&D", post.id)
        updateDoc(dataToUpdate, { favorite: arrayRemove(this.user.userID) }).then(() => { }).catch((err) => { alert(err.message) }).finally( ()=> location.reload())
    }

    filterByCategory(e: any) {
        this.myFavorites = this.initialMyFav;
        this.myFavorites = this.myFavorites.filter(value => value.category.includes(e.composedPath()[0].childNodes[0].innerHTML))
    }

    getUrl1(id: string){
        return this.url1+id+"%7D"
    }

    getUrl2(id: string){
        return this.url2+id+"%7D"
    }
}
