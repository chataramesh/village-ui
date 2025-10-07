import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VillageAdminComponent } from './village-admin.component';

describe('VillageAdminComponent', () => {
  let component: VillageAdminComponent;
  let fixture: ComponentFixture<VillageAdminComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VillageAdminComponent]
    });
    fixture = TestBed.createComponent(VillageAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
