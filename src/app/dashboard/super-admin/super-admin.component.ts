import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, HostListener, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { HttpClient } from '@angular/common/http';
import { TokenService } from 'src/app/core/services/token.service';
import { UsersService, User } from 'src/app/users/users.service';
import { ChatService } from 'src/app/core/services/chat.service';
import { WebsocketService } from 'src/app/core/services/websocket.service';
import { ProfileModalComponent, UserProfile } from 'src/app/shared/components/profile-modal/profile-modal.component';
import { UserProfileData } from 'src/app/shared/components/user-profile-dropdown/user-profile-dropdown.component';

Chart.register(...registerables);

@Component({
  selector: 'app-super-admin',
  templateUrl: './super-admin.component.html',
  styleUrls: ['./super-admin.component.scss']
})
export class SuperAdminComponent implements OnInit, AfterViewInit, OnDestroy {
  
  userName = 'Super Admin';
  userImage = 'assets/people.png';
  showUserMenu = false;

  // User Profile Data for shared component
  userProfileData: UserProfileData = {
    userName: 'Super Admin',
    userRole: 'SUPER_ADMIN',
    userImage: 'assets/people.png',
    userId: ''
  };

  // Counts with detailed breakdown
  counts = {
    villagers: 1250,
    activeVillagers: 1150,
    inactiveVillagers: 100,
    villageAdmins: 45,
    activeVillageAdmins: 30,
    inactiveVillageAdmins: 15,
    villages: 28,
    activeVillages: 25,
    inactiveVillages: 3,
    // New comprehensive counts
    countries: 0,
    activeCountries: 0,
    inactiveCountries: 0,
    states: 0,
    activeStates: 0,
    inactiveStates: 0,
    districts: 0,
    activeDistricts: 0,
    inactiveDistricts: 0,
    mandals: 0,
    activeMandals: 0,
    inactiveMandals: 0
  };

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

  // Chat Context Management
  private activeConversationPartner: string | null = null;

  // Chart References
  @ViewChild('villageAdminsChart') villageAdminsChartRef!: ElementRef;
  @ViewChild('villagesChart') villagesChartRef!: ElementRef;
  @ViewChild('villagersChart') villagersChartRef!: ElementRef;
  @ViewChild('activityChart') activityChartRef!: ElementRef;

  private charts: Chart[] = [];

  // Profile Modal Properties
  showProfileModal = false;
  currentUserProfile: UserProfile | null = null;

  constructor(
    private tokenService: TokenService,
    private router: Router,
    private userService: UsersService,
    private chatService: ChatService,
    private websocketService: WebsocketService
  ) {}

