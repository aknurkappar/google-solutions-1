import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { collection, doc, Firestore, onSnapshot, deleteDoc, query, where, updateDoc, arrayUnion, arrayRemove } from "@angular/fire/firestore";
import { User } from "../models/user";
import {getAuth} from "firebase/auth";
import {onAuthStateChanged} from "@angular/fire/auth";

interface carouselImage {
  imageSrc: string;
  imageAlt: string;
}

@Component({
  selector: 'app-post-details',
  templateUrl: './post-details.component.html',
  styleUrls: ['./post-details.component.css']
})
export class PostDetailsComponent implements OnInit {

  user: User;
  OTPValues : string[] = [];

  public owner: any
  public post: any
  public postId: String | undefined
  public specialStatus: boolean = false
  sliderImages: carouselImage[] = []
  CorrectOTP = ""
  OTPCurrentIndex : number = 0;
  isDonate: boolean = false

  constructor(private route : ActivatedRoute, public firestore: Firestore, public router: Router) { 
    this.user = {} as User;
  }
  ngOnInit(): void { // @ts-ignore
    this.postId = this.route.snapshot.paramMap.get('id');

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

          const colUsers = collection(this.firestore, "users");
          const docRef = doc(colUsers, `${this.user.uniqID}`);
          onSnapshot(docRef, (doc) => { // @ts-ignore
            if(doc.data()["specialStatus"] === true) this.specialStatus = true
          });
        })
      }
    });

    // else this.router.navigate(['/home']);
    this.classExpression()

    if(this.postId != null) {
      this.postId = this.postId.substring(0, this.postId.length - 1);

      const colRef = location.pathname.includes("buy-and-donate") ? collection(this.firestore, "B&D") : collection(this.firestore, "posts")

      if(colRef.path === "B&D") this.isDonate = true

      const docRef = doc(colRef, `${this.postId}`);

      onSnapshot(docRef, (doc) => {
        this.post = doc.data();
        if(doc.data() == undefined) {
          this.router.navigate(['home'])
        }

        this.CorrectOTP = this.post.code

        this.sliderImages = []
        this.sliderImages.push({imageSrc: this.post.mainIMG, imageAlt: ''})
        for(let i = 0; i < this.post.images.length; i++) {
          this.sliderImages.push({
            imageSrc: this.post.images[i],
            imageAlt: ''
          })
        }

        const colUsers = collection(this.firestore, "users");
        const userQuery = query(colUsers, where("userID", "==", `${this.post.ownerId}`));
        onSnapshot(userQuery, (data) => {
          this.owner = new User(data.docs.map((item) => {
            return item.data()
          })[0])
        })
      });
    }
  }
  classExpression(): string {
    if((this.specialStatus || this.user.baursaks >= 1) && this.post.ownerId != this.user.userID) {
      return 'get_buttons special'
    }
    return 'get_buttons'
  }

  closeOTPModal(e : any) {
    if(e.composedPath()[0].classList[0] === "modal-background") {
      e.composedPath()[0].classList.toggle("modal-active");
      e.composedPath()[0].children[1].classList.remove("otp-success-modal-active");
      document.body.classList.remove('lock');
      this.resetOTPInput(e);
    }
  }

  resetOTPInput(e : any){
    this.OTPValues = []
    const OTPInputElements = document.getElementsByClassName("post-otp-modal-inputs")[0].children;
    for(let i = 0; i < OTPInputElements.length; i++){
      if(i!=0) {
        OTPInputElements[i].classList.add("disabled")
        OTPInputElements[i].classList.remove("filled-input")
      } else {
        OTPInputElements[i].classList.add("filled-input")
        if (e.composedPath()[1].firstChild.classList[0] === "otp-first-input") {
          e.composedPath()[1].firstChild.focus()
        }
      }
    }
    document.getElementsByClassName("otp-incorrect-message")[0].classList.remove("otp-incorrect-message-active")
  }

  sendCodeToOwner(e : any) {
    e.composedPath()[5].children[0].classList.toggle("modal-active");
    e.composedPath()[6].querySelector('.otp-first-input').focus();
    document.body.classList.add('lock');
  }

  deleteData() {
    const dataToDeleteOrUpdate= doc(this.firestore, 'posts', `${this.postId}`)
    const dataToUpdate= doc(this.firestore, 'users', `${this.owner.uniqID}`)

    if(!this.specialStatus){
      this.reduceFromUser()
    }

    if(this.post.amount > 1){
      // this.post.amount = this.post.amount - 1;
      let newCode = Math.floor(Math.random() * (999999 - 100000) + 100000);
      updateDoc(dataToDeleteOrUpdate, {amount: this.post.amount - 1, code: newCode})
    }
    else {
      deleteDoc(dataToDeleteOrUpdate)
      .then(() => { })
      .catch((err) => {
        alert(err.message)
      })
    }
    updateDoc(dataToUpdate, {baursaks: this.owner.baursaks + 1})
  }

  reduceFromUser(){
    const userToUpdate= doc(this.firestore, 'users', `${this.user.uniqID}`)
    updateDoc(userToUpdate, {baursaks: this.user.baursaks - 1})
  }

  moveToNextInput(e : any) {
    const incorrectMess = e.composedPath()[2].lastChild;
    const successMess = e.composedPath()[3].children[1];
    const modal = e.composedPath()[0];
    if(e.key == "Backspace") {
      if(e.composedPath()[0].previousSibling) {
        e.composedPath()[0].previousSibling.focus();
        e.composedPath()[0].previousSibling.classList.add("filled-input")
        e.composedPath()[0].classList.add("disabled")
        e.composedPath()[0].classList.remove("filled-input")
      }
    } 
    else if(e.key != "" && e.key != " ") {
      if(e.composedPath()[0] != e.composedPath()[1].lastChild) {
        e.composedPath()[0].nextSibling.classList.remove("disabled")
        e.composedPath()[0].nextSibling.focus();
        e.composedPath()[0].classList.add("filled-input")
        this.OTPCurrentIndex++;
      } 
      else {
        let finalOTPValues = "";
        for(let value of this.OTPValues) {
          finalOTPValues += value
        }
        if(finalOTPValues.toUpperCase() === this.CorrectOTP.toString()) {
          this.resetOTPInput(e)
          e.composedPath()[3].children[0].style.visibility = 'hidden';
          successMess.classList.add("otp-success-modal-active");
          setTimeout(() => {
            modal.classList.remove("modal-active")
            successMess.classList.remove("otp-success-modal-active");
          }, 3500);
          this.deleteData()
        } 
        else {
          this.resetOTPInput(e)
          incorrectMess.classList.add("otp-incorrect-message-active");
          setTimeout(() => {
            incorrectMess.classList.remove("otp-incorrect-message-active")
          }, 2500);
        }
      }
    }
  }

  forFavorite(e: any) {
    if(e.composedPath()[0].className === 'fav_1' && Object.keys(this.user).length) {
      this.addToFav(e);
    } 
    else if(!Object.keys(this.user).length) {
      window.scrollTo({top: 0}); e.composedPath()[10].childNodes[0].classList.add('show_in'); document.body.classList.add('lock');
    }
    else this.removeFromFav(e);
  }

  addToFav(e: any){
    const dataToUpdate = doc(this.firestore, "posts", `${this.postId}`);
    updateDoc(dataToUpdate, { favorite: arrayUnion(this.user.userID) }).then(() => { }).catch((err) => { alert(err.message) })
    console.log(this.sliderImages)
  }

  removeFromFav(e: any){
    const dataToUpdate = doc(this.firestore, "posts", `${this.postId}`);
    updateDoc(dataToUpdate, { favorite: arrayRemove(this.user.userID) }).then(() => { }).catch((err) => { alert(err.message) })
  }

  isFavorite() {
    return this.post.favorite.includes(this.user.userID)
  }

}
