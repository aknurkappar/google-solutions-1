import {Data} from "@angular/router";

export class User {
  userID: string
  email: string
  fName: string
  lName: string
  number: string
  password: string
  city: string
  baursaks: number
  specialStatus: boolean = false
  avatar: string;
  uniqID: string;
  certificateDate: number;

  constructor(data: any) {
    this.userID = data.userID;
    this.email = data.email;
    this.fName = data.fName;
    this.lName = data.lName;
    this.number = data.number;
    this.password = data.password;
    this.city = data.city;
    this.baursaks = data.baursaks;
    this.specialStatus = data.specialStatus;
    this.avatar = data.avatar;
    this.uniqID = data.uniqID;
    this.certificateDate = data.certificateDate;
  }

  setFName(fName: string){
    this.fName = fName;
  }

  setLName(lName: string){
    this.lName = lName;
  }

  setLocation(city: string){
    this.city = city
  }

}
