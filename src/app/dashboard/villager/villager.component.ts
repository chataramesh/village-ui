import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, HostListener, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { TokenService } from 'src/app/core/services/token.service';
import { UsersService, User, Role } from 'src/app/users/users.service';
import { ChatService } from 'src/app/core/services/chat.service';
import { WebsocketService } from 'src/app/core/services/websocket.service';
import { ProfileModalComponent, UserProfile } from 'src/app/shared/components/profile-modal/profile-modal.component';
import { UserProfileData } from 'src/app/shared/components/user-profile-dropdown/user-profile-dropdown.component';

@Component({
  selector: 'app-villager',
  templateUrl: './villager.component.html',
  styleUrls: ['./villager.component.scss']
})
export class VillagerComponent implements OnInit, AfterViewInit, OnDestroy {
  
  userName = 'NA';
  userRole="NA";
  userImage = 'assets/people.png';

  // User Menu
  showUserMenu = false;

  // User Profile Data for shared component
  userProfileData: UserProfileData = {
    userName: 'NA',
    userRole: 'VILLAGER',
    userImage: 'assets/people.png',
    userId: ''
  };

  // Entities
  showEntitiesDropdown = false;
  selectedEntity: any = null;
  subscribedEntities = [
    {
      id: '1',
      name: 'Primary Health Center',
      type: 'Healthcare',
      villageId: 'v1',
      ownerName: 'Dr. Kumar',
      isOpen: true,
      openingTime: '09:00 AM',
      closingTime: '05:00 PM',
      availableSlots: 15
    },
    {
      id: '2',
      name: 'Government School',
      type: 'Education',
      villageId: 'v1',
      ownerName: 'Principal Sharma',
      isOpen: true,
      openingTime: '08:00 AM',
      closingTime: '03:00 PM',
      availableSlots: 0
    },
    {
      id: '3',
      name: 'Ration Shop',
      type: 'Essential Services',
      villageId: 'v1',
      ownerName: 'Mr. Patel',
      isOpen: true,
      openingTime: '10:00 AM',
      closingTime: '08:00 PM',
      availableSlots: 25
    },
    {
      id: '4',
      name: 'Community Hall',
      type: 'Public Facility',
      villageId: 'v1',
      ownerName: 'Village Council',
      isOpen: false,
      openingTime: '06:00 AM',
      closingTime: '10:00 PM',
      availableSlots: 5
    }
  ];

  // Vehicles
  showVehicleDropdown = false;
  vehicleTypes = ['2 Wheeler', '4 Wheeler', '8 Wheeler', 'Heavy Vehicle'];

  // Latest Events
  latestEvents = [
    { name: 'Village Cleanup Drive', time: '10:30 AM', description: 'Join us this Saturday for village cleanup' },
    { name: 'Health Camp', time: '09:15 AM', description: 'Free health checkup on Oct 15' },
    { name: 'Farmers Meeting', time: '08:00 AM', description: 'Monthly farmers meeting on Oct 18' },
    { name: 'Water Supply Update', time: 'Yesterday', description: 'Water supply timing changed to 6 AM - 9 AM' },
    { name: 'New Entity Added', time: 'Yesterday', description: 'Community Hall added to village entities' }
  ];

  // Notifications
  notificationsCount = 5;
  notifications = [
    { id: 1, title: 'New Entity Added', message: 'Primary Health Center has been added to your village', time: '2 hours ago', read: false },
    { id: 2, title: 'Event Reminder', message: 'Village cleanup drive is tomorrow at 7 AM', time: '5 hours ago', read: false },
    { id: 3, title: 'Subscription Update', message: 'You have been subscribed to Community Hall', time: '1 day ago', read: true },
    { id: 4, title: 'Water Supply Notice', message: 'Water supply timing changed to 6 AM - 9 AM', time: '2 days ago', read: true },
    { id: 5, title: 'Health Camp', message: 'Free health checkup camp on Oct 15', time: '3 days ago', read: true }
  ];

