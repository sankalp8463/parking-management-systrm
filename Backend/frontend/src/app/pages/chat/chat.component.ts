import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMessage } from '../../services/chat.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  messages: ChatMessage[] = [];
  newMessage = '';
  currentUser: any = {};
  currentRoom = 'general';
  typingText = '';
  isTyping = false;
  typingTimeout: any;

  constructor(
    private chatService: ChatService,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('Current user:', this.currentUser);
    
    if (!this.currentUser._id) {
      console.log('No user logged in');
      return;
    }

    this.loadChatHistory();
    this.chatService.joinRoom(this.currentRoom);

    // Subscribe to new messages
    this.chatService.messages$.subscribe(messages => {
      console.log('Messages updated:', messages);
      this.messages = messages;
      setTimeout(() => this.scrollToBottom(), 100);
    });

    // Subscribe to typing indicator
    this.chatService.typing$.subscribe(text => {
      this.typingText = text;
    });
  }

  ngOnDestroy() {
    this.chatService.disconnect();
  }

  loadChatHistory() {
    console.log('Loading chat history for room:', this.currentRoom);
    this.apiService.get(`/chat/history?room=${this.currentRoom}&limit=50`).subscribe({
      next: (messages) => {
        console.log('Chat history loaded:', messages);
        this.chatService.setMessages(messages);
      },
      error: (error) => {
        console.error('Error loading chat history:', error);
        // Initialize with empty messages if history fails
        this.chatService.setMessages([]);
      }
    });
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.currentUser._id) {
      console.log('Cannot send message - empty or no user');
      return;
    }

    const message: ChatMessage = {
      userId: this.currentUser._id,
      username: this.currentUser.name || 'Anonymous',
      message: this.newMessage.trim(),
      timestamp: new Date(),
      room: this.currentRoom
    };

    console.log('Sending message:', message);
    this.chatService.sendMessage(message);
    this.newMessage = '';
    this.stopTyping();
  }

  onTyping() {
    if (!this.isTyping) {
      this.isTyping = true;
      this.chatService.sendTyping(this.currentUser.name, this.currentRoom, true);
    }

    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      this.stopTyping();
    }, 1000);
  }

  stopTyping() {
    if (this.isTyping) {
      this.isTyping = false;
      this.chatService.sendTyping(this.currentUser.name, this.currentRoom, false);
    }
    clearTimeout(this.typingTimeout);
  }

  scrollToBottom() {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  formatTime(timestamp: Date): string {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isMyMessage(message: ChatMessage): boolean {
    return message.userId === this.currentUser._id;
  }
}