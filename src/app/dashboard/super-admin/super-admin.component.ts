import { Component, OnInit } from '@angular/core';
import { TokenService } from 'src/app/core/services/token.service';

@Component({
  selector: 'app-super-admin',
  templateUrl: './super-admin.component.html',
  styleUrls: ['./super-admin.component.scss']
})
export class SuperAdminComponent implements OnInit {
  ngOnInit(): void {
  
  }
  constructor(private tokenService: TokenService) {}

  handleLogout() {
    // Implement logout logic
    console.log('Logging out...');
    this.tokenService.logout();
  }

  addAdmin() {
    // Navigate to add admin page
    console.log('Navigating to Add Admin...');
  }

  viewAdmins() {
    console.log('Viewing all admins...');
  }

  assignVillage() {
    console.log('Assigning village...');
  }

  viewAssignments() {
    console.log('Viewing assignments...');
  }
}
