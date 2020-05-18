import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkbookListComponent } from './workbook-list.component';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FirestoreService } from 'src/app/services/firestore.service';
import { of, Observable } from 'rxjs';
import { mockWorkbookCollection, MockWorkBookFactory } from '../../mocks/mockData';
import { RouterTestingModule } from '@angular/router/testing';
import { routes } from '../../app-routing.module';
import { ActivatedRoute, Router } from '@angular/router';

class MockFirestoreService {
	public signedIn: Observable<any>;
	public mockWorkBookFactory: MockWorkBookFactory;

	constructor() {
		this.signedIn = of('userID');
		this.mockWorkBookFactory = new MockWorkBookFactory();
	}
	getWorkbookCollection() {
		return of(mockWorkbookCollection);
	}

	addWorkbook(workbook: any) {
		return Promise.resolve(true);
	}

	deleteWorkbook(id: string) {
		return Promise.resolve(true);
	}
}

describe('WorkbookListComponent', () => {
	let component: WorkbookListComponent;
	let fixture: ComponentFixture<WorkbookListComponent>;

	beforeEach(
		async(() => {
			TestBed.configureTestingModule({
				imports: [ FormsModule, ReactiveFormsModule, RouterTestingModule.withRoutes(routes) ],
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

	it('should have a function to delete a workbook that calls the appropriate FirestoreService function when a truthy ID arg is passed', async () => {
		let truthyID = 'someID';
		let afsSpy = spyOn(TestBed.get(FirestoreService), 'deleteWorkbook').and.callThrough();
		expect(truthyID).toBeTruthy();
		expect(afsSpy).toHaveBeenCalledTimes(0);
		await component.deleteWorkbook(truthyID);
		expect(afsSpy).toHaveBeenCalledTimes(1);
	});

	it('should have a function to delete a workbook that does not call the appropriate FirestoreService function when a falsy ID arg is passed', async () => {
		let falsyID = '';
		let afsSpy = spyOn(TestBed.get(FirestoreService), 'deleteWorkbook').and.callThrough();
		expect(falsyID).toBeFalsy();
		expect(afsSpy).toHaveBeenCalledTimes(0);
		await component.deleteWorkbook(falsyID);
		expect(afsSpy).toHaveBeenCalledTimes(0);
	});

	it('should call getWorkbookCollection function of the firestore service', async () => {
		let mockData: Array<any> = mockWorkbookCollection;
		let fireStoreSpy = spyOn(
			fixture.debugElement.injector.get(FirestoreService),
			'getWorkbookCollection'
		).and.callThrough();
		fixture = TestBed.createComponent(WorkbookListComponent);
		expect(fireStoreSpy).toHaveBeenCalledTimes(1);
		expect(component.workbooks).toEqual(mockData);
	});

	it('should have an activate route injected into it', () => {
		expect(fixture.debugElement.injector.get(ActivatedRoute)).toBeTruthy();
	});

	it('should have a router injected into it', () => {
		expect(fixture.debugElement.injector.get(Router)).toBeTruthy();
	});

	it('should have an editWorkbook function', () => {
		expect(component.editWorkbook).toBeTruthy();
		expect(typeof component.editWorkbook).toEqual('function');
	});

	it('should use the injected router to navigate to the workbook edit page when the editWorkbook function is called with truthy string arg', () => {
		let router = fixture.debugElement.injector.get(Router);
		let routerSpy = spyOn(router, 'navigate').and.callFake(() => {
			return Promise.resolve(true);
		});
		expect(routerSpy).toHaveBeenCalledTimes(0);
		component.editWorkbook('some_workbook_ID');
		expect(routerSpy).toHaveBeenCalledTimes(1);
		component.editWorkbook('');
		expect(routerSpy).toHaveBeenCalledTimes(1);
	});
});
