import { Injectable } from '@angular/core';
import {map, Observable} from "rxjs";

import {
  addDoc,
  collection,
  collectionData,
  doc,
  Firestore,
  orderBy,
  query,
  updateDoc,
  where
} from "@angular/fire/firestore";
import { User } from "../models/user";
import {Chat, Message} from "../models/chat";

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  public urlPath = false

  constructor(private firestore: Firestore) {
    if(location.pathname.includes("chat")) {
      this.urlPath = true
    }
  }

  createChat(currentUser: User, otherUser: User) {
    const ref = collection(this.firestore, "chats")
    addDoc(ref, {
      userIds: [currentUser.uniqID, otherUser.uniqID],
      users: [
        {
          displayName: `${currentUser.fName} ${currentUser.lName}`,
          avatar: currentUser.avatar,
          baursaks: currentUser.baursaks
        },
        {
          displayName: `${otherUser.fName} ${otherUser.lName}`,
          avatar: otherUser.avatar,
          baursaks: otherUser.baursaks
        }
      ]
    }).then()
  }

  myChats(currentUser: User): Observable<Chat[]> {
    const ref = collection(this.firestore, "chats")
    const myQuery = query(ref, where("userIds", "array-contains", currentUser.uniqID))
    return collectionData(myQuery, { idField: 'id' }).pipe(
        map(chats => this.addChatNameAndPic(currentUser.uniqID, chats as Chat[]))
    ) as Observable<Chat[]>
  }

  addChatNameAndPic(currentUserId: string, chats: Chat[]): Chat[] {
    chats.forEach(chat => {
      const otherIndex = chat.userIds.indexOf(currentUserId) === 0 ? 1 : 0 // @ts-ignore
      const { displayName, avatar, baursaks } = chat.users[otherIndex]
      chat.chatName = displayName
      chat.chatPic = avatar
      chat.baursaksCount = baursaks
    })
    return chats
  }

  addChatMessage(chatId: string, message: string, currentUser: User) {
    const ref = collection(this.firestore, "chats", chatId, "messages")
    const chatRef = doc(this.firestore, "chats", chatId)
    const todayDate = new Date()

    addDoc(ref, {
      text: message,
      senderId: currentUser.uniqID,
      sentDate: todayDate
    }).then()
    updateDoc(chatRef, { lastMessage: message, lastMessageDate: todayDate, lastMessageSenderId: currentUser.uniqID}).then()
  }

  getChatMessages$(chatId: string): Observable<Message[]> {
    const ref = collection(this.firestore, "chats", chatId, "messages")
    const queryAll = query(ref, orderBy("sentDate", "asc"))
    return collectionData(queryAll) as Observable<Message[]>
  }

}
