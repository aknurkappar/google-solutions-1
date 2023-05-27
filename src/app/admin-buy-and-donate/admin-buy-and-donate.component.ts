import {AfterViewInit, Component, OnInit} from '@angular/core';
import {
  addDoc,
  collection,
  doc,
  Firestore,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where
} from "@angular/fire/firestore";
import {Storage} from "@angular/fire/storage";
import {User} from "../models/user";

@Component({
  selector: 'app-admin-buy-and-donate',
  templateUrl: './admin-buy-and-donate.component.html',
  styleUrls: ['./admin-buy-and-donate.component.css']
})
export class AdminBuyAndDonateComponent implements OnInit, AfterViewInit {

  visiblePosts: any[] | undefined
  loaded = false

  constructor(public firestore: Firestore, public storage: Storage) { }

  ngOnInit() {
    this.getVisiblePosts()
  }
  ngAfterViewInit() {

  }

  getVisiblePosts() {
    const dbInstance = collection(this.firestore, 'B&D');
    getDocs(dbInstance).then((response) => {
      this.visiblePosts = [...response.docs.map((item) => {
        return {
          ...item.data(),
          id: item.id,
          ownerUser: User,
        }
      })].sort((n1, n2) => {// @ts-ignore
        return n2.time - n1.time
      });
    }).catch((err) => {
      alert(err.message)
    }).finally(() => {
      if(this.visiblePosts != undefined) {
        for(let i of this.visiblePosts) {
          if(i.ownerId != undefined) {
            const colUsers = collection(this.firestore, "users");
            const userQuery = query(colUsers, where("userID", "==", i.ownerId));
            onSnapshot(userQuery, (data) => {
              i.ownerUser = new User(data.docs.map((item) => {
                return item.data()
              })[0])
            })
          }
        }
      }
      this.loaded = true
    })
    onSnapshot(dbInstance, (response) => {
      console.log(response.docs.map((item) => {
        return {...item.data(), id: item.id}
      }));
    });
  }

  openContinueModal(e: any) {
    console.log(e.composedPath()[0])
    if (e.composedPath()[0].innerHTML === 'Accept') {
      e.composedPath()[1].childNodes[2].classList.add('open');
      document.body.classList.add('lock');
    }
    if (e.composedPath()[0].innerHTML === 'Reject') {
      e.composedPath()[1].childNodes[3].classList.add('open');
      document.body.classList.add('lock');
    }
  }

  cancelAction(e: any) {
    e.composedPath()[3].classList.remove('open');
    document.body.classList.remove('lock');
  }

  showReason(e: any) {
    e.composedPath()[1].classList.toggle('open');
  }

  doAction(e: any, id: String, ownerUser: User, chosen: string) {
    if(chosen === "acceptpost") {
      this.acceptPost(id, ownerUser.userID)
      e.composedPath()[3].classList.remove('open');
      document.body.classList.remove('lock');
    }
    if(chosen === "rejectpost") {
      this.rejectPost(id, ownerUser.userID)
      e.composedPath()[3].classList.remove('open');
      document.body.classList.remove('lock');
    }
  }

  acceptPost(id: String, ownerID: string) { // @ts-ignore
    const dataToUpdate = doc(this.firestore, "posts", id);
    updateDoc(dataToUpdate, {
      visibility: 'active',
      time: new Date()
    })
    .then(() => {
      this.sendNotification(ownerID, "Your post was accepted")
    })
    .catch((err) => {
      alert(err.message)
    })
  }

  deleteData(id: String, userID: String) { // @ts-ignore
    const dataToUpdate = doc(this.firestore, 'posts', id)
    updateDoc(dataToUpdate, {
      visibility: 'rejected'
    }).then(() => {
      this.sendNotification(userID, "Your post was rejected")
    })
  }

  rejectPost(id: String, userID: String) {
    this.deleteData(id, userID)
  }

  sendNotification(spuserID: any, message: string) {
    let value = {} as any
    value.sender = "Admin";
    value.userID = spuserID;
    value.message = message;
    value.time = new Date();
    const dbInstance = collection(this.firestore, 'notifications')
    addDoc(dbInstance, value).then((res) => {
    }).catch((err) => {
      alert(err.message)
    }).finally(() => {
      location.reload()
    })
  }

  priceRange(slider: any) {
    const price = document.querySelector(".slider_value span") // @ts-ignore
    price.textContent = slider.composedPath()[0].value
  }

}