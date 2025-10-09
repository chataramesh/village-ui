import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { TokenService } from 'src/app/core/services/token.service';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { UsersService } from 'src/app/users/users.service';
import { VillagerService } from '../villager/villager.service';

Chart.register(...registerables);

@Component({
  selector: 'app-super-admin',
  templateUrl: './super-admin.component.html',
  styleUrls: ['./super-admin.component.scss']
})
export class SuperAdminComponent implements OnInit, AfterViewInit {
  
  // User Menu
  showUserMenu = false;

  // Counts with detailed breakdown
  counts = {
    totalUsers: 1295,
    activeUsers: 1180,
    inactiveUsers: 115,
    villagers: 1250,
    activeVillagers: 1150,
    inactiveVillagers: 100,
    villageAdmins: 45,
    activeVillageAdmins: 30,
    inactiveVillageAdmins: 15,
    villages: 28,
    activeVillages: 25,
    inactiveVillages: 3
  };

  // Chat
  showChatPopup = false;
  unreadMessages = 3;
  selectedChatUser = '';
  chatMessage = '';
  chatUsers = [
    { id: '1', name: 'Rajesh Kumar', role: 'Villager' },
    { id: '2', name: 'Suresh Reddy', role: 'Village Admin' },
    { id: '3', name: 'Priya Sharma', role: 'Villager' },
    { id: '4', name: 'Kavita Mehta', role: 'Village Admin' }
  ];
  chatMessages: any[] = [];

  // Chart References
  @ViewChild('villageAdminsChart') villageAdminsChartRef!: ElementRef;
  @ViewChild('villagesChart') villagesChartRef!: ElementRef;
  @ViewChild('villagersChart') villagersChartRef!: ElementRef;
  @ViewChild('activityChart') activityChartRef!: ElementRef;

  private charts: Chart[] = [];

  constructor(
    private tokenService: TokenService,
    private router: Router,
    private userService: UsersService,
    private villagerService: VillagerService
  ) {}

  ngOnInit() {
    this.userService.getUsersCount().subscribe({
      next: (res) => {
        this.counts.totalUsers=res.userCount;
        this.counts.activeUsers=res.userActiveCount;
        this.counts.inactiveUsers=res.userInactiveCount;
      },
      error: (err) => {
        console.error('Error:', err);
        alert('Error: ' + JSON.stringify(err));
      }
    });
   
 
    // this.villagerService.getVillagers().subscribe((res: any) => {
    //   console.log(res);
    // });
    // this.villagerService.getActiveVillagers().subscribe((res: any) => {
    //   console.log(res);
    // });
    // this.villagerService.getInActiveVillagers().subscribe((res: any) => {
    //   console.log(res);
    // });
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
    this.tokenService.logout();
  }

  // Navigation Methods
  navigateToUserCreate() {
    
    this.router.navigate(['/users/']);
  }

  navigateToVillagesTree() {
    this.router.navigate(['/villages/']);
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
        { sender: 'me', text: 'I need some information about the village.', time: '10:32 AM' },
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

  ngOnDestroy() {
    // Clean up charts
    this.charts.forEach(chart => chart.destroy());
  }
}
