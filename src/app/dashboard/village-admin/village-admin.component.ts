import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, HostListener, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { HttpClient } from '@angular/common/http';
import { TokenService } from 'src/app/core/services/token.service';
import { UsersService, User } from 'src/app/users/users.service';
import { ChatService } from 'src/app/core/services/chat.service';
import { WebsocketService } from 'src/app/core/services/websocket.service';

Chart.register(...registerables);

@Component({
  selector: 'app-village-admin',
  templateUrl: './village-admin.component.html',
  styleUrls: ['./village-admin.component.scss']
})
export class VillageAdminComponent implements OnInit, AfterViewInit, OnDestroy {
  
  villageName: any = 'Green Valley Village';
  userName = 'Village Admin';
  userImage = 'assets/people.png'; // Default user image
  
  // User Menu
  showUserMenu = false;

  // Counts
  counts = {
    entities: 18,
    villagers: 245,
    events: 12
  };

  // Event Messages with auto-scroll
  eventMessages = [
    { time: '10:30 AM', title: 'Village Cleanup Drive', message: 'Join us this Saturday at 7 AM for village cleanup' },
    { time: '09:15 AM', title: 'Health Camp Scheduled', message: 'Free health checkup on Oct 15 at Primary School' },
    { time: '08:00 AM', title: 'Water Supply Update', message: 'Water supply timing changed to 6 AM - 9 AM' },
    { time: 'Yesterday', title: 'Farmers Meeting', message: 'Monthly farmers meeting on Oct 18 at 10 AM' },
    { time: 'Yesterday', title: 'New Entity Added', message: 'Community Hall added to village entities' }
  ];

  // Chat (temporarily disabled WebSocket functionality)
  showChatPopup = false;
  unreadMessages = 2;
  selectedChatUser: string = '';
  chatMessage: string = '';
  chatUsers: User[] = [];
  chatMessages: any[] = [];
  private currentUserId: string | null = null;
  isLoadingUsers = false;
  private chatPollingInterval: any;
  private lastSentMessage: string = '';
  private lastSentTime: number = 0;
  private lastMessageTimestamp: Date | null = null;
  private isChatActive: boolean = false;
  private lastPollTime: number = 0;
  private minPollInterval: number = 5000; // Minimum 5 seconds between polls

  // Chart References
  @ViewChild('entitiesChart') entitiesChartRef!: ElementRef;
  @ViewChild('villagersChart') villagersChartRef!: ElementRef;
  @ViewChild('eventsChart') eventsChartRef!: ElementRef;
  @ViewChild('activityChart') activityChartRef!: ElementRef;

  private charts: Chart[] = [];

  // Current user information
  currentUser: User | null = null;
  currentUserVillageId: string | null = null;
  currentUserVillageName: string | null = null;

  constructor(
    private router: Router,
    private tokenService: TokenService,
    private usersService: UsersService,
    private http: HttpClient,
    private chatService: ChatService,
    private websocketService: WebsocketService
  ) {}

  title = 'frontend';
  username: string = '';  // Stores the username entered by the user
  message: string = '';  // Stores the message being typed by the user
  messages: any[] = [];  // Stores all the chat messages
  isConnected = false;  // Tracks whether the user is connected to the WebSocket
  connectingMessage = 'Connecting...';  // Message to show while connecting

  ngOnInit(): void {
    // Load current user details and village data
    this.loadCurrentUser();
    this.startEventMessagesScroll();

    this.usersService.getUserById(this.tokenService.getCurrentUser()!.userId!).subscribe({
      next: (user) => {
        this.villageName = user!.village!.name;
        console.log('Current village-admin user loaded:', user);
      },
      error: (error) => {
        console.error('Error loading current user details:', error);
      }
    });



     // Subscribe to messages observable to receive messages from the WebSocket service
     this.websocketService.messages$.subscribe(message => {
      if (message) {
        // Log and add the received message to the array of messages
        console.log(`Message received from ${message.sender}: ${message.content}`);

        // Filter out echo messages (messages we just sent) to prevent duplicates
        const now = Date.now();
        const isEchoMessage = message.content === this.lastSentMessage &&
                           message.senderId === this.currentUserId &&
                           (now - this.lastSentTime) < 5000; // Within 5 seconds

        if (isEchoMessage) {
          console.log('Filtering out echo message (duplicate)');
          return;
        }

        // Convert WebSocket message format to chat UI format
        const uiMessage = {
          sender: message.senderId === this.currentUserId ? 'me' : 'other',
          content: message.content,
          timestamp: new Date(message.timestamp || new Date())
        };

        this.chatMessages.push(uiMessage);
        console.log('Added message to chat UI:', uiMessage);

        // Clear the tracking variables after successfully adding a non-echo message
        this.lastSentMessage = '';
        this.lastSentTime = 0;
      }
    });

    // Subscribe to connection status observable to monitor connection status
    this.websocketService.connectionStatus$.subscribe(connected => {
      this.isConnected = connected;  // Update the connection status
      if (connected) {
        this.connectingMessage = '';  // Clear the connecting message once connected
        console.log('WebSocket connection established');
      }
    });
  }

