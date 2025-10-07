import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardLandingComponent } from './dashboard-landing.component';

describe('DashboardLandingComponent', () => {
  let component: DashboardLandingComponent;
  let fixture: ComponentFixture<DashboardLandingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardLandingComponent]
    });
    fixture = TestBed.createComponent(DashboardLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
