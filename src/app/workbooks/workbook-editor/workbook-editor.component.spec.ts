import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkbookEditorComponent } from './workbook-editor.component';
import { FirestoreService } from 'src/app/services/firestore.service';
import { Observable, of } from 'rxjs';
import { MockWorkBookFactory } from 'src/assets/mockData';
import { RouterTestingModule } from '@angular/router/testing';
import { routes } from '../../app-routing.module';
import { ActivatedRoute } from '@angular/router';
import { By } from '@angular/platform-browser';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EditHeaderFieldComponent } from '../../modals/edit-header-field/edit-header-field.component';

class MockFirestoreService {
	public signedIn: Observable<any>;
	public mockWorkBookFactory: MockWorkBookFactory;

	constructor() {
		this.signedIn = of('userID');
		this.mockWorkBookFactory = new MockWorkBookFactory();
	}

	public getWorkbookDocument(id: string) {
		let data = this.mockWorkBookFactory.getWorkBookDocument();
		if (id) return of(data);
		else return of(false);
	}

	public updateWorkbook(id: string, data: any) {
		try {
			if (!id || !data) throw new Error('Invalid ID or data');
			return true;
		} catch (error) {
			console.log(error);
			return false;
		}
	}
}

class MockActivatedRoute {
	public params: any;
	constructor() {
		this.params = of({ id: 'workbookID' });
	}
}

class MockNgbModal {
	constructor() {}
	open(data: any) {
		return <NgbModalRef>{ componentInstance: {} };
	}
}

describe('WorkbookEditorComponent', () => {
	let component: WorkbookEditorComponent;
	let fixture: ComponentFixture<WorkbookEditorComponent>;

	beforeEach(
		async(() => {
			TestBed.configureTestingModule({
				imports: [ FormsModule, ReactiveFormsModule, RouterTestingModule.withRoutes(routes) ],
				declarations: [ WorkbookEditorComponent ],
				providers: [
					FormBuilder,
					{ provide: NgbModal, useClass: MockNgbModal },
					{ provide: ActivatedRoute, useClass: MockActivatedRoute },
					{ provide: FirestoreService, useClass: MockFirestoreService }
				]
			}).compileComponents();
		})
	);

	beforeEach(() => {
		fixture = TestBed.createComponent(WorkbookEditorComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should have the firesstore service injected into it', () => {
		expect(component.firestoreService).toBeTruthy();
		expect(fixture.debugElement.injector.get(FirestoreService)).toBeTruthy();
	});

	it('should call the function the appropriate Firestore service function to get a workbook book with corresponding workbook ID passed as the argument', async () => {
		let fireStoreSpy = spyOn(
			fixture.debugElement.injector.get(FirestoreService),
			'getWorkbookDocument'
		).and.callThrough();
		fixture = TestBed.createComponent(WorkbookEditorComponent);
		await fixture.whenStable();
		expect(fireStoreSpy).toHaveBeenCalledTimes(1);
		expect(fireStoreSpy).toHaveBeenCalledWith(component.workbookId);
	});

	it('should have an activated route injected into it', () => {
		expect(fixture.debugElement.injector.get(ActivatedRoute)).toBeTruthy();
	});

	it('should use the injected activated route to get the current workbook ID', async () => {
		let id: string = await new Promise((resolve) => {
			component.activatedRoute.params.subscribe((params) => {
				resolve(params['id']);
			});
		});
		expect(component.workbookId).toEqual(id);
	});

	it('should have the current workbooks default headers rendered to the DOM', async () => {
		const headerElements = fixture.debugElement.queryAll(By.css('.default-header-fields'));
		expect(component.currentWorkbook.headerFields.length).toEqual(headerElements.length);
	});

	it('should have the current workbooks default rows rendered to the DOM', async () => {
		const rowElements = fixture.debugElement.queryAll(By.css('.default-rows'));
		expect(component.currentWorkbook.rows.length).toEqual(rowElements.length);
	});

	it('should have an updateWorkbookName function', () => {
		expect(component.updateWorkbookName).toBeTruthy();
		expect(typeof component.updateWorkbookName).toEqual('function');
	});

	it('should have an function for updating the name of the current workbook that calls the appropriate firestore service function when the associated formgroup has a truthy name value', async () => {
		component.nameForm.value.name = 'some_value';
		let firestoreSpy = spyOn(
			fixture.debugElement.injector.get(FirestoreService),
			'updateWorkbook'
		).and.callThrough();
		component.updateWorkbookName(component.nameForm);
		expect(firestoreSpy).toHaveBeenCalledTimes(1);
		component.nameForm.value.name = '';
		component.updateWorkbookName(component.nameForm);
		expect(firestoreSpy).toHaveBeenCalledTimes(1);
	});

	it('should have a function that should open the NgbModal with EditHeaderFieldComponent', () => {
		expect(component.openEditFieldModal).toBeTruthy();
		expect(typeof component.openEditFieldModal).toEqual('function');
		let modalSpy = spyOn(fixture.debugElement.injector.get(NgbModal), 'open').and.callThrough();
		let data = component.currentWorkbook.headerFields[0];
		component.openEditFieldModal(data);
		expect(modalSpy).toHaveBeenCalledTimes(1);
		expect(modalSpy).toHaveBeenCalledWith(EditHeaderFieldComponent);
	});

	it('should have a function for adding new header fields that opens the NgbModal with EditHeaderFieldComponent', () => {
		expect(component.openEditFieldModal).toBeTruthy();
		expect(typeof component.openEditFieldModal).toEqual('function');
		let modalSpy = spyOn(fixture.debugElement.injector.get(NgbModal), 'open').and.callThrough();
		component.openEditFieldModal();
		expect(modalSpy).toHaveBeenCalledTimes(1);
		expect(modalSpy).toHaveBeenCalledWith(EditHeaderFieldComponent);
	});

	it('should have a function to clear name update messages', () => {
		expect(component.clearUpdateMessages).toBeTruthy();
		expect(typeof component.clearUpdateMessages).toEqual('function');

		component.invalidNameForm = true;
		component.nameUpdateSuccess = true;
		component.nameUpdateFailure = true;

		expect(component.invalidNameForm && component.nameUpdateSuccess && component.nameUpdateFailure).toBeTrue();

		component.clearUpdateMessages();

		expect(component.invalidNameForm || component.nameUpdateSuccess || component.nameUpdateFailure).toBeFalse();
	});
});
