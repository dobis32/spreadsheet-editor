import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkbookListComponent } from './workbook-list.component';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FirestoreService } from 'src/app/services/firestore.service';
import { of } from 'rxjs';
import { mockWorkbookData } from '../../../assets/mockData';

class MockFireStoreService {
	getWorkbookCollection() {
		return of(mockWorkbookData);
	}
}

describe('WorkbookListComponent', () => {
	let component: WorkbookListComponent;
	let fixture: ComponentFixture<WorkbookListComponent>;

	beforeEach(
		async(() => {
			TestBed.configureTestingModule({
				imports: [ FormsModule, ReactiveFormsModule ],
				declarations: [ WorkbookListComponent ],
				providers: [ FormBuilder, { provide: FirestoreService, useClass: MockFireStoreService } ]
			}).compileComponents();
		})
	);

	beforeEach(() => {
		fixture = TestBed.createComponent(WorkbookListComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should have a list of workbooks stored as an array', () => {
		expect(component.workbooks).toBeTruthy();
		expect(Array.isArray(component.workbooks)).toBeTrue();
	});

	it('should have a function for creating a new workbook, that adds a new workbook to the workbooks array', () => {
		let ogBookCount = component.workbooks.length;
		component.workbookForm.value.name = 'testWorkbook';

		expect(component.addWorkbook).toBeTruthy();
		expect(typeof component.addWorkbook).toEqual('function');

		component.addWorkbook(component.workbookForm);
		expect(component.workbooks.length).toBeGreaterThan(ogBookCount);
	});

	it('should reset the FormGroup passed to the function for creating new workbooks', () => {
		component.workbookForm.value.name = 'testWorkbook';
		expect(component.workbookForm.value.name).toBeTruthy();
		component.addWorkbook(component.workbookForm);
		expect(component.workbookForm.value.name).toBeFalsy();
	});

	it('should have a FormBuilder injected into it', () => {
		expect(component.formBuilder).toBeTruthy();
		expect(fixture.debugElement.injector.get(FormBuilder));
	});

	it('should have a Firestore service injected into it', () => {
		expect(component.firestoreService).toBeTruthy();
		expect(fixture.debugElement.injector.get(FirestoreService));
	});
});