  // Chat properties
  showChatPopup = false;
  unreadMessages = 3;
  selectedChatUser: string = '';
  chatMessage: string = '';
  chatUsers: User[] = [];
  chatMessages: any[] = [];
  currentUserId: string | null = null;
  isLoadingUsers = false;
  isConnected = false;
  private lastSentMessage: string = '';
  private lastSentTime: number = 0;
  // Profile Modal
  showProfileModal = false;
  currentUserProfile: UserProfile | null = null;

  // Chat Context Management
  private activeConversationPartner: string | null = null;
  @ViewChild('vehicleChart') vehicleChartRef!: ElementRef;
  @ViewChild('eventsChart') eventsChartRef!: ElementRef;
  @ViewChild('entitiesChart') entitiesChartRef!: ElementRef;
  @ViewChild('activityChart') activityChartRef!: ElementRef;

  private charts: Chart[] = [];

  constructor(
    private router: Router,
    private tokenService: TokenService,
    private usersService: UsersService,
    private chatService: ChatService,
    private websocketService: WebsocketService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();

    // Setup WebSocket message handling with chat context filtering
    this.websocketService.messages$.subscribe(message => {
      if (message) {
        console.log(`Villager received message:`, message);

        // Filter out echo messages (messages we just sent) to prevent duplicates
        const now = Date.now();
        if (message.content === this.lastSentMessage &&
            message.senderId === this.currentUserId &&
            (now - this.lastSentTime) < 5000) {
          console.log('Filtering out echo message (duplicate)');
          return;
        }

        // Only display message if it belongs to current active conversation
        if (this.shouldDisplayMessage(message)) {
          // Convert WebSocket message format to chat UI format
          const uiMessage = {
            sender: message.senderId === this.currentUserId ? 'me' : 'other',
            content: message.content,
            timestamp: new Date(message.timestamp || new Date())
          };

          console.log('Adding message to chat UI:', uiMessage);
          this.chatMessages.push(uiMessage);
        }

        // Clear the tracking variables after successfully adding a non-echo message
        this.lastSentMessage = '';
        this.lastSentTime = 0;
      }
    });

    // Subscribe to connection status observable to monitor connection status
    this.websocketService.connectionStatus$.subscribe(connected => {
      this.isConnected = connected;
      if (connected) {
        console.log('WebSocket connection established');
      }
    });
  }

  ngOnDestroy() {
    // Clean up charts
    this.charts.forEach(chart => chart.destroy());
  }

  // Load current user details
  loadCurrentUser(): void {
    const tokenUser = this.tokenService.getCurrentUser();
   
    if (tokenUser && tokenUser.userId) {
      this.currentUserId = tokenUser.userId;
      this.usersService.getUserById(tokenUser.userId).subscribe(user => {
        this.userName = user.name || 'NA';
        this.userRole = user.role || 'NA';

        // Update shared component data
        this.userProfileData = {
          userName: this.userName,
          userRole: this.userRole,
          userImage: this.userImage,
          userId: this.currentUserId || ''
        };
      });
      console.log('Current villager user loaded:', this.currentUserId);
    }
  }

  // Event handlers for shared user profile component
  onProfileModalOpened(userProfile: UserProfile): void {
    this.currentUserProfile = userProfile;
    this.showProfileModal = true;
  }

  onSubscriptionsNavigated(): void {
    this.router.navigate(['/dashboard/villager/subscriptions']);
  }

  onLogoutClicked(): void {
    this.tokenService.logout();
  }
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

