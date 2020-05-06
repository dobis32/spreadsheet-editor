import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkbookEditorComponent } from './workbook-editor.component';
import { FirestoreService } from 'src/app/services/firestore.service';
import { Observable, of } from 'rxjs';
import { mockWorkbookDocument } from 'src/assets/mockData';
import { RouterTestingModule } from '@angular/router/testing';
import { routes } from '../../app-routing.module';
import { ActivatedRoute } from '@angular/router';
import { By } from '@angular/platform-browser';
import { FormBuilder, FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';

class MockFirestoreService {
	public signedIn: Observable<any>;
	constructor() {
		this.signedIn = of('userID');
	}

	public getWorkbookDocument(id: string) {
		if (id) return of(mockWorkbookDocument);
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

	it('should call getWorkbookDocument function of the firestore service, passing the current workbook ID string as the argument', async () => {
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
			component.route.params.subscribe((params) => {
				resolve(params['id']);
			});
		});
		expect(component.workbookId).toEqual(id);
	});

	it('should have the current workbooks default headers rendered to the DOM', async () => {
		const headerElements = fixture.debugElement.queryAll(By.css('.default-header-fields'));
		expect(component.currentWorkbook.defaults.headerFields.length).toEqual(headerElements.length);
	});

	it('should have the current workbooks default rows rendered to the DOM', async () => {
		const rowElements = fixture.debugElement.queryAll(By.css('.default-rows'));
		expect(component.currentWorkbook.defaults.rows.length).toEqual(rowElements.length);
	});

	it('should have an updateWorkbookName function', () => {
		expect(component.updateWorkbookName).toBeTruthy();
		expect(typeof component.updateWorkbookName).toEqual('function');
	});

	it('should have an updateWorkbookName function that calls the appropriate firestore service function when the associated formgroup has a truthy name value', async () => {
		component.nameForm.value.name = 'some_value';
		let firestoreSpy = spyOn(
			fixture.debugElement.injector.get(FirestoreService),
			'updateWorkbook'
		).and.callThrough();
		component.updateWorkbookName(component.nameForm);
		expect(firestoreSpy).toHaveBeenCalledTimes(1);
		component.nameForm.value.name = ''; // falsy value
		component.updateWorkbookName(component.nameForm);
		expect(firestoreSpy).toHaveBeenCalledTimes(1); // expect to not have been called another time
	});

	it('should have an editRow function', () => {
		expect(component.editRow).toBeTruthy();
		expect(typeof component.editRow).toEqual('function');
	});

	it('should have an addHeaderField function', () => {
		expect(component.addHeaderField).toBeTruthy();
		expect(typeof component.addHeaderField).toEqual('function');
	});

	it('should have a deleteHeaderField function', () => {
		expect(component.deleteHeaderField).toBeTruthy();
		expect(typeof component.deleteHeaderField).toEqual('function');
	});
});
