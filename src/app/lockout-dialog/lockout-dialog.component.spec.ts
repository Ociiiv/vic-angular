import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LockoutDialogComponent } from './lockout-dialog.component';

describe('LockoutDialogComponent', () => {
  let component: LockoutDialogComponent;
  let fixture: ComponentFixture<LockoutDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LockoutDialogComponent]
    });
    fixture = TestBed.createComponent(LockoutDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
