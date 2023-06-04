import { Component, OnInit } from '@angular/core';
import { User } from "../models/user";
import { Router } from "@angular/router";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  Firestore,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where
} from "@angular/fire/firestore";
import { getDownloadURL, ref, Storage, uploadBytesResumable } from "@angular/fire/storage";
// @ts-ignore
import * as html2pdf from 'html2pdf.js';
import {onAuthStateChanged, signOut} from "@angular/fire/auth";
import {getAuth} from "firebase/auth";


interface File {
  name? : String;
  url? : any;
}

class Category {
  public name : String;
  public subCategories? : Category[];
  public selected : boolean = false;
  public isActive : boolean = false
  constructor(name : String, subCategories : Category[]) {
    this.name = name;
    this.subCategories = subCategories;
  }
}

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {
  public user: User;

  public isActive = false;
  public isAuthorized: boolean = false;
  public isLoading = false;

  public imageIsLoading = false;
  public IdenticalImages: any = [];
  public SocialImages: any = [];
  public accountImageTemp : any = ""

  public certificateGivenDate: number | undefined;

  public categories : Category[];
  public selectedCategory : String;
  public selectedCategoryPath : String;

  public myPost: any[] = [];
  public buyDonate: any[] = [];
  public myBuyDonate: any[] = [];
  public initialPost: any

  public specialStatus: boolean = false

  ngOnInit(): void {
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
          this.isAuthorized = true;

          const q = query(collection(this.firestore, "posts"), where("ownerId", "==", this.user.userID));
          getDocs(q).then( (data) => {
            this.myPost = [...data.docs.map( (item) => {
              return { ...item.data(), id:item.id }})
            ]
            this.initialPost = this.myPost
          })

          const q2 = query(collection(this.firestore, "B&D"), where("ownerId", "==", this.user.userID));
          getDocs(q2).then( (data) => {
            this.myPost.push(...[...data.docs.map( (item) => {
              return { ...item.data(), id:item.id }})
            ])
            this.initialPost = this.myPost
          })

          const q3 = query(collection(this.firestore, "B&D"), where("takerID", "==", this.user.uniqID));
          getDocs(q3).then( (data) => {
            this.buyDonate = [...data.docs.map( (item) => {
              return { ...item.data(), id:item.id }})
            ]
          })

          const colUsers = collection(this.firestore, "users");
          const docRef = doc(colUsers, `${this.user.uniqID}`);
          onSnapshot(docRef, (doc) => { // @ts-ignore
            if(doc.data()["specialStatus"] === true) this.specialStatus = true
          });
        })
      }
      else {
        this.router.navigate(['/home']);
      }
    });
  }


  constructor(public router: Router, public firestore: Firestore, public storage: Storage) {
    this.user = {} as User
    this.categories = [
      new Category("All categories", []),
      new Category( "Clothes", [
          new Category("Man's clothes", [
              new Category("Shoes", []), new Category("T-Shirt", [])
            ] ),
          new Category("Woman's clothes", [
            new Category("Shoes", []), new Category("Dress", [])
          ] ),
        ]),
      new Category( "Food", [
        new Category("Vegetables", [] ),
        new Category("Fruits", [] ),
      ]),
    ];
    this.selectedCategory = "All categories";
    this.selectedCategoryPath = "All categories";
    this.accountImageTemp = this.user.avatar;
  }

  openCertificateModal(e : any) {
    e.composedPath()[1].children[3].classList.toggle("certificate-modal-background-active");
    document.body.classList.add('lock');
    if(this.user.certificateDate == null){
      const date = new Date().valueOf();
      const userToUpdate= doc(this.firestore, 'users', `${this.user.uniqID}`)
      updateDoc(userToUpdate, {"certificateDate": date, "baursaks": this.user.baursaks - 7})
      this.user.certificateDate = date;
    }
    this.certificateGivenDate = this.user.certificateDate
  }

  closeCertificateModal(e : any){
    e.composedPath()[0].classList.remove("certificate-modal-background-active");
    document.body.classList.remove('lock');
  }

  printCertificate(e : any){
    const element = <HTMLElement> document.getElementById("certificate");
    const options = {
      margin:       0.5,
      filename:     'BeJomartCertificate.pdf',
      image:        { type: 'png', quality: 1 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format : "letter", orientation: 'landscape' }
    };
    html2pdf().set(options).from(element).save();
  }

  openEditProfile(e : any) {
    e.composedPath()[1].children[1].classList.toggle("edit-profile-modal-active");
    document.body.classList.add('lock');
    e.composedPath()[1].children[1].querySelector('.user_name').value = this.user.fName
    e.composedPath()[1].children[1].querySelector('.user_surname').value = this.user.lName
    e.composedPath()[1].children[1].querySelector('.user_location').value = this.user.city
  }
  closeEditProfile(e : any){
    if(e.composedPath()[0].classList[0] == "edit-profile-modal" || e.composedPath()[0].classList[0] == "close-button" ||  e.composedPath()[0].classList[0] == "edit-profile-submit" ) {
      document.getElementsByClassName("edit-profile-modal-active")[0].classList.remove("edit-profile-modal-active");
      document.body.classList.remove('lock');
    }
  }

  openEditProfileImage(e : any) {
    e.composedPath()[2].children[0].children[1].classList.toggle("account-header-edit-image-active");
    document.body.classList.add('lock');
  }
  closeEditProfileImage(e : any) {
    e.composedPath()[0].classList.remove("account-header-edit-image-active");
    document.body.classList.remove('lock');
  }

  handleLogout(e : any) {
    e.composedPath()[2].children[1].classList.toggle("logout-modal-active");
    document.body.classList.add('lock');
  }
  cancelLogout(e : any) {
    e.composedPath()[3].classList.toggle("logout-modal-active");
    document.body.classList.remove('lock');
  }
  logout(e : any) {
    const auth = getAuth();
    signOut(auth).then(() => {
      // Sign-out successful.
    }).catch((error) => {
      // An error happened.
    });
    window.location.reload()
  }

  handleAddPost(){
    this.isActive = !this.isActive
    document.body.classList.add("lock")
  }

  selectCategory(e : any, category : Category){
    this.selectedCategory = category.name
    this.selectedCategoryPath = ""
    if(e.composedPath()[4].classList[0] === "category" )
      this.selectedCategoryPath += "/" + e.composedPath()[4].innerText.split("\n")[0]

    if(e.composedPath()[2].classList[0] === "category" || e.composedPath()[2].classList[0] === "subcategory" )
      this.selectedCategoryPath += "/" +  e.composedPath()[2].innerText.split("\n")[0]

    this.selectedCategoryPath += "/" + category.name;
    alert(`Chosen category path is ${this.selectedCategoryPath}`)
    e.stopPropagation();
  }

  openCodeModal(e : any) {
    e.composedPath()[2].children[3].classList.add("modal-active")
    document.body.classList.add("lock")
  }
  closeCodeModal(e : any) {
    e.composedPath()[0].classList.remove("modal-active")
    document.body.classList.remove("lock")
  }

  uploadNewAccountImage1($event : any){
    let reader = new FileReader();
    reader.readAsDataURL($event?.target.files[0]);

    reader.onload = (event: any) => { // @ts-ignore
      document.querySelector('.account-edit-image-input-label img').src = event.target.result
      this.accountImageTemp = event.target.result
    }

  }

  submitNewAccountImage(e : any){
    console.log(this.accountImageTemp)
    if(this.accountImageTemp == this.user.avatar || !this.accountImageTemp){
      location.reload()
    } else {
      this.imageIsLoading = true
      const dbInstance = collection(this.firestore, 'users');
      const userQuery = query(dbInstance, where("userID", "==", `${this.user.userID}`))
      onSnapshot(userQuery, (data) => {
        let key = (data.docs.map((item) => {
          return item.id
        })[0])
        const dataToUpdate = doc(this.firestore, "users", key);
        updateDoc(dataToUpdate, {
          avatar: this.accountImageTemp
        }).then(() => {
          this.imageIsLoading = false
          location.reload()
        }).catch((err) => {
          alert(err.message)
          location.reload()
        })
      })
    }
  }

  handleActivatePost(e: any, post : any){
    const dataToUpdate= doc(this.firestore, 'posts', `${post.id}`)
    updateDoc(dataToUpdate, {visibility: "active"}).then( () => {
      post.visibility = "active"
    })
    e.composedPath()[0].style.display = "none"
  }

  handleDeactivatePost(post: any){
    const dataToUpdate= doc(this.firestore, 'posts', `${post.id}`)
    updateDoc(dataToUpdate, {visibility: "inactive"}).then( () => {
      post.visibility = "inactive"
    })
  }

  closeEditPostModal(e : any){
    e.composedPath()[0].classList.remove("certificate-modal-background-active")
  }

  openApplyForStatus(e : any) {
    e.composedPath()[1].children[4].classList.toggle("modal-active")
  }

  closeApplyForStatus(e : any) {
    e.composedPath()[0].classList.remove("modal-active")
  }

  showOnly(e: any) {
    this.myPost = this.initialPost;
    if(e.composedPath()[0].value !== "all") { // @ts-ignore
        if(e.composedPath()[0].value == "B&D") {
          this.myPost = this.buyDonate
        } else if(e.composedPath()[0].value == "sold") {
          this.myPost = this.myPost.filter(x => x.visibility == 'B&D')
        } else {
          this.myPost = this.myPost.filter(x => x.visibility == e.composedPath()[0].value)
        }
    }
  }

  uploadDoc($event : any) {
    this.SocialImages = [];
    for(let i = 0; i < $event.target.files.length; i++) {
      this.SocialImages.push($event.target.files[i]);
    } (this.SocialImages.length > 0) ? $event.composedPath()[1].children[3].style.borderColor = "#f1c16f" : $event.composedPath()[1].children[3].style.borderColor =  "#a14444";
  }

  uploadImages(id: string) {
    let totalProg = 0
    const len = Number(this.SocialImages.length)

    for(let i=0; i<this.SocialImages.length; i++) {
      const storageRef = ref(this.storage, `images/${this.SocialImages[i].name}`)
      const uploadTask = uploadBytesResumable(storageRef, this.SocialImages[i])

      uploadTask.on('state_changed',
        (snapshot) => { const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100 },
        (error) => { console.log(error.message) },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            const dataToUpdate = doc(this.firestore, "requestToStatus", id);
            updateDoc(dataToUpdate, {
              SocialDocs: arrayUnion(downloadURL)
            }).then(() => {}).catch((err) => { alert(err.message) })

            totalProg += (100 / len)
            if(totalProg > 99) {
              this.isLoading = false;
              location.reload()
            }
          });
        }
      )
    }
  }

  applyToStatus(value: any) {
    value.userID = this.user.userID;
    value.time = new Date();
    value.fname = this.user.fName;
    value.lname = this.user.lName;

    const dbInstance = collection(this.firestore, 'requestToStatus')
    this.isLoading = true;
    
    addDoc(dbInstance, value).then((res) => { this.uploadImages(res.id) }).catch((err) => { alert(err.message) })
  }

  editProfile(value: any) { // @ts-ignore
    if(value.fName == "") value.fName = this.user.fName;
    if(value.lName == "") value.lName = this.user.lName;
    if(value.city == "") value.city = this.user.city;

    const colUsers = collection(this.firestore, "users");
    const dataToUpdate= doc(this.firestore, 'users', `${this.user.uniqID}`);

    updateDoc(dataToUpdate, { fName: value.fName, lName: value.lName, city: value.city})
    .then(() => {
      this.user.setFName(value.fName);
      this.user.setLName(value.lName);
      this.user.setLocation(value.city);
    }).catch((err) => { alert(err.message) }).finally(() =>{ location.reload() })
  }


  search(e: any){
    this.myPost = this.initialPost;
    if(e.composedPath()[0].value && e.composedPath()[0].value.trim()){
      const res = this.myPost.filter((x: { title: string; }) => {
        let selected = e.composedPath()[0].value.toLowerCase().trim();
        let target = x.title.toLowerCase().trim()
        const reg = new RegExp(`${selected}`)
        return target.match(reg)
      });
      this.myPost = res
    } else{
      this.myPost = this.initialPost
    }
  }

}
