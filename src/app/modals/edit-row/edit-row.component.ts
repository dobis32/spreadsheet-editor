import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FirestoreService } from 'src/app/services/firestore.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'app-edit-row',
	templateUrl: './edit-row.component.html',
	styleUrls: [ './edit-row.component.scss' ]
})
export class EditRowComponent implements OnInit {
	@Input() rowToEdit: any;
	@Input() workbookId: string;
	@Input() sheetId: string;
	@Input() data: any;
	@Input() fs: FirestoreService;
	public rowForm: FormGroup;
	public rowKeys: Array<any>;
	public updateFailure: boolean;
	constructor(public activeModal: NgbActiveModal, public formBuilder: FormBuilder) {
		this.rowForm = this.formBuilder.group({});
		this.rowKeys = new Array();
		this.updateFailure = false;
	}

	ngOnInit(): void {
		this.rowKeys = Object.keys(this.rowToEdit);
		this.rowForm = this.formBuilder.group(this.rowToEdit);
	}

	save(fg: FormGroup) {
		this.updateFailure = false;
		this.rowToEdit = this.setRowToEditValues(this.rowToEdit, fg.value);
		if (!this.data.rows.some((row) => row == this.rowToEdit)) {
			this.data.rows.push(this.rowToEdit);
		}
		let result;
		if (this.sheetId) result = this.fs.updateSheet(this.workbookId, this.sheetId, this.data);
		else result = this.fs.updateWorkbook(this.workbookId, this.data);
		if (result) this.activeModal.close();
		else this.updateFailure = true;
	}

	setRowToEditValues(rowToEdit: any, editedValues: any) {
		for (let [ key, value ] of Object.entries(editedValues)) {
			if (key == 'value' && editedValues.text == false) {
				try {
					rowToEdit[key] = parseFloat(<any>value);
				} catch (error) {
					console.log(error);
					rowToEdit[key] = 0;
				}
			} else rowToEdit[key] = value;
		}
		return rowToEdit;
	}

	clearUpdateMessages() {
		this.updateFailure = false;
	}

	confirmDelete(rowToDelete: any) {
		if (confirm('Are you should you want to do delete this row?')) {
			this.deleteRow(rowToDelete);
		}
	}

	async deleteRow(rowToDelete: any) {
		this.clearUpdateMessages();
		this.data.rows = this.getFiltered(this.data.rows, rowToDelete);
		let result;
		if (this.sheetId) result = await this.fs.updateSheet(this.workbookId, this.sheetId, this.data);
		else result = await this.fs.updateWorkbook(this.workbookId, this.data);
		if (result) this.activeModal.close();
		else this.updateFailure = true;
	}

	getFiltered(rowsArray, rowToDelete) {
		return rowsArray.filter((row: any) => row != rowToDelete);
	}
}
