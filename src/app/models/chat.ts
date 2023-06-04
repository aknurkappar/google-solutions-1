import { User } from "./user";

export interface Chat {
    find(arg0: (c: any) => boolean): any;

    id: string
    userIds: string[]
    users: User[]

    lastMessage?: string
    lastMessageDate?: any
    lastMessageSenderId?: string

    chatPic?: string
    chatName?: string
    baursaksCount?: number
}

export interface Message {
    text: string
    senderId: string
    sentDate: any
}