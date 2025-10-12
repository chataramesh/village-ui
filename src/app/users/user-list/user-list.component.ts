import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UsersService, User, Role } from '../users.service';


@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  
  // Stats
  totalUsers: number = 0;
  activeUsers: number = 0;
  inactiveUsers: number = 0;

  // Search and Filter
  searchTerm: string = '';
  statusFilter: string = 'all';
  roleFilter: string = 'all';
  contextRole: Role | null = null; // Role from query params
  contextVillageId: string | null = null; // Village ID from query params
  contextVillageName: string | null = null; // Village name from query params

  // Expose Role enum to template
  Role = Role;

  // Users Data
  users: User[] = [];
  filteredUsers: User[] = [];

  // Expanded Row
  expandedUserId: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private usersService: UsersService
  ) {}

  ngOnInit(): void {
    // Check for role and village filters from query params
    this.route.queryParams.subscribe(params => {
      const roleParam = params['role'];
      const villageIdParam = params['villageId'];
      const villageNameParam = params['villageName'];

      if (roleParam) {
        this.contextRole = roleParam as Role;
        this.roleFilter = this.contextRole;
      }

      if (villageIdParam) {
        this.contextVillageId = villageIdParam;
      }

      if (villageNameParam) {
        this.contextVillageName = villageNameParam;
      }

      this.loadUsers();
    });
  }

  loadUsers(): void {
    // Priority: village filter > role filter > all users
    if (this.contextVillageId) {
      // Load users by village (for village-admin filtering)
      this.usersService.getUsersByVillage(this.contextVillageId,this.roleFilter).subscribe({
        next: (data) => {
          this.users = data;
          this.updateStats();
          this.applyFilters();
        },
        error: (err) => {
          console.error('Error loading users by village:', err);
          this.users = [];
          this.updateStats();
          this.applyFilters();
        }
      });
    } else if (this.contextRole) {
      // Load users by role (existing functionality)
      this.usersService.getUsersByRole(this.contextRole as string).subscribe({
        next: (data) => {
          this.users = data;
          this.updateStats();
          this.applyFilters();
        },
        error: (err) => {
          console.error('Error loading users:', err);
          this.users = [];
          this.updateStats();
          this.applyFilters();
        }
      });
    } else {
      // Load all users (existing functionality)
      this.usersService.getAllUsers().subscribe({
        next: (data) => {
          this.users = data;
          this.updateStats();
          this.applyFilters();
        },
        error: (err) => {
          console.error('Error loading users:', err);
          this.users = [];
          this.updateStats();
          this.applyFilters();
        }
      });
    }
  }

  updateStats(): void {
    this.totalUsers = this.users.length;
    this.activeUsers = this.users.filter(u => u.isActive).length;
    this.inactiveUsers = this.users.filter(u => !u.isActive).length;
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
      const isActive = this.statusFilter === 'active';
      filtered = filtered.filter(user => user.isActive === isActive);
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
    // Pass context role and village to create page
    const queryParams: any = {};

    if (this.contextRole) {
      queryParams.role = this.contextRole;
    }

    if (this.contextVillageId) {
      queryParams.villageId = this.contextVillageId;
      queryParams.villageName = this.contextVillageName;
    }

    this.router.navigate(['/users/create'], {
      queryParams,
      replaceUrl: true // Replace current history entry
    });
  }

  editUser(userId: string): void {
    console.log('Edit user:', userId);
    this.router.navigate(['/users/edit', userId]);
  }

  deleteUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.usersService.deleteUser(userId).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error deleting user:', err);
          alert('Failed to delete user');
        }
      });
    }
  }

  getPageTitle(): string {
    if (this.contextVillageId) {
      return `${this.contextVillageName || 'Village'} Villagers`;
    } else if (this.contextRole === Role.VILLAGE_ADMIN) {
      return 'Village Admins';
    } else if (this.contextRole === Role.VILLAGER) {
      return 'Villagers';
    }
    return 'User Management';
  }

  getCreateButtonText(): string {
    if (this.contextVillageId) {
      return 'Create Villager';
    } else if (this.contextRole === Role.VILLAGE_ADMIN) {
      return 'Create Admin';
    } else if (this.contextRole === Role.VILLAGER) {
      return 'Create Villager';
    }
    return 'Create User';
  }

  getStatsLabel(): string {
    if (this.contextVillageId) {
      return 'Villagers';
    } else if (this.contextRole === Role.VILLAGE_ADMIN) {
      return 'Admins';
    } else if (this.contextRole === Role.VILLAGER) {
      return 'Villagers';
    }
    return 'Users';
  }

  getSubtitle(): string {
    if (this.contextVillageId) {
      return `Manage villagers in ${this.contextVillageName || 'your village'}`;
    } else if (this.contextRole === Role.VILLAGE_ADMIN) {
      return 'Manage and monitor village admins in the system';
    } else if (this.contextRole === Role.VILLAGER) {
      return 'Manage and monitor villagers in the system';
    }
    return 'Manage and monitor all users in the system';
  }
}
