import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { TokenService } from 'src/app/core/services/token.service';
import { ChartDB } from 'src/app/chartDB';
import { ApexOptions, ChartComponent } from 'ng-apexcharts';

@Component({
  selector: 'app-dashboard-landing',
  templateUrl: './dashboard-landing.component.html'
})
export class DashboardLandingComponent implements OnInit {
  role: string = '';

  constructor(private tokenService: TokenService) {
    

  }

  ngOnInit(): void {
    this.role = this.tokenService.getUserRole();
  }

    ngAfterViewInit(): void {
      this.setupSideMenuActivation();
      this.setupSidebarToggle();
      this.setupSearchToggle();
      this.setupInitialResponsiveState();
      this.setupSwitchMode();
    }
  
    private setupSideMenuActivation(): void {
      const allSideMenu = document.querySelectorAll<HTMLAnchorElement>('#sidebar .side-menu.top li a');
  
      allSideMenu.forEach(item => {
        const li = item.parentElement as HTMLElement;
  
        item.addEventListener('click', () => {
          allSideMenu.forEach(i => {
            i.parentElement?.classList.remove('active');
          });
          li.classList.add('active');
        });
      });
    }
  
    private setupSidebarToggle(): void {
      const menuBar = document.querySelector<HTMLElement>('#content nav .bx.bx-menu');
      const sidebar = document.getElementById('sidebar');
  
      menuBar?.addEventListener('click', () => {
        sidebar?.classList.toggle('hide');
      });
    }
  
    private setupSearchToggle(): void {
      const searchButton = document.querySelector<HTMLButtonElement>('#content nav form .form-input button');
      const searchButtonIcon = document.querySelector<HTMLElement>('#content nav form .form-input button .bx');
      const searchForm = document.querySelector<HTMLElement>('#content nav form');
  
      searchButton?.addEventListener('click', (e: MouseEvent) => {
        if (window.innerWidth < 576) {
          e.preventDefault();
          searchForm?.classList.toggle('show');
          if (searchForm?.classList.contains('show')) {
            searchButtonIcon?.classList.replace('bx-search', 'bx-x');
          } else {
            searchButtonIcon?.classList.replace('bx-x', 'bx-search');
          }
        }
      });
    }
  
    private setupInitialResponsiveState(): void {
      const sidebar = document.getElementById('sidebar');
      const searchButtonIcon = document.querySelector<HTMLElement>('#content nav form .form-input button .bx');
      const searchForm = document.querySelector<HTMLElement>('#content nav form');
  
      if (window.innerWidth < 768) {
        sidebar?.classList.add('hide');
      } else if (window.innerWidth > 576) {
        searchButtonIcon?.classList.replace('bx-x', 'bx-search');
        searchForm?.classList.remove('show');
      }
    }
  
    @HostListener('window:resize', ['$event'])
    onResize(event: UIEvent): void {
      const searchButtonIcon = document.querySelector<HTMLElement>('#content nav form .form-input button .bx');
      const searchForm = document.querySelector<HTMLElement>('#content nav form');
  
      if (window.innerWidth > 576) {
        searchButtonIcon?.classList.replace('bx-x', 'bx-search');
        searchForm?.classList.remove('show');
      }
    }
  
    private setupSwitchMode(): void {
      const switchMode = document.getElementById('switch-mode') as HTMLInputElement;
  
      switchMode?.addEventListener('change', function () {
        if (this.checked) {
          document.body.classList.add('dark');
        } else {
          document.body.classList.remove('dark');
        }
      });
    }
 
}
