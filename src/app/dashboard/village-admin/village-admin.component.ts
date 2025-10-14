import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { TokenService } from 'src/app/core/services/token.service';
import { UsersService, User } from 'src/app/users/users.service';

Chart.register(...registerables);

@Component({
  selector: 'app-village-admin',
  templateUrl: './village-admin.component.html',
  styleUrls: ['./village-admin.component.scss']
})
export class VillageAdminComponent implements OnInit, AfterViewInit {
  
  villageName :any= 'Green Valley Village';
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

  // Chat
  showChatPopup = false;
  unreadMessages = 2;
  selectedChatUser = '';
  chatMessage = '';
  chatUsers = [
    { id: '1', name: 'Rajesh Kumar', role: 'Villager' },
    { id: '2', name: 'Priya Sharma', role: 'Villager' },
    { id: '3', name: 'Amit Patel', role: 'Villager' },
    { id: '4', name: 'Sunita Devi', role: 'Villager' }
  ];
  chatMessages: any[] = [];

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

  constructor(private router: Router, private tokenService: TokenService, private usersService: UsersService) {}

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
  }

  // Load current user details from API using userId from token
  loadCurrentUser(): void {
    const tokenUser = this.tokenService.getCurrentUser();
    if (tokenUser && tokenUser.userId) {
      this.usersService.getUserById(tokenUser.userId).subscribe({
        next: (user) => {
          this.currentUser = user;
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
        },
        error: (error) => {
          console.error('Error loading current user details:', error);
        }
      });
    } else {
      console.warn('No userId found in token');
    }
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
    if (!target.closest('.user-menu-wrapper')) {
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
    this.router.navigate(['/images/create']);
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
    }
  }

  loadChatMessages() {
    // Load messages for selected user
    if (this.selectedChatUser) {
      this.chatMessages = [
        { sender: 'other', text: 'Hello! How can I help you?', time: '10:30 AM' },
        { sender: 'me', text: 'I need some information.', time: '10:32 AM' },
        { sender: 'other', text: 'Sure, what would you like to know?', time: '10:33 AM' }
      ];
    }
  }

  sendMessage() {
    if (this.chatMessage.trim() && this.selectedChatUser) {
      this.chatMessages.push({
        sender: 'me',
        text: this.chatMessage,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      });
      this.chatMessage = '';
      
      // Simulate response
      setTimeout(() => {
        this.chatMessages.push({
          sender: 'other',
          text: 'Thank you for your message. I will get back to you soon.',
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        });
      }, 1000);
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
  }
}
