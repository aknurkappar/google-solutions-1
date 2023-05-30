import {Component, OnInit, ViewChild} from '@angular/core';
import {
  addDoc,
  collection, deleteDoc,
  doc,
  Firestore,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where
} from "@angular/fire/firestore";
import {User} from "../models/user";

@Component({
  selector: 'app-admin-donations',
  templateUrl: './admin-donations.component.html',
  styleUrls: ['./admin-donations.component.css']
})
export class AdminDonationsComponent implements OnInit{
  donations: any = []
  currentAction : any;
  loaded = false;

  user: any;

  ngOnInit() {
    this.getData()
  }

  constructor(public firestore: Firestore) { }

  openContinueModal(e : any){
    console.log(e.composedPath()[0])
    if(e.composedPath()[0].innerHTML === 'Accept') {
      e.composedPath()[1].childNodes[3].classList.add('open'); document.body.classList.add('lock');
    }
    if(e.composedPath()[0].innerHTML === 'Reject') {
      e.composedPath()[1].childNodes[4].classList.add('open'); document.body.classList.add('lock');
    }
  }

  cancelAction(e : any){
    e.composedPath()[3].classList.remove('open');
    document.body.classList.remove('lock');
  }

  showReason(e: any) {
    e.composedPath()[1].classList.toggle('open');
  }

  doAction(e : any, id: String, ownerUser: User, chosen: string) {
    if(chosen === "acceptpost") {
      this.acceptPost(id, ownerUser.userID)
      e.composedPath()[3].classList.remove('open');
      document.body.classList.remove('lock');
    }
    if(chosen === "rejectpost") {
      this.rejectPost(id, ownerUser.userID)
      console.log(e.composedPath())
      e.composedPath()[3].classList.remove('open');
      document.body.classList.remove('lock');
    }
  }

  acceptPost(id: String, ownerID: string){
    // @ts-ignore
    const dataToUpdate = doc(this.firestore, "donations", id);
    updateDoc(dataToUpdate, {
      visible: true,
      time: new Date()
    })
    .then(() => {
      this.sendNotification(ownerID, "Your donation was accepted")
    })
    .catch((err) => {
      alert(err.message)
    })
  }

  rejectPost(id: String, userID: String){
    const docRef = doc(this.firestore, "donations",  `${id}`);
    deleteDoc(docRef)
        .then(() => {
          this.sendNotification(userID, "Your donation was rejected")
        })
        .catch(error => {
          console.log(error);
        })
  }

  sendNotification(spuserID: any, message: string){
    let value = {} as any
    value.sender = "Admin";
    value.userID = spuserID;
    value.message = message;
    value.time = new Date()
    const dbInstance = collection(this.firestore, 'notifications')
    addDoc(dbInstance, value)
        .then((res) => {

        })
        .catch((err) => {
          alert(err.message)
        })
        .finally( ()=> {
          location.reload()
        })

  }

  getData() {
    const dbInstance = collection(this.firestore, 'donations');
    getDocs(dbInstance).then( (response) => {
      this.donations = [...response.docs.map( (item) => {
        return { ...item.data(),
          id:item.id,
          ownerUser: User}})
      ].sort((n1, n2) => {
        console.log(n1, n2)
        // @ts-ignore
        return n2.time - n1.time
      } )
      this.loaded = true;
    }).catch( (err) => { alert(err.message) }
    ).finally( () => {
      if(this.donations != undefined){
        for(let i of this.donations){
          if(i.ownerId != undefined){
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
    })
  }

  openDocuments(files: any[]){
    for(let i of files){
      window.open(i)
    }
  }

  openImage(e: any) {
    e.composedPath()[4].querySelector(".full_image").classList.add("show")
    document.body.classList.add("lock")
  }
  closeImage(e: any) {
    console.log(e.composedPath()[0].className)
    if(e.composedPath()[0].className == "full_image show") {
      e.composedPath()[0].classList.remove("show")
      document.body.classList.remove("lock")
    }
  }

}
