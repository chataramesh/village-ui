import { Component, EventEmitter, Input, OnInit, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMessage, UserWithMessageCount } from '../../../core/services/chat.service';
import { UsersService, User, Role } from '../../../users/users.service';
import { WebsocketService } from '../../../core/services/websocket.service';
import { TokenService } from '../../../core/services/token.service';
import { EntitySubscriptionService } from '../../../entities/services/entity-subscription.service';

interface ChatUser extends User {
  unreadCount: number;
  lastMessage?: ChatMessage;
  isActive: boolean;
  profileImage?: string;
}

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.scss']
})
export class ChatWidgetComponent implements OnInit, OnDestroy {
  @Input() currentUserId: string = '';
  @Input() currentUserRole: string = '';
  @Input() currentUserName: string = '';
  @Output() chatToggled = new EventEmitter<boolean>();

  // Chat state
  showChat = false;
  selectedUser: ChatUser | null = null;
  chatUsers: ChatUser[] = [];
  chatMessages: any[] = [];
  newMessage = '';
  isLoadingUsers = false;
  isConnected = false;
  showAddUserConfirm = false;
  selectedUserForAdd: ChatUser | null = null;

  // WebSocket tracking
  private lastSentMessage = '';
  private lastSentTime = 0;

  constructor(
    private chatService: ChatService,
    private userService: UsersService,
    private websocketService: WebsocketService,
    private tokenService: TokenService,
    private entitySubscriptionService: EntitySubscriptionService
  ) {}

  ngOnInit() {
    this.setupWebSocket();
    this.loadChatUsers();
    this.setupChatSubscriptions();
  }

  ngOnDestroy() {
    if (this.showChat) {
      this.closeChat();
    }
  }

  setupWebSocket() {
    // Subscribe to WebSocket messages
    this.websocketService.messages$.subscribe(message => {
      if (message && this.currentUserId) {
        this.handleIncomingMessage(message);
      }
    });

    // Subscribe to connection status
    this.websocketService.connectionStatus$.subscribe(connected => {
      this.isConnected = connected;
      if (connected && this.currentUserId) {
        console.log('WebSocket connected for chat');
      }
    });
  }

  setupChatSubscriptions() {
    // Subscribe to unread counts
    this.chatService.totalUnread$.subscribe(count => {
      // Update chat users with unread counts
      this.updateUsersWithCounts();
    });

    // Subscribe to users with counts
    this.chatService.usersWithCounts$.subscribe(usersWithCounts => {
      this.chatUsers = usersWithCounts.map(user => ({
        ...user,
        isActive: false
      }));
    });
  }

  updateUsersWithCounts() {
    // this.chatService.getAllUsersWithCounts().subscribe(usersWithCounts => {
    //   this.chatService.updateUsersWithCountsFromBackend(
    //     usersWithCounts.filter(u => u.id !== this.currentUserId),
    //     this.currentUserId
    //   );
    // });
  }

  loadChatUsers() {
    if (!this.currentUserId) return;

    this.isLoadingUsers = true;
    const role = (this.currentUserRole || '').toUpperCase();

    if (role === Role.SUPER_ADMIN) {
      this.userService.getAllUsers().subscribe({
        next: (users) => {
          const filteredUsers = users.filter(u => u.id !== this.currentUserId);
          this.chatService.updateUsersWithCountsFromBackend(filteredUsers, this.currentUserId);
          this.isLoadingUsers = false;
        },
        error: () => { this.isLoadingUsers = false; }
      });
      return;
    }

    if (role === Role.VILLAGE_ADMIN) {
      const villageId = this.tokenService.getUserVillageId();
      if (!villageId) { this.isLoadingUsers = false; return; }
      this.userService.getUsersByVillage(villageId, Role.VILLAGER).subscribe({
        next: (users) => {
          const filteredUsers = (users || []).filter(u => u.id !== this.currentUserId);
          this.chatService.updateUsersWithCountsFromBackend(filteredUsers, this.currentUserId);
          this.isLoadingUsers = false;
        },
        error: () => { this.isLoadingUsers = false; }
      });
      return;
    }

    if (role === Role.VILLAGER) {
      this.userService.getUsersByRole(Role.SUPER_ADMIN).subscribe({
        next: (users) => {
          const filteredUsers = (users || []).filter(u => u.id !== this.currentUserId);
          this.chatService.updateUsersWithCountsFromBackend(filteredUsers, this.currentUserId);
          this.isLoadingUsers = false;
        },
        error: () => { this.isLoadingUsers = false; }
      });
      return;
    }

    this.userService.getAllUsers().subscribe({
      next: (users) => {
        const filteredUsers = users.filter(u => u.id !== this.currentUserId);
        this.chatService.updateUsersWithCountsFromBackend(filteredUsers, this.currentUserId);
        this.isLoadingUsers = false;
      },
      error: () => { this.isLoadingUsers = false; }
    });
  }

