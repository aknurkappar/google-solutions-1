import { Component, OnInit } from '@angular/core';
import {addDoc, arrayUnion, collection, deleteDoc, doc, Firestore, getDocs, updateDoc} from '@angular/fire/firestore';
import { getDownloadURL, ref, uploadBytesResumable, Storage } from '@angular/fire/storage';
import {User} from "../user";

@Component({
  selector: 'app-donations',
  templateUrl: './donations.component.html',
  styleUrls: ['./donations.component.css']
})
export class DonationsComponent implements OnInit {

  public donations: any = [];
  public initialDonations: any = []

  public files: any = [];
  public image: any = {};

  public user: User;

  public imageUploaded: boolean = false;
  public filesUploaded: boolean = false;

  public loaded: boolean;

  ngOnInit(){
    const value = localStorage.getItem("userData");
    if(value !== null){
      // @ts-ignore
      this.user = new User(JSON.parse(value)[0]);
      console.log(this.user)
    }
    this.getData()
  }

  constructor(public firestore: Firestore, public storage: Storage) {
    this.loaded = false;
    this.user = {} as User;
  }

  uploadImg($event: any) {
    this.image = $event.target.files[0];
    $event.composedPath()[1].childNodes[1].childNodes[0].innerHTML = $event.target.files[0].name;
    this.imageUploaded = true;
  }

  uploadDoc($event : any) {
    this.files = [];
    $event.composedPath()[1].childNodes[1].childNodes[0].innerHTML = '';
    for(let i = 0; i < $event.target.files.length; i++) {
      this.files.push($event.target.files[i]);
      $event.composedPath()[1].childNodes[1].childNodes[0].innerHTML += $event.target.files[i].name + ', ';
    }
    this.filesUploaded = true;
  }

  applyApp(e: any) {
    if(e.composedPath()[0].className == 'add_donation') {
      window.scrollTo({top: 0});  e.composedPath()[1].classList.add('open'); document.body.classList.add('lock');
    }
    if(e.composedPath()[1].className == 'close_apply') {
      e.composedPath()[5].classList.remove('open'); document.body.classList.remove('lock');
    }
    if(e.composedPath()[0].className == 'apply_back') {
      e.composedPath()[1].classList.remove('open'); document.body.classList.remove('lock');
    }
  }

