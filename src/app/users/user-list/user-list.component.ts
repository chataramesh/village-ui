import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UsersService, User, Role } from '../users.service';
import { ToastService } from 'src/app/shared/services/toast.service';


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
  contextRole: string | null = null; // Role from query params (store as string to avoid enum mismatch)
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
    private usersService: UsersService,private toast: ToastService
  ) {}

  ngOnInit(): void {
    // Check for role and village filters from query params
    this.route.queryParams.subscribe(params => {
      const roleParam = params['role'] as string | undefined;
      const villageIdParam = params['villageId'] as string | undefined;
      const villageNameParam = params['villageName'] as string | undefined;

      // If query params provided, use them and persist
      if (roleParam) {
        this.contextRole = roleParam;
        this.roleFilter = this.contextRole; // Set role filter to the context role
        try { localStorage.setItem('ul_context_role', this.contextRole); } catch {}
      }

      if (villageIdParam) {
        this.contextVillageId = villageIdParam;
        try { localStorage.setItem('ul_context_village_id', this.contextVillageId); } catch {}
      }

      if (villageNameParam) {
        this.contextVillageName = villageNameParam;
        try { localStorage.setItem('ul_context_village_name', this.contextVillageName); } catch {}
      }

      // If no query params, attempt to restore from storage
      if (!roleParam && !villageIdParam) {
        try {
          const savedRole = localStorage.getItem('ul_context_role');
          const savedVillageId = localStorage.getItem('ul_context_village_id');
          const savedVillageName = localStorage.getItem('ul_context_village_name');
          if (savedRole) {
            this.contextRole = savedRole;
            this.roleFilter = savedRole;
          }
          if (savedVillageId) {
            this.contextVillageId = savedVillageId;
          }
          if (savedVillageName) {
            this.contextVillageName = savedVillageName;
          }
        } catch {}
      }

      // If still no context, redirect to dashboard to avoid falling back to generic User Management unintentionally
      if (!this.contextRole && !this.contextVillageId) {
        // If user purposely opened /users with no context, keep page; otherwise, redirect. Here we enforce redirect.
        this.router.navigate(['/dashboard']);
        return;
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
    this.activeUsers = this.users.filter(u => u.active).length;
    this.inactiveUsers = this.users.filter(u => !u.active).length;
  }

  onSearch(): void {
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  onFilterChange(): void {
    // Only allow role filter changes if no context role is set
    if (!this.contextRole) {
      this.applyFilters();
    } else {
      // Reset role filter to context role if user tries to change it
      this.roleFilter = this.contextRole;
      this.applyFilters();
    }
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
      filtered = filtered.filter(user => user.active === isActive);
    }

    // Apply role filter only if no context role is set (to avoid double filtering)
    if (this.roleFilter !== 'all' && !this.contextRole) {
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
          this.toast.error('Failed to delete user');
        }
      });
    }
  }

  getPageTitle(): string {
    if (this.contextVillageId) {
      return `${this.contextVillageName || 'Village'} Villagers`;
    } else if (this.contextRole === 'VILLAGE_ADMIN') {
      return 'Village Admins';
    } else if (this.contextRole === 'VILLAGER') {
      return 'Villagers';
    }
    return 'User Management';
  }

  getCreateButtonText(): string {
    if (this.contextVillageId) {
      return 'Create Villager';
    } else if (this.contextRole === 'VILLAGE_ADMIN') {
      return 'Create Admin';
    } else if (this.contextRole === 'VILLAGER') {
      return 'Create Villager';
    }
    return 'Create User';
  }

  getStatsLabel(): string {
    if (this.contextVillageId) {
      return 'Villagers';
    } else if (this.contextRole === 'VILLAGE_ADMIN') {
      return 'Admins';
    } else if (this.contextRole === 'VILLAGER') {
      return 'Villagers';
    }
    return 'Users';
  }

  getSubtitle(): string {
    if (this.contextVillageId) {
      return `Manage villagers in ${this.contextVillageName || 'your village'}`;
    } else if (this.contextRole === 'VILLAGE_ADMIN') {
      return 'Manage and monitor village admins in the system';
    } else if (this.contextRole === 'VILLAGER') {
      return 'Manage and monitor villagers in the system';
    }
    return 'Manage and monitor all users in the system';
  }
}
