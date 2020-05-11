import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SheetEditorComponent } from './sheet-editor.component';

describe('SheetEditorComponent', () => {
  let component: SheetEditorComponent;
  let fixture: ComponentFixture<SheetEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SheetEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SheetEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
