import { Component } from '@angular/core';
import {
  addDoc,
  Firestore,
  collection,
  getDocs,
  updateDoc, doc,
  deleteDoc

} from '@angular/fire/firestore'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title="JomartBol"
  public data: any = []
  constructor(public firestore: Firestore) {
    this.getData()
  } 

  addData(value: any){
    const dbInstance = collection(this.firestore, 'posts')
    addDoc(dbInstance, value)
      .then(() => {
         alert("Data sent")
        this.getData()
      })
      .catch((err) => {
        alert(err.message)
      })
  }

  getData(){
    const dbInstance = collection(this.firestore, 'posts');
    getDocs(dbInstance)
      .then((response) => {
        console.log(response.docs.map((item) => {
          return {...item.data(), id:item.id}
        }));

        this.data = [...response.docs.map((item) => {
          return {...item.data(), id:item.id}
        })]
      })
      .catch((err)=>{
        alert(err.message)
      })
  }

  updateData(id: string){
    const dataToUpdate = doc(this.firestore, "posts", id);
    updateDoc(dataToUpdate, {
      name: "Fantasy"
    })
      .then(() => {
        alert("Data updated")
        this.getData()
      })
      .catch((err) => {
        alert(err.message)
      })
  }

  deleteData(id: string){
    const dataToDelete = doc(this.firestore, 'posts', id)
    deleteDoc(dataToDelete)
      .then(() => {
        alert("Data deleted");
        this.getData()
      })
      .catch((err) => {
        alert(err.message)
      })
  }

}
