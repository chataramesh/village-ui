import { Component, OnInit } from '@angular/core';
import { BackNavigationService } from './core/services/back-navigation.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'village-ui';

  constructor(private backNavigationService: BackNavigationService) {}

  ngOnInit(): void {
    // Initialize back navigation handling
    this.backNavigationService.initialize();
  }
}
