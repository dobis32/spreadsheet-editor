import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditHeaderFieldComponent } from './edit-header-field.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder } from '@angular/forms';
import { MockWorkBookFactory } from 'src/assets/mockData';
import { FirestoreService } from 'src/app/services/firestore.service';
import { By } from '@angular/platform-browser';

class MockNgbActiveModal {}
class MockFireStoreService {
	async updateWorkbook(id: string, data: any) {
		try {
			if (!id || !data) throw new Error();
			else return true;
		} catch (error) {
			return false;
		}
	}
}

describe('EditHeaderFieldComponent', () => {
	let component: EditHeaderFieldComponent;
	let fixture: ComponentFixture<EditHeaderFieldComponent>;
	let mockWorkbookFactory: MockWorkBookFactory;
	let mockWorkbook: any;
	beforeEach(
		async(() => {
			TestBed.configureTestingModule({
				declarations: [ EditHeaderFieldComponent ],
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
		fixture = TestBed.createComponent(EditHeaderFieldComponent);
		component = fixture.componentInstance;
		component.fieldToEdit = mockWorkbook.defaults.headerFields[0];
		component.workbook = mockWorkbook;
		component.workbookId = component.workbook.id;
		component.fs = TestBed.get(FirestoreService);
		delete component.workbook.id;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should have a function that clears success/failure update messages from DOM', () => {
		expect(component.clearUpdateMessages).toBeTruthy();
		expect(typeof component.clearUpdateMessages).toEqual('function');

		component.updateSuccess = true;
		component.updateFailure = true;
		fixture.detectChanges();

		expect(fixture.debugElement.query(By.css('.error-message'))).toBeTruthy();
		expect(component.updateFailure).toBeTrue();
		expect(fixture.debugElement.query(By.css('.success-message'))).toBeTruthy();
		expect(component.updateSuccess).toBeTrue();

		component.clearUpdateMessages();
		fixture.detectChanges();

		expect(fixture.debugElement.query(By.css('.error-message'))).toBeFalsy();
		expect(component.updateFailure).toBeFalse();
		expect(fixture.debugElement.query(By.css('.success-message'))).toBeFalsy();
		expect(component.updateSuccess).toBeFalse();
	});

	it('should have a function that updates the values of the field being edited corresponding to the values from the associated form group', () => {
		let fgData = { name: 'new_name', text: true, value: 'some_new_value' };

		component.headerFieldForm.setValue(fgData);

		let result = component.setFieldToEditValues(
			mockWorkbook.defaults.headerFields[0],
			component.headerFieldForm.value
		);

		expect(result).toEqual(mockWorkbook.defaults.headerFields[0]);
		expect(result.name).toEqual(fgData.name);
		expect(result.text).toEqual(fgData.text);
		expect(result.value).toEqual(fgData.value);
		expect(typeof result.value == 'string').toBeTrue();
	});

	it('should have a function that parses appropriate values when updating the default value of a header field', () => {
		let fgData = { name: 'new_name', text: false, value: '0' }; // note that the function will parse the value to a number, since 'text' is false
		component.headerFieldForm.setValue(fgData);

		let result = component.setFieldToEditValues(
			mockWorkbook.defaults.headerFields[0],
			component.headerFieldForm.value
		);

		expect(result.value).toEqual(parseFloat(component.headerFieldForm.value.value));
		expect(typeof result.value != 'string').toBeTrue();

		component.headerFieldForm.setValue({ name: 'new_name', text: true, value: 'some_new_value' });
		result = component.setFieldToEditValues(mockWorkbook.defaults.headerFields[0], component.headerFieldForm.value);

		expect(result.value).toEqual(component.headerFieldForm.value.value);
		expect(typeof result.value == 'string').toBeTrue();
	});

	it('should have a function that updates and returns the default row data corresponding to the meta data of an updated header field', () => {
		let updatedField = { name: 'new_name', text: true, value: 'abc' };
		let rows = mockWorkbook.defaults.rows;
		let oldField = mockWorkbook.defaults.headerFields[1];

		expect(rows[0][updatedField.name] == undefined).toBeTruthy();

		let result = component.updateRows(updatedField, rows, oldField);

		expect(result[0][updatedField.name] == undefined).toBeFalse();

		result = component.updateRows(updatedField, [], oldField);

		expect(result).toEqual([]);
	});

	it('should have a save function that updates header data, updates row data, and updates the workbook document in firestore', async () => {
		let updateHeaderSpy = spyOn(component, 'setFieldToEditValues').and.callThrough();
		let updateRowSpy = spyOn(component, 'updateRows').and.callThrough();
		let fsSpy = spyOn(component.fs, 'updateWorkbook').and.callThrough();

		component.headerFieldForm.setValue(mockWorkbook.defaults.headerFields[1]);
		component.save(component.headerFieldForm);

		await fixture.whenStable();

		expect(updateHeaderSpy).toHaveBeenCalledTimes(1);
		expect(updateRowSpy).toHaveBeenCalledTimes(1);
		expect(fsSpy).toHaveBeenCalledTimes(1);
	});

	it('should have a function to filter specified header field object from header fields array', () => {
		expect(component.getFiltered).toBeTruthy();
		expect(typeof component.getFiltered).toEqual('function');

		let headerFieldToFilter = { ...mockWorkbook.defaults.headerFields[1] };
		let result = component.getFiltered(mockWorkbook.defaults.headerFields, headerFieldToFilter);
		let wasNotFiltered = result.some((headerField) => {
			return headerField == headerFieldToFilter;
		});

		expect(wasNotFiltered).toBeFalse();
	});

	it('should have a function to delete a header field', async () => {
		expect(component.deleteHeaderField).toBeTruthy();
		expect(typeof component.deleteHeaderField).toEqual('function');

		let fsSpy = spyOn(component.fs, 'updateWorkbook').and.callThrough();
		component.deleteHeaderField({ ...mockWorkbook.defaults.headerFields[1] });

		expect(fsSpy).toHaveBeenCalledTimes(1);
	});

	it('should have a function to return data of a single row which has had a specified field value parsed to a number; if the specified field cannot be parsed, it will be set to zero', () => {
		let result = component.parseFieldValueToNumber({ strField: 'abc' }, 'strField');

		expect(result).toEqual(0);

		result = component.parseFieldValueToNumber({ strField: '32' }, 'strField');
		expect(result).toEqual(32);
	});
});