  ngOnInit() {
    this.loadCurrentUser();

    this.userService.getUsersCount().subscribe({
      next: (res: any) => {
        this.counts.villagers = res.totalVillagers;
        this.counts.activeVillagers = res.activeVillagers;
        this.counts.inactiveVillagers = res.inactiveVillagers;

        this.counts.villageAdmins = res.totalVillageAdmins;
        this.counts.activeVillageAdmins = res.activeVillageAdmins;
        this.counts.inactiveVillageAdmins = res.inactiveVillageAdmins;
      },
      error: (err: any) => {
        console.error('Error:', err);
        alert('Error: ' + JSON.stringify(err));
      }
    });
this.userService.getDashboardCount().subscribe({
  next: (res: any) => {
    // Village counts
    this.counts.villages = res?.villageCounts?.totalVillages || 0;
    this.counts.activeVillages = res?.villageCounts?.activeVillages || 0;
    this.counts.inactiveVillages = res?.villageCounts?.inactiveVillages || 0;

    // Country counts
    this.counts.countries = res?.countryCounts?.totalCountries || 0;
    this.counts.activeCountries = res?.countryCounts?.activeCountries || 0;
    this.counts.inactiveCountries = res?.countryCounts?.inactiveCountries || 0;

    // State counts
    this.counts.states = res?.stateCounts?.totalStates || 0;
    this.counts.activeStates = res?.stateCounts?.activeStates || 0;
    this.counts.inactiveStates = res?.stateCounts?.inactiveStates || 0;

    // District counts
    this.counts.districts = res?.districtCounts?.totalDistricts || 0;
    this.counts.activeDistricts = res?.districtCounts?.activeDistricts || 0;
    this.counts.inactiveDistricts = res?.districtCounts?.inactiveDistricts || 0;

    // Mandal counts
    this.counts.mandals = res?.mandalCounts?.totalMandals || 0;
    this.counts.activeMandals = res?.mandalCounts?.activeMandals || 0;
    this.counts.inactiveMandals = res?.mandalCounts?.inactiveMandals || 0;

    console.log('Comprehensive counts loaded:', this.counts);
  },
  error: (err: any) => {
    console.error('Error loading comprehensive counts:', err);
    alert('Error loading counts: ' + JSON.stringify(err));
  }
});
    
    // Setup WebSocket message handling with chat context filtering
    this.websocketService.messages$.subscribe(message => {
      if (message) {
        console.log(`Super-admin received message:`, message);

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

  ngAfterViewInit(): void {
    // Initialize charts after view is ready
    setTimeout(() => {
      this.initializeCharts();
    }, 100);
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
      this.userService.getUserById(tokenUser.userId).subscribe({
        next: (user) => {
          // Update user profile data with fetched user information
          this.userProfileData = {
            userName: user.name || 'Super Admin',
            userRole: user.role || 'SUPER_ADMIN',
            userImage: this.userImage,
            userId: this.currentUserId || ''
          };
          console.log('Current super-admin user loaded:', user);
        },
        error: (error) => {
          console.error('Error loading current user:', error);
        }
      });
    }
  }

  // Event handlers for shared user profile component
  onProfileModalOpened(userProfile: UserProfile): void {
    this.currentUserProfile = userProfile;
    this.showProfileModal = true;
  }

  onSubscriptionsNavigated(): void {
    this.router.navigate(['/dashboard/subscriptions']);
  }

  onLogoutClicked(): void {
    this.tokenService.logout();
  }

  // Profile Modal Methods
  closeProfileModal(): void {
    this.showProfileModal = false;
    this.currentUserProfile = null;
  }

  updateUserProfile(updatedProfile: UserProfile): void {
    console.log('Updating user profile:', updatedProfile);
    // Profile update logic can be added here if needed
    this.closeProfileModal();
  }

  deleteUserProfile(userId: string): void {
    console.log('Deleting user profile:', userId);
    this.closeProfileModal();
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
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.chatUsers = users.filter(user => user.id !== this.currentUserId);
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
  }

  handleLogout() {
    this.closeUserMenu();
    this.tokenService.logout();
  }

  // Navigation Methods
  navigateToUserCreate() {
    this.router.navigate(['/users/']);
  }

  navigateToVillageAdmins() {
    console.log('navigateToVillageAdmins called');
    this.router.navigate(['/users'], { queryParams: { role: 'VILLAGE_ADMIN' } });
  }

  navigateToVillagers() {
    console.log('navigateToVillagers called');
    this.router.navigate(['/users'], { queryParams: { role: 'VILLAGER' } });
  }

  navigateToVillagesTree() {
    this.router.navigate(['/villages/']);
  }

  navigateToCountries() {
    this.router.navigate(['/villages/countries']);
  }

  navigateToStates() {
    this.router.navigate(['/villages/states']);
  }

  navigateToDistricts() {
    this.router.navigate(['/villages/districts']);
  }

  navigateToMandals() {
    this.router.navigate(['/villages/mandals']);
  }

  navigateToImages() {
    this.router.navigate(['/images']);
  }

  navigateToEntities() {
    this.router.navigate(['/entities']);
  }

  navigateToVehicles() {
    this.router.navigate(['/vehicles']);
  }

  navigateToIncidents() {
    this.router.navigate(['/incidents']);
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

  // Chart Initialization
  initializeCharts() {
    this.createVillageAdminsChart();
    this.createVillagesChart();
    this.createVillagersChart();
    this.createActivityChart();
  }

  createVillageAdminsChart() {
    if (this.villageAdminsChartRef) {
      const ctx = this.villageAdminsChartRef.nativeElement.getContext('2d');
      const chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Active', 'Inactive', 'Pending'],
          datasets: [{
            data: [35, 5, 5],
            backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
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

  createVillagesChart() {
    if (this.villagesChartRef) {
      const ctx = this.villagesChartRef.nativeElement.getContext('2d');
      const chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['North', 'South', 'East', 'West'],
          datasets: [{
            label: 'Villages',
            data: [8, 6, 7, 7],
            backgroundColor: '#8b5cf6',
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

  createVillagersChart() {
    if (this.villagersChartRef) {
      const ctx = this.villagersChartRef.nativeElement.getContext('2d');
      const chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Villagers',
            data: [1000, 1050, 1100, 1150, 1200, 1250],
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
              data: [65, 78, 90, 81, 76, 85, 80],
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              tension: 0.4
            },
            {
              label: 'Activities',
              data: [45, 55, 70, 60, 55, 65, 60],
              borderColor: '#f59e0b',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
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

