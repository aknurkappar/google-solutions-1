import {Component, Input, OnInit} from '@angular/core';
import {doc, Firestore, increment, updateDoc} from "@angular/fire/firestore";

@Component({
  selector: 'app-pay-button',
  templateUrl: './pay-button.component.html',
  styleUrls: ['./pay-button.component.css']
})
export class PayButtonComponent implements OnInit{
  @Input() credit: any

  constructor(public firestore: Firestore) {}

  ngOnInit() {
    this.paymentRequest.transactionInfo.totalPrice = this.credit.price
  }

  paymentRequest: google.payments.api.PaymentDataRequest = {
    apiVersion: 2,
    apiVersionMinor: 0,
    allowedPaymentMethods: [
      {
        type: "CARD",
        parameters: {
          allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
          allowedCardNetworks: ['VISA', 'MASTERCARD']
        },
        tokenizationSpecification: {
          type: 'PAYMENT_GATEWAY',
          parameters: {
            gateway: 'example',
            gatewayMerchantId: 'exampleGatewayMerchantId'
          }
        }
      }
    ],
    merchantInfo: {
      merchantId: '12345678901234567890',
      merchantName: 'Demo Merchant'
    },
    transactionInfo: {
      totalPriceStatus: 'FINAL',
      totalPriceLabel: 'Total',
      totalPrice: "0.01",
      currencyCode: 'KZT'
    },
    callbackIntents: ['PAYMENT_AUTHORIZATION']
  }

  onLoadPaymentData = (
      event: Event
  ): void => {
    const eventDetail = event as CustomEvent<google.payments.api.PaymentData>;
    console.log('load payment data', eventDetail.detail)
  }

  onPaymentDataAuthorized: google.payments.api.PaymentAuthorizedHandler = (
      paymentData
  ) => {
    if(this.credit.type == "B&D") {
      const dataToUpdate = doc(this.firestore, "donations", this.credit.donationID);
      updateDoc(dataToUpdate, {
        donatedFunds: increment(this.credit.price)
      }).then(() => {
      }).catch((err) => {})
      const dataToUpdate2 = doc(this.firestore, "B&D", this.credit.postID);
      updateDoc(dataToUpdate2, {
        visibility: "B&D",
        takerID: this.credit.takerID
      }).then(() => {
      }).catch((err) => {})
    }
    else {
      const dataToUpdate = doc(this.firestore, "donations", this.credit.donationID);
      updateDoc(dataToUpdate, {
        donatedFunds: increment(this.credit.price)
      }).then(() => {
      }).catch((err) => {})
      const dataToUpdate2 = doc(this.firestore, "users", this.credit.takerID);
      updateDoc(dataToUpdate2, {
        donatedValue: increment(this.credit.price)
      }).then(() => {
        location.reload()
      }).catch((err) => {})
    }

    return {
      transactionState: "SUCCESS"
    }

  }

  onError = (event: ErrorEvent): void => {
    console.log('error', event.error)
  }

}