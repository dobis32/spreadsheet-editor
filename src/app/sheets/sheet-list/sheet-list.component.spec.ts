import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SheetListComponent } from './sheet-list.component';
import { FirestoreService } from 'src/app/services/firestore.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Observable } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { FormBuilder } from '@angular/forms';
import { MockWorkBookFactory } from '../../mocks/mockData';

class MockFirestoreService {
	public signedIn: Observable<any>;
	public mockWorkBookFactory: MockWorkBookFactory;
	constructor() {
		this.signedIn = of(true);
		this.mockWorkBookFactory = new MockWorkBookFactory();
	}

	public getSheetCollection(id: string) {
		if (id)
			return <Observable<any>>of([
				{ name: 'sheet1', id: 'sheet_id1' },
				{ name: 'sheet2', id: 'sheet_id2' },
				{ name: 'sheet3', id: 'sheet_id3' }
			]);
		else return <Observable<any>>of([]);
	}

	public getWorkbookDocument(id: string) {
		let data = this.mockWorkBookFactory.getWorkBookDocument();
		if (id) return <Observable<any>>of(data);
		else return <Observable<any>>of(false);
	}

	public async addSheet(id: string, data: any) {
		try {
			if (!id || !data) throw new Error();
			return true;
		} catch (error) {
			console.log(error);
			return false;
		}
	}

	public deleteSheet(workbookId: string, sheetId: string) {
		try {
			if (!workbookId || !sheetId) throw new Error();
			else return true;
		} catch (error) {
			return false;
		}
	}
}

class MockActivatedRoute {
	public params: Observable<any>;
	constructor() {
		this.params = of({ workbookId: 'workbook_id' });
	}
}

class MockRouter {
	navigate(id: string) {
		return;
	}
}

