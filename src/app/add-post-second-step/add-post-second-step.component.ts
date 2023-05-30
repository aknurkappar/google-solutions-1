import {Component, OnInit} from '@angular/core';
import {collection, deleteDoc, doc, Firestore, getDocs} from "@angular/fire/firestore";
import {Storage} from "@angular/fire/storage";
import {User} from "../models/user";
import {AddPostFormService} from "../services/add-post-form.service";

@Component({
  selector: 'app-add-post-second-step',
  templateUrl: './add-post-second-step.component.html',
  styleUrls: ['./add-post-second-step.component.css']
})
export class AddPostSecondStepComponent implements OnInit{
  public donations: any = [];
  public loaded: boolean;
  public notSelectedMessage = "Please, choose one donation to which proceeds from this item will be donated."
  constructor(public firestore: Firestore, public storage: Storage, public addPostFormService: AddPostFormService) {
    this.loaded = false;
  }
  ngOnInit(): void {
    this.getData()
  }

  getDiff(expired: any, id: any){
    const time = new Date()
    const diffInMs = expired.seconds - time.getTime()/1000;
    if(diffInMs < 0){
      const docRef = doc(this.firestore, "donations",  `${id}`);
      deleteDoc(docRef)
          .then(() => {
          })
          .catch(error => {
            console.log(error);
          })
    }

    return Math.floor(diffInMs / (60 * 60 * 24));
  }


  getData() {
    const dbInstance = collection(this.firestore, 'donations');
    getDocs(dbInstance).then( (response) => {
      this.donations = [...response.docs.map( (item) => {
        return { ...item.data(), id:item.id }})
      ].sort( (n1, n2) => {
        // @ts-ignore
        return n2.time - n1.time;
      })
      // @ts-ignore
      this.donations = this.donations.filter(x => x.visible)
      // @ts-ignore
      this.donations = this.donations.filter(x => x.ownerId != this.addPostFormService.user.userID)
      this.loaded = true;
    }).catch( (err) => { alert(err.message) }
    ).finally( () => {
    })
  }

  chooseDonation(id : string, $event: any){
    if(this.addPostFormService.chosenDonationId == id){
      this.addPostFormService.chosenDonationId = ""
    } else {
      this.addPostFormService.chosenDonationId = id
    }
  }
}
