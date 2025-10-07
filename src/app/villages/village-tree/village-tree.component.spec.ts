import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VillageTreeComponent } from './village-tree.component';

describe('VillageTreeComponent', () => {
  let component: VillageTreeComponent;
  let fixture: ComponentFixture<VillageTreeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VillageTreeComponent]
    });
    fixture = TestBed.createComponent(VillageTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
