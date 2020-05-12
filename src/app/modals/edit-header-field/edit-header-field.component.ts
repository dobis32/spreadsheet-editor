import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
	selector: 'app-edit-header-field',
	templateUrl: './edit-header-field.component.html',
	styleUrls: [ './edit-header-field.component.scss' ]
})
export class EditHeaderFieldComponent implements OnInit {
	@Input() fieldToEdit: any;
	@Input() workbookId: string;
	@Input() sheetId: string;
	// @Input() workbook: any;
	@Input() data: any;
	@Input() fs: FirestoreService;
	public updateFailure: boolean;
	public updateSuccess: boolean;
	public headerFieldForm: FormGroup;
	public initialField: any;
	constructor(public activeModal: NgbActiveModal, public formBuilder: FormBuilder) {
		this.headerFieldForm = this.formBuilder.group({ name: '', text: false, value: '' });
		this.updateFailure = false;
		this.updateSuccess = false;
		this.initialField = {};
	}

	ngOnInit(): void {
		this.headerFieldForm.setValue(this.fieldToEdit);
		this.initialField = { ...this.fieldToEdit };
	}

	async save(fg: FormGroup) {
		this.clearUpdateMessages();
		this.fieldToEdit = this.setFieldToEditValues(this.fieldToEdit, fg.value);
		if (!this.data.headerFields.some((field) => field == this.fieldToEdit)) {
			this.data.headerFields.push(this.fieldToEdit);
		}
		this.data.rows = this.updateRows(this.fieldToEdit, this.data.rows, this.initialField);
		let result;
		if (this.sheetId) result = this.fs.updateSheet(this.workbookId, this.sheetId, this.data);
		else result = this.fs.updateWorkbook(this.workbookId, this.data);
		if (result) this.updateSuccess = true;
		else this.updateFailure = true;
	}

	clearUpdateMessages() {
		this.updateFailure = false;
		this.updateSuccess = false;
	}

	setFieldToEditValues(fieldToEdit: any, editedValues: any) {
		for (let [ key, value ] of Object.entries(editedValues)) {
			if (key == 'value' && editedValues.text == false) {
				try {
					fieldToEdit[key] = parseFloat(<any>value);
				} catch (error) {
					console.log(error);
					fieldToEdit[key] = 0;
				}
			} else fieldToEdit[key] = value;
		}
		return fieldToEdit;
	}

	updateRows(updatedField: any, rows: Array<any>, oldField: any) {
		rows.forEach((row) => {
			if (oldField.name == '') {
				// new field
				row[updatedField.name] = updatedField.value;
			} else if (oldField.name != updatedField.name) {
				// existing field
				row[updatedField.name] = row[oldField.name];
				delete row[oldField.name];
			}
			if (!updatedField.text) {
				row[updatedField.name] = this.parseFieldValueToNumber(row, updatedField.name);
			}
		});
		return rows;
	}

	parseFieldValueToNumber(row: any, fieldName: string) {
		let parsedValue = parseFloat(row[fieldName]);
		return parsedValue ? parsedValue : 0;
	}

	getFiltered(headerFieldArray, headerFieldToDelete) {
		return headerFieldArray.filter((headerfield: any) => headerfield != headerFieldToDelete);
	}

	async deleteHeaderField(headerFieldToDelete: any) {
		this.clearUpdateMessages();
		this.data.headerFields = this.getFiltered(this.data.headerFields, headerFieldToDelete);
		this.data.rows = this.deleteFromRows(this.data.rows, headerFieldToDelete.name);
		let result;
		if (this.sheetId) result = await this.fs.updateSheet(this.workbookId, this.sheetId, this.data);
		else result = await this.fs.updateWorkbook(this.workbookId, this.data);
		if (result) this.activeModal.close();
		else this.updateFailure = true;
	}

	deleteFromRows(rows: Array<any>, fieldToDelete) {
		let newRows = [ ...rows ];
		newRows.forEach((row) => {
			delete row[fieldToDelete];
		});
		return newRows;
	}
}