  addDays(date: Date, days: number) {
    let result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  addData(value: any, e: any) {
    const dbInstance = collection(this.firestore, 'donations');
    const appForm = e.composedPath()[0];
    appForm.querySelectorAll('.input_requisites');

    value.visible = false;
    value.files = [];
    value.ownerId = this.user.userID;
    value.ownerName = this.user.fName + ' ' + this.user.lName;
    value.city = this.user.city;
    value.time = new Date()
    value.expiredDate = this.addDays(value.time, 30)

    value.requisites = []; let temp = 0;
    for(let i = 0; i < 4; i++) {
      value.requisites.push(Number(appForm.querySelector('.input_requisites').value.substring(0 + temp, 4 + temp)));
      temp += 5;
    }

    if(value.title == "" || value.reason == "" || !this.imageUploaded || !this.filesUploaded || appForm.querySelector('.input_requisites').value.length < 19 || value.name == "" || value.surname == "" || value.phone == "") {
      console.log(appForm.querySelector('.input_requisites').value.length)
      appForm.classList.add('occured');
      for(let i = 0; i < appForm.querySelectorAll('input').length; i++) {
        if(appForm.querySelectorAll('input')[i].value == "") {
          appForm.querySelectorAll('input')[i].style.borderColor = '#e81f1f';
        }
      }
      if(appForm.querySelector('.input_requisites').value.length < 19) appForm.querySelector('.input_requisites').style.borderColor = '#e81f1f';
      if(appForm.querySelector('textarea').value == "") appForm.querySelector('textarea').style.borderColor = '#e81f1f';
      if(!this.imageUploaded) appForm.querySelector('.file label').style.borderColor = '#e81f1f';
      if(!this.filesUploaded) appForm.querySelector('.baska label').style.borderColor = '#e81f1f';
      setTimeout(() => {
        for(let i = 0; i < appForm.querySelectorAll('input').length; i++) {
          appForm.querySelectorAll('input')[i].style.borderColor = '#E2E2E2';
        }
        appForm.querySelector('textarea').style.borderColor = '#E2E2E2';
        appForm.querySelector('.file label').style.borderColor = '#E2E2E2';
        appForm.querySelector('.baska label').style.borderColor = '#E2E2E2';
        appForm.classList.remove('occured');
      }, 3000);
      return
    }

    addDoc(dbInstance, value).then((res) => {
      this.uploadImages(res.id, appForm);
      this.getData();

    }).catch((err) => { alert(err.message) }
    ) .finally(()=> {
      this.files = []
    })
  }

  uploadImages(id: string, appForm: any) {
    let totalProg = 0
    const len = Number(this.files.length + 1)

    for(let i=0; i<this.files.length; i++){
      const storageRef = ref(this.storage, `images/${this.files[i].name}`)
      const uploadTask = uploadBytesResumable(storageRef, this.files[i])

      uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred/snapshot.totalBytes) * 100
          },
          (error) => {
            console.log(error.message)
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              const dataToUpdate = doc(this.firestore, "donations", id);
              updateDoc(dataToUpdate, {
                files: arrayUnion(downloadURL)
              }).then(() => {}).catch((err) => { alert(err.message) })

              totalProg += (100 / len)
              appForm.querySelector('.progress_bar').style.width = (totalProg + '%');
              this.filesUploaded = false;
            });
          }
      )
    }

    const storageRef = ref(this.storage, `images/${this.image.name}`)
    const uploadTask = uploadBytesResumable(storageRef, this.image)

    uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred/snapshot.totalBytes) * 100
        },
        (error) => {
          console.log(error.message)
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            const dataToUpdate = doc(this.firestore, "donations", id);
            updateDoc(dataToUpdate, {
              file: downloadURL
            }).then(() => {}).catch((err) => { alert(err.message) })

            totalProg += (100 / len);

            if(Number(totalProg) >= 100) {
              appForm.querySelector('.progress_bar').style.width = (totalProg + '%');
              this.imageUploaded = false;
              window.location.reload();
            }
            else appForm.querySelector('.progress_bar').style.width = (totalProg + '%');
          });
        }
    )
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
      this.initialDonations = this.donations
      this.loaded = true;
      // this.donations = this.donations.filter((value) => value.visible === true)
    }).catch( (err) => { alert(err.message) }
    ).finally( () => {
    })
  }

  cardTyping(e: any) {
    const input = e.composedPath()[0];
    for(var i in ['input', 'change', 'blur', 'keyup']) {
      input.addEventListener('input', () => {
        var cardCode = input.value.replace(/[^\d]/g, '').substring(0,16);
        cardCode = cardCode != '' ? cardCode.match(/.{1,4}/g).join(' ') : '';
        input.value = cardCode;
      });
    }
  }

  openHelp(e: any) {
    if(e.composedPath()[0].className == 'help') {
      window.scrollTo({top: 0}); e.composedPath()[1].classList.add('open'); document.body.classList.add('lock');
    }
    if(e.composedPath()[0].className == 'help_back') {
      console.log(e.composedPath());
      e.composedPath()[1].classList.remove('open'); document.body.classList.remove('lock');
    }
  }

  showReason(e: any) {
    e.composedPath()[1].classList.toggle('open');
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

  search(e: any){
    this.donations = this.initialDonations;
    if(e.composedPath()[0].value && e.composedPath()[0].value.trim()){
      const res = this.donations.filter((x: { title: string; }) => {
        let selected = e.composedPath()[0].value.toLowerCase().trim();
        let target = x.title.toLowerCase().trim()
        const reg = new RegExp(`${selected}`)
        return target.match(reg)
      });
      this.donations = res
    } else{
      this.donations = this.initialDonations
    }
  }

}
