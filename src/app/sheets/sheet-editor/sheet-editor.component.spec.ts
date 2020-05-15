import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SheetEditorComponent } from './sheet-editor.component';
import { FormBuilder } from '@angular/forms';
import { FirestoreService } from 'src/app/services/firestore.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable, of } from 'rxjs';
import { MockSheetFactory } from '../../mocks/mockData';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EditHeaderFieldComponent } from 'src/app/modals/edit-header-field/edit-header-field.component';
import { EditRowComponent } from 'src/app/modals/edit-row/edit-row.component';

class MockFirestoreService {
	public signedIn: Observable<any>;
	public sheetFactory: MockSheetFactory;

	constructor() {
		this.signedIn = of(true);
		this.sheetFactory = new MockSheetFactory();
	}

	getSheetDocument(workbookId: string, sheetId: string) {
		try {
			if (!workbookId || !sheetId) throw new Error();
			let data = this.sheetFactory.getSheetDocument();
			return of(data);
		} catch (error) {
			return of(false);
		}
	}

	updateSheet(workbookId: string, sheetId: string, sheetData: any) {
		try {
			if (!workbookId || !sheetId || !sheetData) throw new Error();
			return true;
		} catch (error) {
			return false;
		}
	}
}
class MockActivatedRoute {
	public params: Observable<any>;

	constructor() {
		this.params = of({ workbookId: 'workbook_id', sheetId: 'sheet_id' });
	}
}
class MockRouter {
	navigate(params: any) {
		return;
	}
}

class MockNgbModal {
	open(modal: any) {
		return <NgbModalRef>{};
	}
}

describe('SheetEditorComponent', () => {
	let component: SheetEditorComponent;
	let fixture: ComponentFixture<SheetEditorComponent>;

	beforeEach(
		async(() => {
			TestBed.configureTestingModule({
				imports: [ RouterTestingModule ],
				declarations: [ SheetEditorComponent ],
				providers: [
					FormBuilder,
					{ provide: FirestoreService, useClass: MockFirestoreService },
					{ provide: ActivatedRoute, useClass: MockActivatedRoute },
					{ provide: Router, useClass: MockRouter },
					NgbModal
					// { provide: NgbModal, useClass: MockNgbModal }
				]
			}).compileComponents();
		})
	);

	beforeEach(() => {
		fixture = TestBed.createComponent(SheetEditorComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should use the injected activated route to get the current workbook ID', async () => {
		let idValues: any = await new Promise((resolve) => {
			component.activatedRoute.params.subscribe((params) => {
				resolve({ workbookId: params['workbookId'], sheetId: params['sheetId'] });
			});
		});

		expect(component.workbookId).toEqual(idValues.workbookId);
		expect(component.sheetId).toEqual(idValues.sheetId);
	});

	it('should have a function for clearing name update messages', () => {
		expect(component.clearUpdateMessages).toBeTruthy();
		expect(typeof component.clearUpdateMessages).toEqual('function');

		component.invalidNameForm = true;
		component.nameUpdateSuccess = true;
		component.nameUpdateFailure = true;

		expect(component.invalidNameForm && component.nameUpdateSuccess && component.nameUpdateFailure).toBeTrue();

		component.clearUpdateMessages();

		expect(component.invalidNameForm || component.nameUpdateSuccess || component.nameUpdateFailure).toBeFalse();
	});

	it('should call getWorkbookDocument function of the firestore service, passing the current workbook ID and sheet ID as arguments', async () => {
		let fireStoreSpy = spyOn(
			fixture.debugElement.injector.get(FirestoreService),
			'getSheetDocument'
		).and.callThrough();
		fixture = TestBed.createComponent(SheetEditorComponent);
		await fixture.whenStable();
		expect(fireStoreSpy).toHaveBeenCalledTimes(1);
		expect(fireStoreSpy).toHaveBeenCalledWith(component.workbookId, component.sheetId);
	});

	it('should have a function for updating the sheet name that calls the appropriate Firestore service function when the name form is valid', () => {
		expect(component.updateSheetName).toBeTruthy();
		expect(typeof component.updateSheetName).toEqual('function');

		let fsSpy = spyOn(component.firestoreService, 'updateSheet').and.callThrough();

		component.nameForm.setValue({ name: '' });

		expect(component.nameForm.valid).toBeFalse();

		component.updateSheetName(component.nameForm);

		expect(fsSpy).toHaveBeenCalledTimes(0);

		component.nameForm.setValue({ name: 'some_value' });

		expect(component.nameForm.valid).toBeTrue();

		component.updateSheetName(component.nameForm);

		expect(fsSpy).toHaveBeenCalledTimes(1);
	});

	it('should have an NgbModal injected into it', () => {
		expect(component.modalService).toBeTruthy();
		expect(fixture.debugElement.injector.get(NgbModal)).toBeTruthy();
	});

	it('should have a function to open injected modal service with the EditHeaderFieldComponent modal', () => {
		let modalSpy = spyOn(component.modalService, 'open').and.callThrough();

		component.openEditFieldModal();

		expect(modalSpy).toHaveBeenCalledTimes(1);
		expect(modalSpy).toHaveBeenCalledWith(EditHeaderFieldComponent);

		expect(component.openEditFieldModal).toBeTruthy();
		expect(typeof component.openEditFieldModal).toEqual('function');
	});

	it('should have a function to open injected modal service with the EditRowComponent modal', () => {
		let modalSpy = spyOn(component.modalService, 'open').and.callThrough();

		component.openEditRowModal();

		expect(modalSpy).toHaveBeenCalledTimes(1);
		expect(modalSpy).toHaveBeenCalledWith(EditRowComponent);

		expect(component.openEditRowModal).toBeTruthy();
		expect(typeof component.openEditRowModal).toEqual('function');
	});

	it('shoud have a function to create a row based on the header fields passed in', () => {
		let row = component.getRow(component.currentSheet.headerFields);

		let isDifferent = false;
		component.currentSheet.headerFields.forEach((headerField) => {
			if (row[headerField.name] != headerField.value && row[headerField.name] != parseFloat(headerField.value))
				isDifferent = true;
		});

		expect(component.getRow).toBeTruthy();
		expect(typeof component.getRow).toEqual('function');

		expect(isDifferent).toBeFalse();
	});
});
