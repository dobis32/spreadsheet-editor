import { Component, OnInit } from '@angular/core';
import { FirestoreService } from 'src/app/services/firestore.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EditHeaderFieldComponent } from '../../modals/edit-header-field/edit-header-field.component';
import { EditRowComponent } from '../../modals/edit-row/edit-row.component';

@Component({
	selector: 'app-workbook-editor',
	templateUrl: './workbook-editor.component.html',
	styleUrls: [ './workbook-editor.component.scss' ]
})
export class WorkbookEditorComponent implements OnInit {
	public currentWorkbook: any;
	public workbookId: string;
	public signInAuth: Subscription;
	public nameForm: FormGroup;
	public workbookName: Promise<string>;

	constructor(
		public formBuilder: FormBuilder,
		public firestoreService: FirestoreService,
		public route: ActivatedRoute,
		public modalService: NgbModal
	) {
		this.nameForm = this.formBuilder.group({ name: '' });
		this.signInAuth = this.firestoreService.signedIn.subscribe(async (user) => {
			if (user) {
				this.route.params.subscribe((params) => {
					this.workbookId = params['id'];
				});
				this.firestoreService.getWorkbookDocument(this.workbookId).subscribe((workbookDoc) => {
					this.currentWorkbook = <any>workbookDoc;
					this.workbookName = Promise.resolve(this.currentWorkbook.name);
					this.nameForm.setValue({ name: this.currentWorkbook.name });
				});
			} else {
				throw new Error('User is not logged in!');
			}
		});
	}

	ngOnInit(): void {}

	addRow() {}

	openEditFieldModal(headerField?: any) {
		let headerFieldToEdit = headerField ? headerField : { name: '', text: true, value: '' };
		const modalRef = this.modalService.open(EditHeaderFieldComponent);
		modalRef.componentInstance.fieldToEdit = headerFieldToEdit;
		modalRef.componentInstance.workbookId = this.workbookId;
		modalRef.componentInstance.workbook = this.currentWorkbook;
		modalRef.componentInstance.fs = this.firestoreService;
	}

	openEditRowModal(row?: any) {
		let rowToEdit = row ? row : this.getDefaultRow();
		const modalRef = this.modalService.open(EditRowComponent);
		modalRef.componentInstance.rowToEdit = rowToEdit;
		modalRef.componentInstance.workbookId = this.workbookId;
		modalRef.componentInstance.workbook = this.currentWorkbook;
		modalRef.componentInstance.fs = this.firestoreService;
	}

	getDefaultRow() {
		let row = {};
		this.currentWorkbook.defaults.headerFields.forEach((headerField) => {
			row[headerField.name] = headerField.text ? headerField.value : parseFloat(headerField.value);
		});
		return row;
	}

	updateWorkbookName(fg: FormGroup) {
		if (fg.value.name) {
			const data = { ...this.currentWorkbook };
			const id = data.id;
			delete data.id;
			data.name = fg.value.name;
			this.firestoreService.updateWorkbook(id, data);
		}
	}

	signIn() {
		// temporary
		let result = this.firestoreService.signIn('scott.qwet@gmail.com', 'vander123');
		if (result) console.log('sign in successful');
		else console.log('sign in failed');
	}

	signOut() {
		// temporary
		let result = this.firestoreService.signOut();
		if (result) console.log('sign out successful');
		else console.log('sign out failed');
	}
}