  // Load current user details from API using userId from token
  loadCurrentUser(): void {
    const tokenUser = this.tokenService.getCurrentUser();
    if (tokenUser && tokenUser.userId) {
      this.usersService.getUserById(tokenUser.userId).subscribe({
        next: (user) => {
          this.currentUser = user;
          this.currentUserId = user.id!;
          console.log('Current village-admin user loaded:', user);

          // Extract village information
          if (user.village && user.village.id) {
            this.currentUserVillageId = user.village.id;
            this.currentUserVillageName = user.village.name || null;
            console.log('Village-admin village ID:', this.currentUserVillageId);
            console.log('Village-admin village name:', this.currentUserVillageName);
          } else {
            console.warn('Village-admin user has no village information');
          }

          // If chat popup is open and users haven't been loaded yet, load them now
          if (this.showChatPopup && this.chatUsers.length === 0) {
            this.loadChatUsers();
          }
        },
        error: (error) => {
          console.error('Error loading current user details:', error);
        }
      });
    } else {
      console.warn('No userId found in token');
    }
  }

  loadChatUsers(): void {
    if (!this.currentUserId) {
      console.log('Current user not loaded yet, cannot load chat users');
      return;
    }

    this.isLoadingUsers = true;
    // Fetch all users from backend API when chat is opened
    this.usersService.getAllUsers().subscribe({
      next: (users) => {
        this.chatUsers = users.filter(user => user.id !== this.currentUserId);
        console.log('Chat users loaded:', this.chatUsers.length, 'users');
        console.log('Current user ID for filtering:', this.currentUserId);
        this.isLoadingUsers = false;
      },
      error: (error) => {
        console.error('Error loading chat users:', error);
        this.isLoadingUsers = false;
      }
    });
  }

  ngAfterViewInit(): void {
    // Initialize charts after view is ready
    setTimeout(() => {
      this.initializeCharts();
    }, 100);
  }

