import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRowComponent } from './edit-row.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FirestoreService } from 'src/app/services/firestore.service';
import { MockWorkBookFactory } from 'src/assets/mockData';
import { By } from '@angular/platform-browser';

class MockNgbActiveModal {
	close() {}
}
class MockFireStoreService {
	async updateWorkbook(id: string, data: any) {
		try {
			if (!id || !data) throw new Error();
			else return true;
		} catch (error) {
			return false;
		}
	}

	async updateSheet(id: string, data: any) {
		try {
			if (!id || !data) throw new Error();
			else return true;
		} catch (error) {
			return false;
		}
	}
}

describe('EditRowComponent', () => {
	let component: EditRowComponent;
	let fixture: ComponentFixture<EditRowComponent>;
	let mockWorkbookFactory: MockWorkBookFactory;
	let mockWorkbook: any;
	beforeEach(
		async(() => {
			TestBed.configureTestingModule({
				declarations: [ EditRowComponent ],
				providers: [
					FormBuilder,
					{ provide: NgbActiveModal, useClass: MockNgbActiveModal },
					{ provide: FirestoreService, useClass: MockFireStoreService }
				]
			}).compileComponents();
		})
	);

	beforeEach(() => {
		mockWorkbookFactory = new MockWorkBookFactory();
		mockWorkbook = mockWorkbookFactory.getWorkBookDocument();
		fixture = TestBed.createComponent(EditRowComponent);
		component = fixture.componentInstance;
		component.rowToEdit = mockWorkbook.rows[0];
		component.data = mockWorkbook;
		component.workbookId = component.data.id;
		component.sheetId = 'some_id';
		delete component.data.id;
		component.fs = TestBed.get(FirestoreService);
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should have a function that clears success/failure update messages from DOM', () => {
		expect(component.clearUpdateMessages).toBeTruthy();
		expect(typeof component.clearUpdateMessages).toEqual('function');

		component.updateFailure = true;
		fixture.detectChanges();

		expect(fixture.debugElement.query(By.css('.error-message'))).toBeTruthy();
		expect(component.updateFailure).toBeTrue();

		component.clearUpdateMessages();
		fixture.detectChanges();

		expect(fixture.debugElement.query(By.css('.error-message'))).toBeFalsy();
		expect(component.updateFailure).toBeFalse();
	});

	it('should have a function that updates the values of the row being edited corresponding to the values from the associated form group', () => {
		component.rowForm.setValue(mockWorkbook.rows[1]);

		let result = component.setRowToEditValues({ ...mockWorkbook.rows[0] }, component.rowForm.value);

		expect(result).toEqual(mockWorkbook.rows[1]);
	});

	it('should have a save function that updates row data, and updates the workbook document in firestore (when the component has a falsy sheet ID)', async () => {
		component.sheetId = undefined;
		let updateHeaderSpy = spyOn(component, 'setRowToEditValues').and.callThrough();
		let fsSpy = spyOn(component.fs, 'updateWorkbook').and.callThrough();

		component.rowForm.setValue({ ...mockWorkbook.rows[1] });
		component.save(component.rowForm);

		await fixture.whenStable();

		expect(updateHeaderSpy).toHaveBeenCalledTimes(1);
		expect(fsSpy).toHaveBeenCalledTimes(1);
	});

	it('should have a save function that updates row data, and updates the workbook document in firestore (when the component has a truthy sheet ID)', async () => {
		let updateHeaderSpy = spyOn(component, 'setRowToEditValues').and.callThrough();
		let fsSpy = spyOn(component.fs, 'updateSheet').and.callThrough();

		component.rowForm.setValue({ ...mockWorkbook.rows[1] });
		component.save(component.rowForm);

		await fixture.whenStable();

		expect(updateHeaderSpy).toHaveBeenCalledTimes(1);
		expect(fsSpy).toHaveBeenCalledTimes(1);
	});

	it('should have a function to filter specified row object from row array', () => {
		expect(component.getFiltered).toBeTruthy();
		expect(typeof component.getFiltered).toEqual('function');

		let rowToFilter = { ...mockWorkbook.rows[1] };
		let result = component.getFiltered(mockWorkbook.rows, rowToFilter);
		let wasNotFiltered = result.some((row) => {
			return row == rowToFilter;
		});

		expect(wasNotFiltered).toBeFalse();
	});

	it('should have a function to delete a row that removes a single row and updates the workbook with the firebase service (when the component has a falsy sheet ID)', () => {
		let fsSpy = spyOn(component.fs, 'updateWorkbook').and.callThrough();
		let filterSpy = spyOn(component, 'getFiltered').and.callThrough();

		component.sheetId = undefined;

		component.deleteRow(component.data.rows[2]);

		expect(fsSpy).toHaveBeenCalledTimes(1);
		expect(filterSpy).toHaveBeenCalledTimes(1);
		expect(component.deleteRow).toBeTruthy();
		expect(typeof component.deleteRow).toEqual('function');
	});

	it('should have a function to delete a row that removes a single row and updates the sheet with the firebase service (when the component has a truthy sheet ID)', () => {
		let fsSpy = spyOn(component.fs, 'updateSheet').and.callThrough();
		let filterSpy = spyOn(component, 'getFiltered').and.callThrough();

		component.deleteRow(component.data.rows[2]);

		expect(fsSpy).toHaveBeenCalledTimes(1);
		expect(filterSpy).toHaveBeenCalledTimes(1);
		expect(component.deleteRow).toBeTruthy();
		expect(typeof component.deleteRow).toEqual('function');
	});
});
