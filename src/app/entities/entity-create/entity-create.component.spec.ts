import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityCreateComponent } from './entity-create.component';

describe('EntityCreateComponent', () => {
  let component: EntityCreateComponent;
  let fixture: ComponentFixture<EntityCreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EntityCreateComponent]
    });
    fixture = TestBed.createComponent(EntityCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
