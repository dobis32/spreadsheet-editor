import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SheetListComponent } from './sheet-list.component';
import { FirestoreService } from 'src/app/services/firestore.service';
import { ActivatedRoute } from '@angular/router';
import { of, Observable } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { FormBuilder } from '@angular/forms';
import { MockWorkBookFactory } from 'src/assets/mockData';

class MockFirestoreService {
	public signedIn: Observable<any>;
	public mockWorkBookFactory: MockWorkBookFactory;
	constructor() {
		this.signedIn = of(true);
		this.mockWorkBookFactory = new MockWorkBookFactory();
	}

	getSheetCollection(id: string) {
		if (id)
			return <Observable<any>>of([
				{ name: 'sheet1', id: 'sheet_id1' },
				{ name: 'sheet2', id: 'sheet_id2' },
				{ name: 'sheet3', id: 'sheet_id3' }
			]);
		else return <Observable<any>>of([]);
	}

	getWorkbookDocument(id: string) {
		if (id) return of(this.mockWorkBookFactory.getWorkBookDocument());
		else return of(false);
	}

	async addSheet(id: string, data: any) {
		try {
			if (!id || !data) throw new Error();
			return true;
		} catch (error) {
			console.log(error);
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

	it('should have the current workbook ID', () => {
		expect(component.workbookId).toBeTruthy();
	});

	it('should have a function for getting sheet data of the workbook with the corresponding id from the firestore service', () => {
		expect(component.getSheetData).toBeTruthy();
		expect(typeof component.getSheetData).toEqual('function');

		let fsSpy = spyOn(component.firestoreService, 'getSheetCollection').and.callThrough();

		component.sheets = undefined;

		expect(component.sheets).toBeFalsy();

		component.getSheetData(component.workbookId);

		expect(fsSpy).toHaveBeenCalled();
		expect(component.sheets).toBeTruthy();
	});

	// Get this P.O.S. working (corresponding mock service function is returning nothing????)
	// it('should have a function for getting the data of the current work book by calling the corresponding firestore service function with the current workbook ID as the arg', () => {
	// 	expect(component.getWorkbookData).toBeTruthy();
	// 	expect(typeof component.getWorkbookData).toEqual('function');
	// 	let fsSpy = spyOn(component.firestoreService, 'getWorkbookDocument');
	// 	expect(fsSpy).toHaveBeenCalledTimes(0);
	// 	component.getWorkbookData(component.workbookId);
	// 	expect(fsSpy).toHaveBeenCalledTimes(0);
	// 	expect(fsSpy).toHaveBeenCalledWith(component.workbookId);
	// });

	it('should have a function for adding a sheet that calls the corresponding firestore service function when the sheet form is valid', () => {
		let fsSpy = spyOn(component.firestoreService, 'addSheet').and.callThrough();

		expect(fsSpy).toHaveBeenCalledTimes(0);

		component.sheetForm.setValue({ name: 'some_value' });

		expect(component.sheetForm.valid).toBeTrue();

		component.addSheet(component.sheetForm);
		expect(fsSpy).toHaveBeenCalledTimes(1);
	});
});
