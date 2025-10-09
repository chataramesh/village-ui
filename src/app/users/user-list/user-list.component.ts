import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: 'active' | 'inactive';
  village: string;
  address: string;
  joinedDate: Date;
  lastLogin: Date;
}

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  
  // Stats
  totalVillagers: number = 0;
  activeVillagers: number = 0;
  inactiveVillagers: number = 0;

  // Search and Filter
  searchTerm: string = '';
  statusFilter: string = 'all';
  roleFilter: string = 'all';

  // Users Data
  users: User[] = [];
  filteredUsers: User[] = [];

  // Expanded Row
  expandedUserId: string | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    // Mock data - Replace with actual API call
    this.users = [
      {
        id: 'USR001',
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@example.com',
        phone: '+91 98765 43210',
        role: 'villager',
        status: 'active',
        village: 'Greenfield Village',
        address: '123 Main Street, Greenfield',
        joinedDate: new Date('2024-01-15'),
        lastLogin: new Date('2025-10-08 14:30')
      },
      {
        id: 'USR002',
        name: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        phone: '+91 98765 43211',
        role: 'village_admin',
        status: 'active',
        village: 'Greenfield Village',
        address: '456 Oak Avenue, Greenfield',
        joinedDate: new Date('2024-02-20'),
        lastLogin: new Date('2025-10-09 10:15')
      },
      {
        id: 'USR003',
        name: 'Amit Patel',
        email: 'amit.patel@example.com',
        phone: '+91 98765 43212',
        role: 'villager',
        status: 'active',
        village: 'Riverside Village',
        address: '789 River Road, Riverside',
        joinedDate: new Date('2024-03-10'),
        lastLogin: new Date('2025-10-07 16:45')
      },
      {
        id: 'USR004',
        name: 'Sunita Reddy',
        email: 'sunita.reddy@example.com',
        phone: '+91 98765 43213',
        role: 'villager',
        status: 'inactive',
        village: 'Hillside Village',
        address: '321 Hill Street, Hillside',
        joinedDate: new Date('2024-04-05'),
        lastLogin: new Date('2025-09-15 09:20')
      },
      {
        id: 'USR005',
        name: 'Vikram Singh',
        email: 'vikram.singh@example.com',
        phone: '+91 98765 43214',
        role: 'villager',
        status: 'active',
        village: 'Greenfield Village',
        address: '654 Pine Lane, Greenfield',
        joinedDate: new Date('2024-05-12'),
        lastLogin: new Date('2025-10-09 11:30')
      },
      {
        id: 'USR006',
        name: 'Anjali Desai',
        email: 'anjali.desai@example.com',
        phone: '+91 98765 43215',
        role: 'village_admin',
        status: 'active',
        village: 'Riverside Village',
        address: '987 Lake View, Riverside',
        joinedDate: new Date('2024-06-18'),
        lastLogin: new Date('2025-10-08 15:00')
      },
      {
        id: 'USR007',
        name: 'Manoj Gupta',
        email: 'manoj.gupta@example.com',
        phone: '+91 98765 43216',
        role: 'villager',
        status: 'inactive',
        village: 'Hillside Village',
        address: '147 Valley Road, Hillside',
        joinedDate: new Date('2024-07-22'),
        lastLogin: new Date('2025-08-20 12:10')
      },
      {
        id: 'USR008',
        name: 'Kavita Joshi',
        email: 'kavita.joshi@example.com',
        phone: '+91 98765 43217',
        role: 'villager',
        status: 'active',
        village: 'Greenfield Village',
        address: '258 Garden Street, Greenfield',
        joinedDate: new Date('2024-08-30'),
        lastLogin: new Date('2025-10-09 08:45')
      }
    ];

    this.updateStats();
    this.applyFilters();
  }

  updateStats(): void {
    this.totalVillagers = this.users.length;
    this.activeVillagers = this.users.filter(u => u.status === 'active').length;
    this.inactiveVillagers = this.users.filter(u => u.status === 'inactive').length;
  }

  onSearch(): void {
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.users];

    // Apply search filter
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.phone.toLowerCase().includes(search)
      );
    }

    // Apply status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === this.statusFilter);
    }

    // Apply role filter
    if (this.roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === this.roleFilter);
    }

    this.filteredUsers = filtered;
  }

  toggleUserDetails(userId: string): void {
    this.expandedUserId = this.expandedUserId === userId ? null : userId;
  }

  navigateToCreate(): void {
    this.router.navigate(['/users/create']);
  }

  editUser(userId: string): void {
    console.log('Edit user:', userId);
    this.router.navigate(['/users/edit', userId]);
  }

  deleteUser(userId: string): void {
    console.log('Delete user:', userId);
    // Add confirmation dialog and delete logic
    if (confirm('Are you sure you want to delete this user?')) {
      this.users = this.users.filter(u => u.id !== userId);
      this.updateStats();
      this.applyFilters();
    }
  }
}
