import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { io, Socket } from 'socket.io-client';

@Component({
  selector: 'app-simple-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="padding: 20px; max-width: 600px; margin: 0 auto;">
      <h2>Simple Chat Test</h2>
      
      <div style="border: 1px solid #ccc; height: 300px; overflow-y: auto; padding: 10px; margin: 10px 0;">
        <div *ngFor="let msg of messages" style="margin: 5px 0;">
          <strong>{{msg.username}}:</strong> {{msg.message}}
          <small style="color: #666;">({{msg.timestamp | date:'short'}})</small>
        </div>
      </div>
      
      <div style="display: flex; gap: 10px;">
        <input 
          [(ngModel)]="newMessage" 
          (keyup.enter)="sendMessage()"
          placeholder="Type message..."
          style="flex: 1; padding: 8px;">
        <button (click)="sendMessage()" style="padding: 8px 16px;">Send</button>
      </div>
      
      <div style="margin-top: 10px; font-size: 12px; color: #666;">
        Status: {{connectionStatus}}
      </div>
    </div>
  `
})
export class SimpleChatComponent implements OnInit {
  private socket!: Socket;
  messages: any[] = [];
  newMessage = '';
  connectionStatus = 'Disconnected';
  currentUser = { _id: 'test-user', name: 'Test User' };

  ngOnInit() {
    this.socket = io('http://localhost:3000');
    
    this.socket.on('connect', () => {
      this.connectionStatus = 'Connected';
      console.log('Connected to server');
      this.socket.emit('join-room', 'general');
    });

    this.socket.on('disconnect', () => {
      this.connectionStatus = 'Disconnected';
      console.log('Disconnected from server');
    });

    this.socket.on('new-message', (message: any) => {
      console.log('Received message:', message);
      this.messages.push(message);
    });
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    const message = {
      userId: this.currentUser._id,
      username: this.currentUser.name,
      message: this.newMessage.trim(),
      room: 'general',
      timestamp: new Date()
    };

    console.log('Sending message:', message);
    this.socket.emit('send-message', message);
    this.newMessage = '';
  }

  ngOnDestroy() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}