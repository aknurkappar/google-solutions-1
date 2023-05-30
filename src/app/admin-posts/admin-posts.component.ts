import {Component, OnInit} from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
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
import {user} from "@angular/fire/auth";

@Component({
  selector: 'app-admin-posts',
  templateUrl: './admin-posts.component.html',
  styleUrls: ['./admin-posts.component.css']
})
export class AdminPostsComponent implements OnInit{

  currentAction : any;
  visiblePosts: any[] | undefined

  loaded = false;

  constructor(public firestore: Firestore, public storage: Storage) {

  }

  ngOnInit(){
    this.getVisiblePosts()
  }

  handleSeeMorePost(e : any){
    if(e.composedPath()[1].classList[0] === "admin-post-see-more-button") {
      e.composedPath()[2].children[0].classList.toggle("display-none")
      e.composedPath()[2].children[1].classList.toggle("display-none")
      e.composedPath()[2].children[1].classList.toggle("admin-post-more")
      e.composedPath()[2].children[2].classList.toggle("see-less")
    }
  }

  getVisiblePosts() {
    const dbInstance = collection(this.firestore, 'posts');
    getDocs(dbInstance).then( (response) => {
      this.visiblePosts = [...response.docs.map( (item) => {
        return { ...item.data(),
          id:item.id,
          ownerUser: User,
        }})
      ].sort((n1, n2) => {
        console.log(n1, n2)
        // @ts-ignore
        return n2.time - n1.time
      } );
    }).catch( (err) => { alert(err.message) }
    ).finally( () => {

      if(this.visiblePosts != undefined){
        for(let i of this.visiblePosts){
          if(i.ownerId != undefined){
            const colUsers = collection(this.firestore, "users");
            const userQuery = query(colUsers, where("userID", "==", i.ownerId));
            onSnapshot(userQuery, (data) => {
              i.ownerUser = new User(data.docs.map((item) => {
                return item.data()
              })[0])
            })
            // this.getVisiblePosts()
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

  openContinueModal(e : any){
    console.log(e.composedPath()[0])
    if(e.composedPath()[0].innerHTML === 'Accept') {
      e.composedPath()[1].childNodes[2].classList.add('open'); document.body.classList.add('lock');
    }
    if(e.composedPath()[0].innerHTML === 'Reject') {
      e.composedPath()[1].childNodes[3].classList.add('open'); document.body.classList.add('lock');
    }
  }

  cancelAction(e : any){
    e.composedPath()[3].classList.remove('open');
    document.body.classList.remove('lock');
  }

  showReason(e: any) {
    e.composedPath()[1].classList.toggle('open');
  }

  doAction(e : any, id: String, ownerUser: User, title: string, chosen: string) {
    if(chosen === "acceptpost") {
      this.acceptPost(id, ownerUser.userID, title)
      e.composedPath()[3].classList.remove('open');
      document.body.classList.remove('lock');
    }
    if(chosen === "rejectpost") {
      this.rejectPost(id, ownerUser.userID, title)
      e.composedPath()[3].classList.remove('open');
      document.body.classList.remove('lock');
    }
  }

  acceptPost(id: String, ownerID: string, title: string) { // @ts-ignore
    const dataToUpdate = doc(this.firestore, "posts", id);
    updateDoc(dataToUpdate, {
      visibility: 'active',
      time: new Date()
    })
    .then(() => {
      this.sendNotification(ownerID, `Your post ${title} was accepted`)
    })
    .catch((err) => {
      alert(err.message)
    })
  }

  deleteData(id: String, userID: String, title: string) { // @ts-ignore
    const dataToUpdate = doc(this.firestore, 'posts', id)
    updateDoc(dataToUpdate, {
      visibility: 'rejected'
    }).then( ()=> {
      this.sendNotification(userID, `Your post ${title} was accepted`)
    })
  }


  rejectPost(id: String, userID: String, title: string){
    this.deleteData(id, userID, title)
  }

  sendNotification(spuserID: any, message: string){
    let value = {} as any
    value.sender = "Admin";
    value.userID = spuserID;
    value.message = message;
    value.time = new Date();
    const dbInstance = collection(this.firestore, 'notifications')
    addDoc(dbInstance, value).then((res) => {}).catch((err) => { alert(err.message) }).finally( ()=> { location.reload() })
  }

  openImage(e: any) {
    e.composedPath()[1].querySelector(".full_image").classList.add("show")
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