  handleIncomingMessage(message: ChatMessage) {
    const now = Date.now();

    // Filter out echo messages
    if (message.content === this.lastSentMessage &&
        message.senderId === this.currentUserId &&
        (now - this.lastSentTime) < 5000) {
      console.log('Filtering out echo message');
      return;
    }

    // Add message to UI if it's for current conversation
    if (this.selectedUser && this.shouldDisplayMessage(message)) {
      const uiMessage = {
        sender: message.senderId === this.currentUserId ? 'me' : 'other',
        content: message.content,
        timestamp: new Date(message.timestamp || new Date())
      };
      this.chatMessages.push(uiMessage);
    }

    // Update unread counts for background messages
    if (message.receiverId === this.currentUserId && message.senderId !== this.currentUserId) {
      this.chatService.incrementUnreadCount(message.senderId);
      this.updateUsersWithCounts();
    }

    this.lastSentMessage = '';
    this.lastSentTime = 0;
  }

  shouldDisplayMessage(message: ChatMessage): boolean {
    if (!this.selectedUser) return false;

    return (message.senderId === this.currentUserId && message.receiverId === this.selectedUser.id) ||
           (message.receiverId === this.currentUserId && message.senderId === this.selectedUser.id);
  }

  toggleChat() {
    this.showChat = !this.showChat;

    if (this.showChat) {
      this.loadChatUsers();
      this.connectWebSocket();
      // Reset unread counts when opening chat
      this.chatService.resetAllUnreadCounts();
    } else {
      this.closeChat();
    }

    this.chatToggled.emit(this.showChat);
  }

  closeChat() {
    this.showChat = false;
    this.selectedUser = null;
    this.chatMessages = [];
    this.chatToggled.emit(false);
  }

  connectWebSocket() {
    if (!this.isConnected && this.currentUserId) {
      console.log('Connecting to WebSocket for chat');
      this.websocketService.connect(this.currentUserId);
    }
  }

  selectUser(user: ChatUser) {
    if (this.selectedUser?.id === user.id) return;

    this.selectedUser = user;
    this.selectedUser.isActive = true;
    if (this.currentUserId) {
      this.loadChatMessages();
      this.chatService.markUserMessagesAsRead(user.id!);
    }
  }

  onUserSelectChange(userId: string) {
    const user = this.chatUsers.find(u => u.id === userId);
    if (user && user.id !== this.selectedUser?.id) {
      this.selectedUserForAdd = user;
      this.showAddUserConfirm = true;
    }
  }

  confirmAddUser() {
    if (this.selectedUserForAdd) {
      this.selectUser(this.selectedUserForAdd as ChatUser);
      this.showAddUserConfirm = false;
      this.selectedUserForAdd = null;
    }
  }

  cancelAddUser() {
    this.showAddUserConfirm = false;
    this.selectedUserForAdd = null;
  }

  loadChatMessages() {
    if (!this.selectedUser?.id || !this.currentUserId) return;

    this.chatService.getChatMessages(this.selectedUser.id, this.currentUserId).subscribe({
      next: (messages) => {
        this.chatMessages = messages.map((msg: ChatMessage) => ({
          sender: msg.senderId === this.currentUserId ? 'me' : 'other',
          content: msg.content,
          timestamp: new Date(msg.timestamp)
        }));
      },
      error: (error) => {
        console.error('Error loading chat messages:', error);
        this.chatMessages = [];
      }
    });
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedUser?.id || !this.currentUserId) return;

    const messageContent = this.newMessage.trim();

    // Add message to UI immediately
    const sentMessage = {
      sender: 'me',
      content: messageContent,
      timestamp: new Date()
    };
    this.chatMessages.push(sentMessage);

    // Track for echo filtering
    this.lastSentMessage = messageContent;
    this.lastSentTime = Date.now();

    // Send via WebSocket
    const message: ChatMessage = {
      senderId: this.currentUserId,
      receiverId: this.selectedUser.id,
      content: messageContent,
      timestamp: new Date().toISOString()
    };

    this.websocketService.sendMessage({
      ...message,
      token: this.tokenService.getToken()
    });

    this.newMessage = '';
  }

  // Search functionality
  searchQuery = '';

  get filteredChatUsers() {
    if (!this.searchQuery.trim()) {
      return this.chatUsers;
    }
    return this.chatUsers.filter(user =>
      user.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  getTotalUnreadCount(): number {
    return this.chatUsers.reduce((total, user) => total + (user.unreadCount || 0), 0);
  }

  getUnreadCountForUser(userId: string): number {
    return this.chatService.getUnreadCount(userId);
  }
}
