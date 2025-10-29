import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from 'src/app/users/users.service';

export interface ChatMessage {
  id?: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read?: boolean;
}

export interface UserWithMessageCount extends User {
  unreadCount: number;
  lastMessage?: ChatMessage;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private apiUrl = environment.apiUrl;

  // Track unread message counts per user
  private unreadCountsSubject = new BehaviorSubject<Map<string, number>>(new Map());
  public unreadCounts$ = this.unreadCountsSubject.asObservable();

  // Track all users with their message counts
  private usersWithCountsSubject = new BehaviorSubject<UserWithMessageCount[]>([]);
  public usersWithCounts$ = this.usersWithCountsSubject.asObservable();

  // Total unread messages count
  private totalUnreadSubject = new BehaviorSubject<number>(0);
  public totalUnread$ = this.totalUnreadSubject.asObservable();

  // Load unread counts from localStorage on service initialization
  constructor(private http: HttpClient) {
    this.loadUnreadCountsFromStorage();
  }

  // Load unread counts from localStorage
  private loadUnreadCountsFromStorage(): void {
    const storedCounts = localStorage.getItem('chat_unread_counts');
    if (storedCounts) {
      try {
        const counts = JSON.parse(storedCounts);
        this.unreadCountsSubject.next(new Map(Object.entries(counts)));

        // Calculate total unread count
        const totalUnread = Object.values(counts).reduce((sum: number, count: any) => sum + count, 0);
        this.totalUnreadSubject.next(totalUnread);
      } catch (error) {
        console.error('Error loading unread counts from storage:', error);
      }
    }
  }

  // Save unread counts to localStorage
  private saveUnreadCountsToStorage(): void {
    const currentCounts = this.unreadCountsSubject.value;
    const countsObj = Object.fromEntries(currentCounts);
    localStorage.setItem('chat_unread_counts', JSON.stringify(countsObj));
  }

  // // Get all users for chat selection with message counts
  // getAllUsersWithCounts(): Observable<UserWithMessageCount[]> {
  //   return this.http.get<UserWithMessageCount[]>(`${environment.apiUrl}/users/all-with-counts`);
  // }

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

  // Update unread count for a specific user
  updateUnreadCount(userId: string, count: number): void {
    const currentCounts = this.unreadCountsSubject.value;
    const newCounts = new Map(currentCounts);
    newCounts.set(userId, count);
    this.unreadCountsSubject.next(newCounts);

    // Update total unread count
    const totalUnread = Array.from(newCounts.values()).reduce((sum, count) => sum + count, 0);
    this.totalUnreadSubject.next(totalUnread);

    // Persist to localStorage
    this.saveUnreadCountsToStorage();
  }

  // Increment unread count for a user
  incrementUnreadCount(userId: string): void {
    const currentCounts = this.unreadCountsSubject.value;
    const currentCount = currentCounts.get(userId) || 0;
    this.updateUnreadCount(userId, currentCount + 1);
  }

  // Mark all messages from a user as read
  markUserMessagesAsRead(userId: string): void {
    this.updateUnreadCount(userId, 0);
  }

  // Get current unread count for a user
  getUnreadCount(userId: string): number {
    return this.unreadCountsSubject.value.get(userId) || 0;
  }

  // Get total unread count
  getTotalUnreadCount(): number {
    return this.totalUnreadSubject.value;
  }

  // Load unread counts for current user (called on app initialization)
  loadUnreadCounts(currentUserId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/messages/unread-counts/${currentUserId}`);
  }

  // Update users with their message counts from backend
  updateUsersWithCountsFromBackend(users: User[], currentUserId: string): void {
    const currentCounts = this.unreadCountsSubject.value;
    const usersWithCounts: UserWithMessageCount[] = users
      .filter(user => user.id) // Filter out users without IDs
      .map(user => ({
        ...user,
        unreadCount: currentCounts.get(user.id!) || 0
      }));
    this.usersWithCountsSubject.next(usersWithCounts);
  }

  // Reset all unread counts (when chat is opened)
  resetAllUnreadCounts(): void {
    this.unreadCountsSubject.next(new Map());
    this.totalUnreadSubject.next(0);
    // Clear from localStorage
    localStorage.removeItem('chat_unread_counts');
  }

  // Handle incoming WebSocket message
  handleIncomingMessage(message: ChatMessage, currentUserId: string): void {
    // Only count as unread if it's not from the current user and not in an active conversation
    if (message.receiverId === currentUserId && message.senderId !== currentUserId) {
      this.incrementUnreadCount(message.senderId);
    }
  }
}
