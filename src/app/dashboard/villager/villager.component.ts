import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { TokenService } from 'src/app/core/services/token.service';

Chart.register(...registerables);

@Component({
  selector: 'app-villager',
  templateUrl: './villager.component.html',
  styleUrls: ['./villager.component.scss']
})
export class VillagerComponent implements OnInit, AfterViewInit {
  
  userName = 'Ramesh';
  userImage = 'assets/people.png';
  
  // User Menu
  showUserMenu = false;

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

  // Chat
  showChatPopup = false;
  unreadMessages = 3;
  selectedChatUser = '';
  chatMessage = '';
  chatUsers = [
    { id: '1', name: 'Village Admin', role: 'Admin' },
    { id: '2', name: 'Rajesh Kumar', role: 'Villager' },
    { id: '3', name: 'Priya Sharma', role: 'Villager' },
    { id: '4', name: 'Amit Patel', role: 'Villager' }
  ];
  chatMessages: any[] = [];
  @ViewChild('vehicleChart') vehicleChartRef!: ElementRef;
  @ViewChild('eventsChart') eventsChartRef!: ElementRef;
  @ViewChild('entitiesChart') entitiesChartRef!: ElementRef;
  @ViewChild('activityChart') activityChartRef!: ElementRef;

  private charts: Chart[] = [];

  constructor(private router: Router,private tokenService: TokenService) {}

  ngOnInit(): void {
    // Load villager data
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

  viewNotifications() {
    console.log('Viewing notifications...');
    this.closeUserMenu();
    // Navigate to notifications page or show notifications modal
    // For now, just mark all as read
    this.notifications.forEach(notification => notification.read = true);
    this.notificationsCount = 0;
  }

  viewSubscriptions() {
    console.log('Viewing subscriptions...');
    this.closeUserMenu();
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
    this.router.navigate(['/images/create']);
  }

  navigateToComplaintCreate() {
    this.router.navigate(['/complaints/create']);
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
        { sender: 'me', text: 'I need some information about the health camp.', time: '10:32 AM' },
        { sender: 'other', text: 'Sure, the health camp is on Oct 15 at 9 AM.', time: '10:33 AM' }
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

  ngOnDestroy() {
    // Clean up charts
    this.charts.forEach(chart => chart.destroy());
  }
}
