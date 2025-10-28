import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VillageListComponent } from './village-list.component';

describe('VillageListComponent', () => {
  let component: VillageListComponent;
  let fixture: ComponentFixture<VillageListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VillageListComponent]
    });
    fixture = TestBed.createComponent(VillageListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