    // Call API to get user profile data
    if (this.currentUserId) {
      this.usersService.getUserById(this.currentUserId).subscribe({
        next: (userData) => {
          this.currentUserProfile = {
            id: userData.id || this.currentUserId || '',
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            role: userData.role,
            village: userData.village?.name || '',
            joinDate: userData.createdDate?.toISOString() || new Date().toISOString(),
            address: '', // User interface doesn't have address field
            emergencyContact: '' // User interface doesn't have emergencyContact field
          };
          this.showProfileModal = true;
        },
        error: (error) => {
          console.error('Error loading user profile:', error);
          // Fallback to current user data if API fails
          this.currentUserProfile = {
            id: this.currentUserId || '',
            name: this.userName,
            email: `${this.userName.toLowerCase().replace(' ', '.')}@village.local`,
            phone: '+91-9876543210',
            role: this.userRole,
            village: 'Village Name',
            joinDate: new Date().toISOString(),
            address: 'Village Address, District',
            emergencyContact: '+91-9876543211'
          };
          this.showProfileModal = true;
        }
      });
    }
  }

  viewSubscriptions() {
    console.log('Viewing subscriptions...');
    this.closeUserMenu();
    this.router.navigate(['/dashboard/villager/subscriptions']);
  }

  // Profile Modal Methods
  closeProfileModal(): void {
    this.showProfileModal = false;
    this.currentUserProfile = null;
  }

  updateUserProfile(updatedProfile: UserProfile): void {
    console.log('Updating user profile:', updatedProfile);

    // Call API to update user profile
    if (updatedProfile.id) {
      // First get current user data to preserve other fields
      this.usersService.getUserById(updatedProfile.id).subscribe({
        next: (currentUserData) => {
          const updateData: User = {
            ...currentUserData,
            name: updatedProfile.name,
            email: updatedProfile.email,
            phone: updatedProfile.phone,
            role: updatedProfile.role as Role
          };

          this.usersService.updateUser(updatedProfile.id, updateData).subscribe({
            next: (updatedUser) => {
              console.log('Profile updated successfully:', updatedUser);
              // Update local user data
              this.userName = updatedUser.name;
              this.userRole = updatedUser.role;
              this.closeProfileModal();
            },
            error: (error) => {
              console.error('Error updating user profile:', error);
              // Keep modal open for retry
            }
          });
        },
        error: (error) => {
          console.error('Error getting current user data:', error);
          // Keep modal open for retry
        }
      });
    }
  }

  deleteUserProfile(userId: string): void {
    console.log('Deleting user profile:', userId);
    // Here you would typically call a service to delete the profile
    // For now, just close the modal
    this.closeProfileModal();
  }

  handleLogout() {
    this.closeUserMenu();
    console.log('Logging out...');
    this.tokenService.logout();
  }

  navigateToEntities() {
    console.log('Navigating to entities...');
    this.closeUserMenu();
    this.router.navigate(['/dashboard/villager/entities']);
  }

  navigateToVehicleBooking() {
    console.log('Navigating to vehicle booking...');
    this.router.navigate(['/vehicle-booking']);
  }

  selectEntity(entity: any) {
    this.selectedEntity = entity;
    this.showEntitiesDropdown = false;
  }

  closeEntityDetails() {
    this.selectedEntity = null;
  }

  // Vehicle Methods
  toggleVehicleDropdown() {
    this.showVehicleDropdown = !this.showVehicleDropdown;
    if (this.showVehicleDropdown) {
      this.showEntitiesDropdown = false;
    }
  }

  selectVehicleType(type: string) {
    console.log('Selected vehicle type:', type);
    this.showVehicleDropdown = false;
    this.router.navigate(['/vehicle-booking'], { queryParams: { type } });
  }

  // Navigation Methods
  navigateToImageCreate() {
    this.router.navigate(['/images']);
  }

  navigateToComplaintCreate() {
    this.router.navigate(['/incidents']);
  }
  navigateToVehicles() {
    this.router.navigate(['/vehicles']);
  }

  navigateToEvents() {
    this.router.navigate(['/events']);
  }

  navigateToTemples() {
    this.router.navigate(['/temples']);
  }

  navigateToSchools() {
    this.router.navigate(['/schools']);
  }

  navigateToIncidents() {
    this.router.navigate(['/incidents']);
  }
  ngAfterViewInit(): void {
    // Initialize charts after view is ready
    setTimeout(() => {
      this.initializeCharts();
    }, 100);
  }

  // Chat Methods
  toggleChatPopup() {
    this.showChatPopup = !this.showChatPopup;
    if (this.showChatPopup) {
      this.unreadMessages = 0;
      if (this.currentUserId) {
        this.loadChatUsers();
      }
      if (!this.isConnected && this.currentUserId) {
        console.log('Connecting to WebSocket for chat functionality');
        this.connect();
      }
    }
  }

  loadChatUsers(): void {
    if (!this.currentUserId) {
      console.log('Current user not loaded yet, cannot load chat users');
      return;
    }

    this.isLoadingUsers = true;
    this.usersService.getAllUsers().subscribe({
      next: (users: any) => {
        this.chatUsers = users.filter((user: any) => user.id !== this.currentUserId);
        console.log('Chat users loaded:', this.chatUsers.length, 'users');
        this.isLoadingUsers = false;
      },
      error: (error) => {
        console.error('Error loading chat users:', error);
        this.isLoadingUsers = false;
      }
    });
  }

  loadChatMessages() {
    if (this.selectedChatUser) {
      // Set active conversation context
      this.setActiveConversation(this.selectedChatUser);

      console.log('Loading chat messages for user:', this.selectedChatUser);
      if (!this.isConnected && this.currentUserId) {
        console.log('Connecting to WebSocket for real-time messaging');
        this.connect();
      }

      this.chatService.getChatMessages(this.selectedChatUser, this.currentUserId!).subscribe({
        next: (messages) => {
          console.log('Received initial messages from API:', messages);
          this.chatMessages = messages.map((msg: any) => {
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
      this.activeConversationPartner = null;
    }
  }

  sendMessage(): void {
    if (this.chatMessage.trim() && this.selectedChatUser && this.currentUserId) {
      const messageContent = this.chatMessage.trim();

      // Immediately add the message to the UI
      const sentMessage = {
        sender: 'me',
        content: messageContent,
        timestamp: new Date()
      };
      this.chatMessages.push(sentMessage);

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

      console.log('Sending WebSocket message:', message);

      // Send via WebSocket
      this.websocketService.sendMessage(message);

      // Clear input
      this.chatMessage = '';
    }
  }

  connect() {
    console.log('Connecting to WebSocket with user ID:', this.currentUserId);
    this.websocketService.connect(this.currentUserId!);
  }

  // Chat Context Management Methods
  private setActiveConversation(partnerId: string): void {
    this.activeConversationPartner = partnerId;
    console.log('Active conversation set to:', partnerId);
  }

  private shouldDisplayMessage(message: any): boolean {
    if (!this.activeConversationPartner) {
      return false;
    }

    // Display message if it belongs to current active conversation
    // Message should be shown if:
    // 1. Current user is sender and partner is receiver
    // 2. Current user is receiver and partner is sender
    return (message.senderId === this.currentUserId && message.receiverId === this.activeConversationPartner) ||
           (message.receiverId === this.currentUserId && message.senderId === this.activeConversationPartner);
  }

  // Chart Initialization
  initializeCharts() {
    this.createVehicleChart();
    this.createEventsChart();
    this.createEntitiesChart();
    this.createActivityChart();
  }

  createVehicleChart() {
    if (this.vehicleChartRef) {
      const ctx = this.vehicleChartRef.nativeElement.getContext('2d');
      const chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['2 Wheeler', '4 Wheeler', '8 Wheeler', 'Heavy'],
          datasets: [{
            label: 'Bookings',
            data: [12, 8, 5, 3],
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
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

  createEventsChart() {
    if (this.eventsChartRef) {
      const ctx = this.eventsChartRef.nativeElement.getContext('2d');
      const chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Events Attended',
            data: [3, 5, 4, 6, 5, 7],
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
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
              beginAtZero: true
            }
          }
        }
      });
      this.charts.push(chart);
    }
  }

  createEntitiesChart() {
    if (this.entitiesChartRef) {
      const ctx = this.entitiesChartRef.nativeElement.getContext('2d');
      const chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Healthcare', 'Education', 'Services', 'Public'],
          datasets: [{
            data: [25, 30, 20, 25],
            backgroundColor: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'],
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
              data: [5, 7, 6, 8, 7, 9, 8],
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              tension: 0.4
            },
            {
              label: 'Activities',
              data: [3, 5, 4, 6, 5, 7, 6],
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
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

}

