import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ModalConditionService {

  signInCondition: boolean = false
  signUpCondition: boolean = false

  constructor() { }


  // setSignUpCondition(condition: boolean) {
  //   this.signUpCondition = condition
  // }

}