  // User Menu Methods
  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  closeUserMenu() {
    this.showUserMenu = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-profile-wrapper')) {
      this.closeUserMenu();
    }
  }

  viewProfile() {
    console.log('Viewing profile...');
    this.closeUserMenu();
    this.router.navigate(['/profile']);
  }

  viewSubscriptions() {
    console.log('Viewing subscriptions...');
    this.closeUserMenu();
    // Implement subscriptions view
  }

  handleLogout() {
    this.closeUserMenu();
    console.log('Logging out...');
    this.tokenService.logout();
    // if (this.stompClient) {
    //   this.stompClient.deactivate();
    // }
  }

  // Navigation Methods
  navigateToEntityCreate() {
    this.router.navigate(['/entities']);
  }

  navigateToVillagers() {
    console.log('navigateToVillagers called');
    console.log('Current village-admin village ID:', this.currentUserVillageId);
    console.log('Current village-admin village name:', this.currentUserVillageName);

    if (this.currentUserVillageId) {
      // Navigate to villagers filtered by the village-admin's village
      console.log('Navigating to Villagers filtered by village ID:', this.currentUserVillageId);
      this.router.navigate(['/users'], {
        queryParams: {
          role: 'VILLAGER',
          villageId: this.currentUserVillageId,
          villageName: this.currentUserVillageName
        }
      }).then((result) => {
        console.log('Navigation result:', result);
        console.log('Current URL after navigation:', this.router.url);
      }).catch(error => {
        console.error('Navigation error:', error);
      });
    } else {
      // Fallback to general villagers view if no village info
      console.warn('No village information found for current user, using general villagers view');
      this.router.navigate(['/users'], { queryParams: { role: 'VILLAGER' } });
    }
  }

  navigateToEventCreate() {
    this.router.navigate(['/events']);
  }

  navigateToImageCreate() {
    this.router.navigate(['/images']);
  }

  // Coming Soon Feature
  showIncidentsComingSoon() {
    this.router.navigate(['/incidents']);
  }

  // Event Messages Auto-Scroll
  startEventMessagesScroll() {
    // Auto-scroll animation will be handled by CSS
  }

  // Chat Methods
  toggleChatPopup() {
    this.showChatPopup = !this.showChatPopup;
    if (this.showChatPopup) {
      this.unreadMessages = 0;
      // Load users when chat popup is opened, but only if current user is loaded
      if (this.currentUserId) {
        this.loadChatUsers();
      } else {
        console.log('Current user not loaded yet, users will be loaded when current user loads');
      }
      // Connect to WebSocket if not already connected
      if (!this.isConnected && this.currentUser?.id) {
        console.log('Connecting to WebSocket for chat functionality');
        this.connect();
      }
    } else {
      // Stop polling when chat is closed
      this.stopChatPolling();
      this.isChatActive = false;
    }
  }

  // startSmartChatPolling() {
  //   this.stopChatPolling(); // Clear any existing intervals

  //   this.isChatActive = true;

  //   // Only start polling if a user is selected
  //   if (!this.selectedChatUser) {
  //     console.log('No user selected, waiting for user selection before starting polling');
  //     return;
  //   }

  //   // Initial load
  //   this.loadChatMessages();

  //   // Start with less frequent polling (every 8 seconds) when chat is active but idle
  //   this.chatPollingInterval = setInterval(() => {
  //     this.smartPollForMessages();
  //   }, 8000); // Increased from 5 seconds

  //   // Set up activity listeners to increase polling frequency during active use
  //   this.setupChatActivityListeners();
  // }

  stopChatPolling() {
    if (this.chatPollingInterval) {
      clearInterval(this.chatPollingInterval);
      this.chatPollingInterval = null;
    }
    this.isChatActive = false;
    this.removeChatActivityListeners();
  }

  setupChatActivityListeners() {
    // Listen for user activity in the chat area
    const chatContainer = document.querySelector('.chat-popup');
    if (chatContainer) {
      // Increase polling frequency during active typing or clicking
      const activityEvents = ['mousedown', 'keydown', 'focus'];

      activityEvents.forEach(event => {
        chatContainer.addEventListener(event, (event) => {
          this.onChatActivity();
        }, { passive: true });
      });
    }
  }
  removeChatActivityListeners() {
    const chatContainer = document.querySelector('.chat-popup');
    if (chatContainer) {
      const activityEvents = ['mousedown', 'keydown', 'focus'];
      activityEvents.forEach(event => {
        chatContainer.removeEventListener(event, this.onChatActivity);
      });
    }
  }

  smartPollForMessages() {
    const now = Date.now();

    // Enforce minimum interval between polls to prevent excessive API calls
    if (now - this.lastPollTime < this.minPollInterval) {
      return;
    }

    this.lastPollTime = now;

    if (this.selectedChatUser && this.currentUserId && this.isChatActive) {
      this.loadChatMessages();
    }
  }

  onChatActivity() {
    if (this.isChatActive && this.chatPollingInterval) {
      console.log('Chat activity detected, increasing polling frequency');

      // Temporarily increase polling frequency during active use
      clearInterval(this.chatPollingInterval);
      this.chatPollingInterval = setInterval(() => {
        console.log('Active polling - checking for new messages');
        this.smartPollForMessages();
      }, 3000); // Poll every 3 seconds during active use (increased from 2)

      // Reset to normal frequency after 45 seconds of inactivity (increased from 30)
      setTimeout(() => {
        if (this.chatPollingInterval) {
          console.log('Activity timeout, resetting to normal polling frequency');
          clearInterval(this.chatPollingInterval);
          this.chatPollingInterval = setInterval(() => {
            this.smartPollForMessages();
          }, 8000); // Back to 8 seconds
        }
      }, 45000); // Increased timeout
    }
  }

  loadChatMessages(): void {
    if (this.selectedChatUser) {
      console.log('Loading chat messages for user:', this.selectedChatUser);
      console.log('Current user ID:', this.currentUser?.id);
      console.log('Current user:', this.currentUser);

      // Connect to WebSocket if not already connected
      if (!this.isConnected && this.currentUser?.id) {
        console.log('Connecting to WebSocket for real-time messaging');
        this.connect();
      }

      // Fetch initial chat history from REST API for context
      this.chatService.getChatMessages(this.selectedChatUser, this.currentUser!.id!).subscribe({
        next: (messages) => {
          console.log('Received initial messages from API:', messages);

          // Clear existing messages and load fresh from API
          this.chatMessages = messages.map((msg: any) => {
            console.log('Processing initial message:', msg);
            return {
              sender: msg.senderId === this.currentUserId ? 'me' : 'other',
              content: msg.content,
              timestamp: new Date(msg.timestamp)
            };
          });

          console.log('Loaded initial chat messages:', this.chatMessages);
        },
        error: (error) => {
          console.error('Error loading chat messages:', error);
        }
      });
    } else {
      this.chatMessages = [];
    }
  }

  private hasMessagesChanged(newMessages: any[]): boolean {
    // If no current messages or different count, definitely changed
    if (!this.chatMessages || newMessages.length !== this.chatMessages.length) {
      return newMessages.length > 0; // Only return true if there are actually new messages
    }

    // Compare each message - be more strict about what constitutes a change
    for (let i = 0; i < newMessages.length; i++) {
      const newMsg = newMessages[i];
      const currentMsg = this.chatMessages[i];

      // Check if any key properties are different
      if (newMsg.content !== currentMsg.content ||
          newMsg.senderId !== currentMsg.senderId ||
          new Date(newMsg.timestamp).getTime() !== new Date(currentMsg.timestamp).getTime()) {
        return true;
      }
    }

    return false; // No changes detected
  }

  sendMessage(): void {
    if (this.chatMessage.trim() && this.selectedChatUser && this.currentUserId) {
      const messageContent = this.chatMessage.trim();

      // Track what we just sent to prevent duplicates
      this.lastSentMessage = messageContent;
      this.lastSentTime = Date.now();

      // Prepare message data for WebSocket
      const message = {
        senderId: this.currentUserId,
        receiverId: this.selectedChatUser,
        content: messageContent,
        timestamp: new Date().toISOString(),
        token: this.tokenService.getToken()
      };

      // Send via WebSocket
      this.websocketService.sendMessage(message);

      // Clear input
      this.chatMessage = '';

      // Clear the tracking variables after sending
      this.lastSentMessage = '';
      this.lastSentTime = 0;
    }
  }

  // Chart Initialization
  initializeCharts() {
    this.createEntitiesChart();
    this.createVillagersChart();
    this.createEventsChart();
    this.createActivityChart();
  }

  createEntitiesChart() {
    if (this.entitiesChartRef) {
      const ctx = this.entitiesChartRef.nativeElement.getContext('2d');
      const chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Healthcare', 'Education', 'Government', 'Services'],
          datasets: [{
            data: [5, 4, 6, 3],
            backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
      this.charts.push(chart);
    }
  }

  createVillagersChart() {
    if (this.villagersChartRef) {
      const ctx = this.villagersChartRef.nativeElement.getContext('2d');
      const chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Villagers',
            data: [200, 215, 225, 230, 240, 245],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: false
            }
          }
        }
      });
      this.charts.push(chart);
    }
  }

  createEventsChart() {
    if (this.eventsChartRef) {
      const ctx = this.eventsChartRef.nativeElement.getContext('2d');
      const chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Events',
            data: [3, 5, 4, 6, 5, 7],
            backgroundColor: '#f59e0b',
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
      this.charts.push(chart);
    }
  }

  createActivityChart() {
    if (this.activityChartRef) {
      const ctx = this.activityChartRef.nativeElement.getContext('2d');
      const chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [
            {
              label: 'Logins',
              data: [45, 55, 60, 50, 48, 52, 50],
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              tension: 0.4
            },
            {
              label: 'Activities',
              data: [30, 40, 45, 38, 35, 40, 38],
              borderColor: '#8b5cf6',
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'bottom'
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
      this.charts.push(chart);
    }
  }

  ngOnDestroy() {
    // Clean up charts
    this.charts.forEach(chart => chart.destroy());
    // Stop chat polling and remove listeners
    this.stopChatPolling();
    // if (this.stompClient) {
    //   this.stompClient.deactivate();
    // }
  }



  connect(){

    console.log('Attempting to connect to WebSocket at http://localhost:8080/ws with username:', this.currentUser!.id!);
    this.websocketService.connect(this.currentUser!.id!);  // Call the WebSocket service to connect
  }

  sendMessages(){
    if (this.chatMessage.trim()) {
      const message = {
        senderId: this.currentUserId,
        receiverId: this.selectedChatUser,
        content: this.chatMessage.trim(),
        timestamp: new Date().toISOString()
      };
      this.websocketService.sendMessage(message);  // Send the message via WebSocket service
      this.chatMessage = '';  // Clear the message input after sending
    }
  }
}