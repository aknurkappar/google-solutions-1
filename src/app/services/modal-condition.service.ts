import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ModalConditionService {

  signInCondition: boolean = false
  signUpCondition: boolean = false

  postBooked = localStorage.getItem("postBooked")
  bookedItemId = localStorage.getItem("bookedItemId")
  bookedUserId = localStorage.getItem("bookedUserId")

  constructor() { }

}
