import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface ChatMessage {
  id?: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read?: boolean;
}

export interface User {
  id: string;
  name: string;
  role: string;
  email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private apiUrl = environment.chatUrl;

  constructor(private http: HttpClient) { }

  // Get all users for chat selection
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/users/all`);
  }

  // Get chat messages between two users
  getChatMessages(receiverId: string, senderId: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/messages/conversations/${receiverId}/${senderId}`);
  }

  // Send a chat message
  sendMessage(message: ChatMessage): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(`${this.apiUrl}/messages/send`, message);
  }

  // Mark messages as read
  markMessagesAsRead(senderId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/messages/read/${senderId}`, {});
  }
}
