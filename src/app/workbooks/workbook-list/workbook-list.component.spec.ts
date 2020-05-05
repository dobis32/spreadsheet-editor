import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkbookListComponent } from './workbook-list.component';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FirestoreService } from 'src/app/services/firestore.service';
import { of, Observable } from 'rxjs';
import { mockWorkbookData } from '../../../assets/mockData';

class MockFirestoreService {
	getWorkbookCollection() {
		return of(mockWorkbookData);
	}

	addWorkbook(workbook: any) {
		return Promise.resolve(true);
	}

	removeWorkbook(id: string) {
		return Promise.resolve(true);
	}

	public loggedIn: Observable<any> = of(true);
}

describe('WorkbookListComponent', () => {
	let component: WorkbookListComponent;
	let fixture: ComponentFixture<WorkbookListComponent>;

	beforeEach(
		async(() => {
			TestBed.configureTestingModule({
				imports: [ FormsModule, ReactiveFormsModule ],
				declarations: [ WorkbookListComponent ],
				providers: [ FormBuilder, { provide: FirestoreService, useClass: MockFirestoreService } ]
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

	it('should have a FormBuilder injected into it', () => {
		expect(component.formBuilder).toBeTruthy();
		expect(fixture.debugElement.injector.get(FormBuilder));
	});

	it('should have a Firestore service injected into it', () => {
		expect(component.firestoreService).toBeTruthy();
		expect(fixture.debugElement.injector.get(FirestoreService));
	});

	it('should have a list of workbooks stored as an array', () => {
		expect(component.workbooks).toBeTruthy();
		expect(Array.isArray(component.workbooks)).toBeTrue();
	});

	it('should have a function for creating a new workbook which calls the appropriate firestore service function', async () => {
		expect(component.addWorkbook).toBeTruthy();
		expect(typeof component.addWorkbook).toEqual('function');
		let fSpy = spyOn(fixture.debugElement.injector.get(FirestoreService), 'addWorkbook');
		component.workbookForm.value.name = 'testWorkbook';
		await component.addWorkbook(component.workbookForm);
		expect(fSpy).toHaveBeenCalled();
	});

	it('should have a function for creating a new workbook which will not call the appropriate firestore service function if there is no truthy name value in the workbook form', async () => {
		expect(component.addWorkbook).toBeTruthy();
		expect(typeof component.addWorkbook).toEqual('function');
		let fSpy = spyOn(fixture.debugElement.injector.get(FirestoreService), 'addWorkbook');
		component.workbookForm.value.name = '';
		await component.addWorkbook(component.workbookForm);
		expect(fSpy).toHaveBeenCalledTimes(0);
	});

	it('should reset the FormGroup passed to the function for creating new workbooks', async () => {
		let formResetSpy = spyOn(component.workbookForm, 'reset').and.callThrough();
		component.workbookForm.value.name = 'testWorkbook';
		expect(component.workbookForm.value.name).toBeTruthy();
		await component.addWorkbook(component.workbookForm);
		expect(component.workbookForm.value.name).toBeFalsy();
		expect(formResetSpy).toHaveBeenCalled();
	});

	it('should have a removeBook function that calls the appropriate FirestoreService function when a truthy ID arg is passed', async () => {
		let truthyID = 'someID';
		let afsSpy = spyOn(TestBed.get(FirestoreService), 'removeWorkbook').and.callThrough();
		expect(truthyID).toBeTruthy();
		expect(afsSpy).toHaveBeenCalledTimes(0);
		await component.removeWorkbook(truthyID);
		expect(afsSpy).toHaveBeenCalledTimes(1);
	});

	it('should have a removeBook function that does not call the appropriate FirestoreService function when a falsy ID arg is passed', async () => {
		let falsyID = '';
		let afsSpy = spyOn(TestBed.get(FirestoreService), 'removeWorkbook').and.callThrough();
		expect(falsyID).toBeFalsy();
		expect(afsSpy).toHaveBeenCalledTimes(0);
		await component.removeWorkbook(falsyID);
		expect(afsSpy).toHaveBeenCalledTimes(0);
	});
});
