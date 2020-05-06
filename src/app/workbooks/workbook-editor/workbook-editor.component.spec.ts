import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkbookEditorComponent } from './workbook-editor.component';
import { FirestoreService } from 'src/app/services/firestore.service';
import { Observable, of } from 'rxjs';
import { mockWorkbookDocument } from 'src/assets/mockData';
import { RouterTestingModule } from '@angular/router/testing';
import { routes } from '../../app-routing.module';
import { ActivatedRoute } from '@angular/router';
import { By } from '@angular/platform-browser';

class MockFirestoreService {
	public signedIn: Observable<any>;
	constructor() {
		this.signedIn = of('userID');
	}

	public getWorkbookDocument(id: string) {
		if (id) return of(mockWorkbookDocument);
		else return of(false);
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
				imports: [ RouterTestingModule.withRoutes(routes) ],
				declarations: [ WorkbookEditorComponent ],
				providers: [
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

	it('should have an editRow function', () => {
		expect(component.editRow).toBeTruthy();
		expect(typeof component.editRow).toEqual('function');
	});
});
