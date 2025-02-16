import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridMatTableComponent } from './grid-mat-table.component';

describe('GridMatTableComponent', () => {
  let component: GridMatTableComponent;
  let fixture: ComponentFixture<GridMatTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GridMatTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GridMatTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
