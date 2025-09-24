import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, BehaviorSubject } from 'rxjs';

export interface ChatMessage {
  _id?: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
  room: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket: Socket;
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  private typingSubject = new BehaviorSubject<string>('');

  public messages$ = this.messagesSubject.asObservable();
  public typing$ = this.typingSubject.asObservable();

  constructor() {
    this.socket = io('http://localhost:3000', {
      transports: ['polling'],
      timeout: 20000
    });
    this.setupSocketListeners();
    console.log('Chat service initialized');
  }

  private setupSocketListeners() {
    this.socket.on('connect', () => {
      console.log('Connected to server:', this.socket.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('joined-room', (room: string) => {
      console.log('Joined room:', room);
    });

    this.socket.on('new-message', (message: ChatMessage) => {
      console.log('Received new message:', message);
      const currentMessages = this.messagesSubject.value;
      this.messagesSubject.next([...currentMessages, message]);
    });

    this.socket.on('user-typing', (data: { username: string; isTyping: boolean }) => {
      if (data.isTyping) {
        this.typingSubject.next(`${data.username} is typing...`);
      } else {
        this.typingSubject.next('');
      }
    });

    this.socket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });
  }

  joinRoom(room: string) {
    this.socket.emit('join-room', room);
  }

  sendMessage(message: ChatMessage) {
    console.log('Sending message:', message);
    this.socket.emit('send-message', message);
  }

  sendTyping(username: string, room: string, isTyping: boolean) {
    this.socket.emit('typing', { username, room, isTyping });
  }

  setMessages(messages: ChatMessage[]) {
    this.messagesSubject.next(messages);
  }

  disconnect() {
    this.socket.disconnect();
  }
}