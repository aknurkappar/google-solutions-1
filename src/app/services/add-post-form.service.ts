import {Injectable, OnInit} from '@angular/core';
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  Firestore,
  onSnapshot,
  query,
  updateDoc,
  where
} from "@angular/fire/firestore";
import {getDownloadURL, ref, Storage, uploadBytesResumable} from "@angular/fire/storage";
import {User} from "../models/user";
import {Router} from "@angular/router";
import {getAuth} from "firebase/auth";
import {onAuthStateChanged} from "@angular/fire/auth";

@Injectable({
  providedIn: 'root'
})
export class AddPostFormService{

  public postCategory: string[] = [];
  public postImages: any = [];
  public images: any = [];
  public categoryText: string = ""
  public uploaded: boolean;
  public user : User
  public post : any

  // B&D
  public chosenDonationId : string
  public notSelectedMessageIsActive : boolean

  constructor(public firestore: Firestore, public storage: Storage, public router: Router) {
    this.uploaded = false
    this.user = {} as User;
    this.post = {}
    this.images = []
    this.post.images = []
    this.post.category = []
    this.post.amount = 1
    this.post.bookedUserId = ""

    // B&D
    this.notSelectedMessageIsActive = false
    this.chosenDonationId = ""

    // get user
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

        })
      }
    });
  }

  photosRedactor(e: any) {
    if(e.composedPath()[0].className === "makemain") {
      [this.postImages[0], this.postImages[e.composedPath()[2].childNodes[0].alt]] = [this.postImages[e.composedPath()[2].childNodes[0].alt], this.postImages[0]];
      [this.images[0], this.images[e.composedPath()[2].childNodes[0].alt]] = [this.images[e.composedPath()[2].childNodes[0].alt], this.images[0]];
    }
    if(e.composedPath()[0].className === "deleteimg") {
      this.postImages.splice(e.composedPath()[2].childNodes[0].alt, 1);
      this.images.splice(e.composedPath()[2].childNodes[0].alt, 1);
    }
  }

  addDays(date: Date, days: number) {
    let result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  handleFirstStepValidation(event : any){
    const postForm = event.composedPath()[7];
    if(this.post.title == "" || this.post.description == "" || this.post.category.length == 0 || this.post.location == "" || this.post.amount == 0 || !this.uploaded ) {
      postForm.classList.add('occured');
      if(!this.post.title) postForm.querySelectorAll('input')[0].style.borderColor = '#e81f1f';
      if(this.post.category.length == 0) postForm.querySelectorAll('input')[1].style.borderColor = '#e81f1f';
      if(!this.post.location) postForm.querySelectorAll('input')[2].style.borderColor = '#e81f1f';
      if(!this.post.phone) postForm.querySelectorAll('input')[5].style.borderColor = '#e81f1f';
      if(!this.post.description) postForm.querySelector('textarea').style.borderColor = '#e81f1f';
      if(!this.post.amount) postForm.querySelector('.amount').style.borderColor = '#e81f1f';
      if(this.images.length == 0) postForm.querySelector('.file label').style.borderColor = '#e81f1f';
      setTimeout(() => {
        for(let i = 0; i < postForm.querySelectorAll('input').length; i++) {
          postForm.querySelectorAll('input')[i].style.borderColor = '#E2E2E2';
        }
        postForm.querySelector('textarea').style.borderColor = '#E2E2E2';
        postForm.querySelector('.amount').style.borderColor = '#E2E2E2';
        postForm.querySelector('.file label').style.borderColor = '#E2E2E2';
        postForm.classList.remove('occured');
      }, 3000);
      return
    } else {
      if(this.user.specialStatus){
        this.router.navigate(["/home/add-post/2"])
      }
    }
    if(!this.user.specialStatus) {
      this.addData(event)
    }
  }

  handleSecondStepValidation(event : any){
    // B&D
    if(this.chosenDonationId == "") {
      this.notSelectedMessageIsActive = true
      setTimeout(() => {
        this.notSelectedMessageIsActive = false
      }, 3000)
    } else {
      event.donationID = this.chosenDonationId
    }
    this.addData(event)
  }

  addData(event: any) {
    const dbInstance = collection(this.firestore, (!event.donationID) ? "posts" : "B&D");
    const postForm = event.composedPath()[7];
    console.log(event)

    this.post.ownerId = this.user.userID
    this.post.category = this.postCategory;
    this.post.time =  new Date()
    this.post.expiredDate = this.addDays(this.post.time, 30)
    // this.location = postForm.querySelector('.input_location').value;
    this.post.code = Math.floor(Math.random() * (999999 - 100000) + 100000)
    this.post.visibility = "inProgress"
    this.post.favorite = []
    if(this.user.specialStatus){
      this.post.donationID = event.donationID
      this.post.price = 0
    }

    addDoc(dbInstance, this.post).then((res) => {
      this.uploadImages(res.id, postForm, (!event.donationID));
    }).catch((err) => { alert(err.message) }
    )
  }


  uploadImages(id: string, postForm: any, isPost: boolean) {
    const len = Number(this.images.length);
    let totalProg = 0;
    console.log(isPost)

    for (let i = 0; i < this.images.length; i++) {
      const storageRef = ref(this.storage, `images/${this.images[i].name}`);
      const uploadTask = uploadBytesResumable(storageRef, this.images[i]);

      uploadTask.on('state_changed',
          (snapshot) => {
          },
          (error) => {
            console.log(error.message)
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              const dataToUpdate = doc(this.firestore, (isPost ? "posts" : "B&D"), id);

              if (i == 0) updateDoc(dataToUpdate, {mainIMG: downloadURL}).then(() => {
              }).catch((err) => {
                alert(err.message)
              })
              else updateDoc(dataToUpdate, {images: arrayUnion(downloadURL)}).then(() => {
              }).catch((err) => {
                alert(err.message)
              })

              totalProg += (100 / len);

              if (totalProg >= 100) {
                postForm.querySelector('.progress_bar').style.width = (totalProg + '%');
                this.uploaded = false;
                setTimeout(async ()=>{
                  await this.router.navigate(['/home'])
                  await document.body.classList.remove('lock');
                  await window.location.reload();
                }, 1000)

              } else postForm.querySelector('.progress_bar').style.width = (totalProg + '%');
            });
          }
      )
    }
  }


  upload($event: any) {
    console.log($event)
    console.log($event.target)
    const postForm = $event.target.closest('.post_form');
    console.log(postForm)
    if($event.target.files.length > 5 || (this.postImages.length + $event.target.files.length) > 5) {
      postForm.classList.add('limit');
      setTimeout(() => {
        postForm.classList.remove('limit');
      }, 3000);
      return
    }

    for(let i = 0; i < $event.target.files.length; i++) {
      var reader = new FileReader();
      reader.readAsDataURL($event?.target.files[i]);

      if(Number(this.postImages.length) >= 5) {
        postForm.classList.add('limit');
        setTimeout(() => {
          postForm.classList.remove('limit');
        }, 3000);
        return
      }

      reader.onload = (event: any) => {
        this.postImages.push(event.target.result)
      }
      this.images.push($event.target.files[i]);
    }

    this.uploaded = true;
  }

}
