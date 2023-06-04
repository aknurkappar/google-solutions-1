import {Component, ElementRef, NgZone, OnInit, ViewChild} from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { collection, doc, Firestore, onSnapshot, deleteDoc, query, where, updateDoc, arrayUnion, arrayRemove } from "@angular/fire/firestore";
import { User } from "../models/user";
import { getAuth } from "firebase/auth";
import { onAuthStateChanged } from "@angular/fire/auth";
import {MapsAPILoader} from "@agm/core";
import {ChatService} from "../services/chat.service";
import {Chat} from "../models/chat";
import {ModalConditionService} from "../services/modal-condition.service";

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
  OTPCurrentIndex : number = 0

  isDonate: boolean = false

  // @ts-ignore
  map: google.maps.Map;

  // @ts-ignore
  myChats: Chat[] = []
  loading : boolean

  constructor(private route : ActivatedRoute, public firestore: Firestore, public router: Router, private mapsAPILoader: MapsAPILoader, private chatService: ChatService, private modalConditionService: ModalConditionService) {
    this.user = {} as User;
    this.loading = false
  }

  ngOnInit(): void { // @ts-ignore
    this.postId = this.route.snapshot.paramMap.get('id');

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

          this.chatService.myChats(this.user).subscribe((chats) => {
            this.myChats = chats
          })

          const colUsers = collection(this.firestore, "users");
          const docRef = doc(colUsers, `${this.user.uniqID}`);
          onSnapshot(docRef, (doc) => { // @ts-ignore
            if(doc.data()["specialStatus"] === true) this.specialStatus = true
          });
        })
      }
    });

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

        if(this.post.takerID === undefined || this.post.takerID === null){
          this.post.takerID = null
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

    setTimeout(() => {
      this.initMap();
      this.geocodeAddress(this.post.location);
    }, 500)

    this.classExpression()
  }

  initMap() {
    this.map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
      center: { lat: 0, lng: 0 },
      zoom: 12
    });
  }

  geocodeAddress(address: string) {
    this.mapsAPILoader.load().then(() => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if(status === 'OK' && results[0]) {
          const location = results[0].geometry.location;

          // Update the map's center
          this.map.setCenter(location);

          // Add a marker for the geocoded address
          new google.maps.Marker({
            position: location,
            map: this.map
          });
        } else {
          console.error('Geocode was not successful for the following reason:', status);
        }
      });
    });
  }

  classExpression(): string {
    if(this.post.visibility == "booked" && this.post.bookedUserId != this.user.userID) {
      return 'get_buttons item_booked'
    }
    if(!this.post.takerID && !this.specialStatus && this.post.ownerId != this.user.userID) {
      return 'get_buttons not_bought'
    }
    if(this.post.takerID != undefined && !this.specialStatus && this.user.uniqID == this.post.takerID && this.post.ownerId != this.user.userID) {
      return 'get_buttons bought'
    }
    if((this.specialStatus || this.user.baursaks >= 1) && this.post.ownerId != this.user.userID) {
      return 'get_buttons special'
    }
    return 'get_buttons'
  }

  ownerInfoExpression(): string {
    if(this.specialStatus) {
      return 'post-details-bottom-text special'
    }
    if(this.post.price != undefined) {
      return 'post-details-bottom-text special'
    }
    if(this.post.ownerId == this.user.userID) {
      return 'post-details-bottom-text special'
    }
    if(this.post.takerID != null && this.post.takerID == this.user.uniqID) {
      return 'post-details-bottom-text special'
    }
    return 'post-details-bottom-text'
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
    e.composedPath()[6].children[0].classList.toggle("modal-active");
    e.composedPath()[7].querySelector('.otp-first-input').focus();
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

  chatWithUser(option: boolean) {
    if(!option) {
      this.chatService.createChat(this.user, this.owner as User)
      this.chatService.urlPath = true
      this.router.navigate(["/chat"]).then()
    } else {
      this.chatService.urlPath = true
      this.router.navigate(["/chat"]).then()
    }
  }

  chatContains(): boolean {
    let cnt = 0
    this.myChats.forEach((chat) => {
      if(chat.userIds.includes(this.owner.uniqID)) cnt++
    })
    return cnt > 0;

  }

  handleBookingModel(event : any){
    if(this.post.visibility != "booked"){
      event.composedPath()[1].children[2].classList.add("modal-open")
      document.body.classList.add('lock');
    }
  }

  cancelBookingAction(event : any){
    if(event.composedPath()[1].classList[0] == "book-modal-buttons") {
      event.composedPath()[3].classList.remove("modal-open")
      } else if(event.composedPath()[0].classList[0] == "book-modal-background"){
      event.composedPath()[0].classList.remove("modal-open")
    }
    document.body.classList.remove('lock');
  }

  bookItem(event : any){
    this.loading = true
    const dataToUpdate = doc(this.firestore, "posts", this.postId as string);
    updateDoc(dataToUpdate, {
      visibility: 'booked',
      bookedUserId: this.user.userID
    })
        .then(() => {
          this.loading = false
          localStorage.setItem("postBooked", "true")
          localStorage.setItem("bookedItemId", this.postId as string)
          localStorage.setItem("bookedUserId", this.user.userID)
          location.reload()
        })
        .catch((err) => {
          alert(err.message)
          location.reload()
        })
  }

  cancelBookingModal(event : any){
    event.composedPath()[1].children[3].classList.add("modal-open")
    document.body.classList.add('lock');
  }

  cancelBookingItem(){
    this.loading = true
    const dataToUpdate = doc(this.firestore, "posts", this.postId as string);
    updateDoc(dataToUpdate, {
      visibility: 'active',
      bookedUserId: ""
    })
        .then(() => {
          this.loading = false
          localStorage.removeItem("postBooked")
          localStorage.removeItem("bookedItemId")
          localStorage.removeItem("bookedUserId")
          location.reload()
        })
        .catch((err) => {
          alert(err.message)
          location.reload()
        })
  }

  bookingInfoExpression(): string {
    if(!this.specialStatus || this.post.ownerId == this.user.userID) {
      return 'post-booking-unavailable'
    } else if(this.post.bookedUserId == this.user.userID) {
      return 'post-booking-cancel'
    } else if(this.post.visibility == "booked") {
      return 'post-booking-already-booked'
    } else if(this.modalConditionService.postBooked != null && this.modalConditionService.postBooked == "true") {
      return 'your_booked_one'
    }
    return ''
  }

}
