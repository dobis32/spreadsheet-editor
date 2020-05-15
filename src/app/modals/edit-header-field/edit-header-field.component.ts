import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
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
	@Input() data: any;
	@Input() fs: FirestoreService;
	public updateFailure: boolean;
	public updateSuccess: boolean;
	public headerFieldForm: FormGroup;
	public initialField: any;

	constructor(public activeModal: NgbActiveModal, public formBuilder: FormBuilder) {
		this.headerFieldForm = this.formBuilder.group({
			name: new FormControl('', [ Validators.required ]),
			text: false,
			value: new FormControl('', [ Validators.required ]),
			primary: false
		});
		this.updateFailure = false;
		this.updateSuccess = false;
		this.initialField = {};
	}

	ngOnInit(): void {
		this.headerFieldForm.setValue(this.fieldToEdit);
		this.initialField = { ...this.fieldToEdit };
	}

	async save(fg: FormGroup) {
		try {
			if (!fg.valid) throw new Error('Invalid data');
			this.clearUpdateMessages();
			this.fieldToEdit = this.setFieldToEditValues(this.fieldToEdit, fg.value);
			this.data.headerFields = this.updatePrimaryField(this.fieldToEdit, this.data.headerFields);
			if (this.isNewHeaderField(this.fieldToEdit, this.data.headerFields)) {
				this.data.headerFields.push(this.fieldToEdit);
			}
			this.data.rows = this.updateRows(this.fieldToEdit, this.data.rows, this.initialField);
			let result;
			if (this.sheetId) result = this.fs.updateSheet(this.workbookId, this.sheetId, this.data);
			else result = this.fs.updateWorkbook(this.workbookId, this.data);
			if (result) this.updateSuccess = true;
			else throw new Error('Update failed');
		} catch (error) {
			console.log(error);
			this.updateFailure = true;
		}
	}

	isNewHeaderField(incomingField: any, headerFields: Array<any>) {
		return !headerFields.some((field) => field == incomingField);
	}

	updatePrimaryField(updatedField: any, headerFields: Array<any>) {
		let updatedFields;
		if (updatedField.primary) {
			updatedFields = [];
			// if the updated field is primary, set all other fields to not be primary
			headerFields.forEach((headerField) => {
				if (headerField != updatedField) {
					headerField.primary = false;
				}
				updatedFields.push(headerField);
			});
		} else {
			if (updatedField != headerFields[0]) headerFields[0].primary = true;
			else headerFields[1].primary = true;
			updatedFields = [ ...headerFields ];
		}

		return updatedFields;
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
		let updatedRows = [];

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
			updatedRows.push(row);
		});
		return updatedRows;
	}

	parseFieldValueToNumber(row: any, fieldName: string) {
		let parsedValue = parseFloat(row[fieldName]);
		return parsedValue ? parsedValue : 0;
	}

	getFiltered(headerFieldArray: Array<any>, headerFieldToDelete: any) {
		return headerFieldArray.filter((headerfield: any) => headerfield != headerFieldToDelete);
	}

	async deleteHeaderField(headerFieldToDelete: any) {
		this.clearUpdateMessages();
		if (this.data.headerFields.length - 1) this.data.headerFields[1].primary = true;
		this.data.headerFields = this.getFiltered(this.data.headerFields, headerFieldToDelete);
		this.data.rows = this.deleteFromRows(this.data.rows, headerFieldToDelete.name);
		let result;
		if (this.sheetId) result = await this.fs.updateSheet(this.workbookId, this.sheetId, this.data);
		else result = await this.fs.updateWorkbook(this.workbookId, this.data);
		if (result) {
			this.activeModal.close();
		} else this.updateFailure = true;
	}

	deleteFromRows(rows: Array<any>, fieldToDelete) {
		let newRows = [ ...rows ];
		newRows.forEach((row) => {
			delete row[fieldToDelete];
		});
		return newRows;
	}
}