describe('SheetListComponent', () => {
	let component: SheetListComponent;
	let fixture: ComponentFixture<SheetListComponent>;

	beforeEach(
		async(() => {
			TestBed.configureTestingModule({
				imports: [ RouterTestingModule ],
				declarations: [ SheetListComponent ],
				providers: [
					FormBuilder,
					{ provide: Router, useClass: MockRouter },
					{ provide: FirestoreService, useClass: MockFirestoreService },
					{ provide: ActivatedRoute, useClass: MockActivatedRoute }
				]
			}).compileComponents();
		})
	);

	beforeEach(() => {
		fixture = TestBed.createComponent(SheetListComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should have the Firestore service injected into it', () => {
		expect(component.firestoreService).toBeTruthy();
		expect(fixture.debugElement.injector.get(FirestoreService)).toBeTruthy();
	});

	it('should have an Activated Route injected into it', () => {
		expect(component.activatedRoute).toBeTruthy();
		expect(fixture.debugElement.injector.get(ActivatedRoute));
	});

	it('should have an Router injected into it', () => {
		expect(component.router).toBeTruthy();
		expect(fixture.debugElement.injector.get(Router));
	});

	it('should have the current workbook ID', () => {
		expect(component.workbookId).toBeTruthy();
	});

	it('should call function to get sheet data in constructor which calls the appropriate Firestore service function with workbook ID as the argument', async () => {
		let fireStoreSpy = spyOn(
			fixture.debugElement.injector.get(FirestoreService),
			'getSheetCollection'
		).and.callThrough();
		fixture = TestBed.createComponent(SheetListComponent);
		await fixture.whenStable();
		expect(fireStoreSpy).toHaveBeenCalledTimes(1);
		expect(fireStoreSpy).toHaveBeenCalledWith(component.workbookId);
	});

	it('should call function to get workbook data in constructor which calls the appropriate firestore service function with workbook ID as the argument', async () => {
		let fireStoreSpy = spyOn(
			fixture.debugElement.injector.get(FirestoreService),
			'getWorkbookDocument'
		).and.callThrough();
		fixture = TestBed.createComponent(SheetListComponent);
		await fixture.whenStable();
		expect(fireStoreSpy).toHaveBeenCalledTimes(1);
		expect(fireStoreSpy).toHaveBeenCalledWith(component.workbookId);
	});

	it('should have a function for getting sheet data of the workbook with the corresponding id from the firestore service', () => {
		expect(component.getSheetData).toBeTruthy();
		expect(typeof component.getSheetData).toEqual('function');

		let fsSpy = spyOn(component.firestoreService, 'getSheetCollection').and.callThrough();

		expect(fsSpy).toHaveBeenCalledTimes(0);

		component.sheets = undefined;

		expect(component.sheets).toBeFalsy();

		component.getSheetData(component.workbookId);

		expect(fsSpy).toHaveBeenCalledTimes(1);
		expect(component.sheets).toBeTruthy();
	});

	it('should have a function for getting sheet data of the workbook with the corresponding id from the firestore service that navigates to /workbook/list when there a falsy ID is passed as argument', () => {
		let fsSpy = spyOn(component.firestoreService, 'getSheetCollection').and.callThrough();
		let routerSpy = spyOn(component.router, 'navigate').and.callFake((routeParams: Array<any>) => {
			return Promise.resolve(true);
		});

		expect(fsSpy).toHaveBeenCalledTimes(0);

		component.getSheetData('');

		expect(fsSpy).toHaveBeenCalledTimes(0);
		expect(routerSpy).toHaveBeenCalledTimes(1);
		expect(routerSpy).toHaveBeenCalledWith([ '/workbooks/list' ]);
	});

	it('should have a function for getting the data of the current work book by calling the corresponding firestore service function with the current workbook ID as the arg', () => {
		expect(component.getWorkbookData).toBeTruthy();
		expect(typeof component.getWorkbookData).toEqual('function');

		let fsSpy = spyOn(component.firestoreService, 'getWorkbookDocument').and.callThrough();

		component.getWorkbookData(component.workbookId);

		expect(fsSpy).toHaveBeenCalledTimes(1);
		expect(fsSpy).toHaveBeenCalledWith(component.workbookId);
	});

	it('should have a function for adding a sheet that calls the corresponding firestore service function when the sheet form is valid', () => {
		let fsSpy = spyOn(component.firestoreService, 'addSheet').and.callThrough();

		expect(fsSpy).toHaveBeenCalledTimes(0);

		component.sheetForm.setValue({ name: 'some_value' });

		expect(component.sheetForm.valid).toBeTrue();

		component.addSheet(component.sheetForm);
		expect(fsSpy).toHaveBeenCalledTimes(1);
	});

	it('should have a function to navigate to the sheet editor', () => {
		const workbookId = 'book_id';
		const sheetId = 'sheet_id';
		const routerSpy = spyOn(component.router, 'navigate').and.callThrough();

		expect(component.editSheet).toBeTruthy();
		expect(typeof component.editSheet).toEqual('function');
		expect(routerSpy).toHaveBeenCalledTimes(0);

		component.editSheet(workbookId, sheetId);

		expect(routerSpy).toHaveBeenCalledTimes(1);
		expect(routerSpy).toHaveBeenCalledWith([ 'workbooks', workbookId, 'sheets', sheetId, 'edit' ]);
	});

	it('should have a function to navigate to the sheet viewer', () => {
		const workbookId = 'book_id';
		const sheetId = 'sheet_id';
		const routerSpy = spyOn(component.router, 'navigate').and.callThrough();

		expect(component.viewSheet).toBeTruthy();
		expect(typeof component.viewSheet).toEqual('function');
		expect(routerSpy).toHaveBeenCalledTimes(0);

		component.viewSheet(workbookId, sheetId);

		expect(routerSpy).toHaveBeenCalledTimes(1);
		expect(routerSpy).toHaveBeenCalledWith([ 'workbooks', workbookId, 'sheets', sheetId, 'view' ]);
	});

	it('should have a function to delete a sheet that calls the appropriate FirestoreService function when truthy ID args are passed', async () => {
		let workbookId = 'someID';
		let sheetId = 'someID';
		let afsSpy = spyOn(TestBed.get(FirestoreService), 'deleteSheet').and.callThrough();
		expect(workbookId && sheetId).toBeTruthy();
		expect(afsSpy).toHaveBeenCalledTimes(0);
		await component.deleteSheet(workbookId, sheetId);
		expect(afsSpy).toHaveBeenCalledTimes(1);
	});

	it('should have a function to delete a workbook that does not call the appropriate FirestoreService function when falsy ID args are passed', async () => {
		let workbookId = '';
		let sheetId = '';
		let afsSpy = spyOn(TestBed.get(FirestoreService), 'deleteSheet').and.callThrough();
		expect(workbookId && sheetId).toBeFalsy();
		expect(afsSpy).toHaveBeenCalledTimes(0);
		await component.deleteSheet(workbookId, sheetId);
		expect(afsSpy).toHaveBeenCalledTimes(0);
	});
});
