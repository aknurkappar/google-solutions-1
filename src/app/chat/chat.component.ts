import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {getAuth} from "firebase/auth";
import {onAuthStateChanged} from "@angular/fire/auth";
import {collection, doc, Firestore, onSnapshot, query, where} from "@angular/fire/firestore";
import {User} from "../models/user";
import {Chat, Message} from "../models/chat";
import {ChatService} from "../services/chat.service";
import {tap} from "rxjs";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  user: User

  userChats: Chat[] = []
  activeChat: Chat

  message = ""
  messages$: any

  loaded = false

  // @ts-ignore
  @ViewChild("endOfChat") endOfChat: ElementRef

  constructor(private firestore: Firestore, private chatService: ChatService) {
    this.user = {} as User
    this.activeChat = {} as Chat
  }

  ngOnInit() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if(user) {
        const uid = user.uid;
        const dbInstance = collection(this.firestore, 'users');
        const userQuery = query(dbInstance, where("userID", "==", `${uid}`));

        onSnapshot(userQuery, (data) => {
          this.user = new User(data.docs.map((item) => {
            return {...item.data(), uniqID: item.id}
          })[0]);
          this.chatService.myChats(this.user).subscribe((chats) => {
            this.userChats = chats.sort((a, b) => b.lastMessageDate - a.lastMessageDate)
            this.loaded = true
          })

          const colUsers = collection(this.firestore, "users");
          const docRef = doc(colUsers, `${this.user.uniqID}`);
          onSnapshot(docRef, (doc) => { // @ts-ignore
            if(doc.data()["specialStatus"] === true) this.specialStatus = true
          });
        })
      }
    });
  }

  chooseChat(chat: Chat) {
    this.activeChat = chat
    this.getMessages(chat.id)
  }

  getMessages(id: string) {
    this.messages$ = this.chatService.getChatMessages$(id)
    setTimeout(() => {
      this.scrollToBottom()
    }, 500)
  }

  sendMessage() {
    const selectedChatId = this.activeChat.id

    if(this.message != "" && selectedChatId) {
      this.chatService.addChatMessage(selectedChatId, this.message, this.user)
      this.message = ""
      setTimeout(() => {
        this.scrollToBottom()
      }, 100)
    }
  }

  scrollToBottom() {
    this.endOfChat.nativeElement.scrollIntoView()
  }

}
