import { Component } from '@angular/core';
import {addDoc, Firestore, collection, getDocs, updateDoc, doc, deleteDoc, arrayUnion, query, where, onSnapshot } from '@angular/fire/firestore'
import { Storage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage'

@Component({
  selector: 'app-admin-special-users',
  templateUrl: './admin-special-users.component.html',
  styleUrls: ['./admin-special-users.component.css']
})
export class AdminSpecialUsersComponent {
  currentAction : any;
  specialUsers: any[] | undefined;

  constructor(public firestore: Firestore, public storage: Storage) {
    this.getSpecialUsers()
  }

  openContinueModal(e : any){
    e.composedPath()[2].children[2].style.display = "flex";
    this.currentAction = e.target;
  }

  cancelAction(e : any){
    e.composedPath()[4].children[2].style.display = "none"
  }

  doAction(e : any, spuser: any){
    if(this.currentAction.innerText === "Accept"){
      this.giveStatus(spuser, true)
      this.acceptPost(spuser.userID)
      e.composedPath()[4].children[2].style.display = "none"
    } else if(this.currentAction.innerText === "Reject"){
      this.giveStatus(spuser, false)
      this.rejectPost(spuser.userID)
      e.composedPath()[4].children[2].style.display = "none"
    }

    const dataToDelete = doc(this.firestore, 'requestToStatus', `${spuser.id}`)
    deleteDoc(dataToDelete)
    .then(() => {
      location.reload()
    }).catch((err) => { alert(err.message) })
  }

  acceptPost(spuserID: any){
    let value = {} as any
    value.sender = "Admin"
    value.userID = spuserID
    value.message = "Your application was accepted"
    value.time = new Date()
    const dbInstance = collection(this.firestore, 'notifications')
    addDoc(dbInstance, value).then((res) => { }).catch((err) => { alert(err.message) })
  }

  rejectPost(spuserID: any){
    let value = {} as any
    value.sender = "Admin"
    value.userID = spuserID
    value.message = "Your application was rejected"
    value.time = new Date()
    const dbInstance = collection(this.firestore, 'notifications')
    addDoc(dbInstance, value).then((res) => { }).catch((err) => { alert(err.message) })
  }

  downloadDoc(spuser: any) {
    for(let i = 0; i < spuser.SocialDocs.length; i++) {
      window.open(spuser.SocialDocs[i], "_blank");
    }
  }

  getSpecialUsers() {
    const dbInstance = collection(this.firestore, 'requestToStatus');
    getDocs(dbInstance).then( (response) => {
      this.specialUsers = [...response.docs.map( (item) => {
        return { ...item.data(), id:item.id }})
      ].sort((n1, n2) => {
        // @ts-ignore
        return n2.time - n1.time
      } )
    }).catch( (err) => { alert(err.message) }
    )
  }

  giveStatus(spuser: any, status: boolean){
    const dbInstance = collection(this.firestore, 'users');
    const userQuery = query(dbInstance, where("userID", "==", `${spuser.userID}`))
    onSnapshot(userQuery, (data) => {
      let key  = (data.docs.map((item) => {
        return item.id
      })[0])
      const dataToUpdate = doc(this.firestore, "users", key);
      updateDoc(dataToUpdate, {
        specialStatus: status
      }).then(() => {}).catch((err) => { alert(err.message) })
    })
  }

}
