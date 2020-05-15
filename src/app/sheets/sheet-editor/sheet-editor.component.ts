import { Component, OnInit, isDevMode } from '@angular/core';
import { Subscription } from 'rxjs';
import { FirestoreService } from 'src/app/services/firestore.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EditHeaderFieldComponent } from '../../modals/edit-header-field/edit-header-field.component';
import { EditRowComponent } from '../../modals/edit-row/edit-row.component';

@Component({
	selector: 'app-sheet-editor',
	templateUrl: './sheet-editor.component.html',
	styleUrls: [ './sheet-editor.component.scss' ]
})
export class SheetEditorComponent implements OnInit {
	public signedInAuth: Subscription;
	public nameForm: FormGroup;
	public invalidNameForm: boolean;
	public currentSheet: any;
	public sheetId: string;
	public workbookId: string;
	public signInAuth: Subscription;
	public nameUpdateSuccess: boolean;
	public nameUpdateFailure: boolean;
	public paramSub: Subscription;
	public sheetDocSub: Subscription;
	public sort = function(a: string, b: string, isAsc: boolean) {
		return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
	};

	constructor(
		public firestoreService: FirestoreService,
		public activatedRoute: ActivatedRoute,
		public router: Router,
		public formBuilder: FormBuilder,
		public modalService: NgbModal
	) {
		this.invalidNameForm = false;
		this.nameUpdateFailure = false;
		this.nameUpdateSuccess = false;
		this.nameForm = this.formBuilder.group({ name: new FormControl('', Validators.required) });
		if (isDevMode()) this.initData();
		else {
			this.signInAuth = this.firestoreService.signedIn.subscribe(async (user) => {
				if (user) {
					this.initData();
				} else {
					this.router.navigate([ '/login' ]);
				}
			});
		}
	}

	ngOnInit(): void {}

	ngOnDestroy(): void {
		if (this.paramSub) this.paramSub.unsubscribe();
		if (this.sheetDocSub) this.sheetDocSub.unsubscribe();
		if (this.signInAuth) this.signInAuth.unsubscribe();
	}

	sortHeaderFields(headerFields: Array<any>) {
		let sortedFields = [];
		let fieldsToSort = [];
		headerFields.forEach((field) => {
			if (field.primary) sortedFields.push(field);
			else fieldsToSort.push(field);
		});
		fieldsToSort = fieldsToSort.sort((a, b) => {
			return this.sort(a.name, b.name, true);
		});
		sortedFields = [ ...sortedFields, ...fieldsToSort ];
		return sortedFields;
	}

	initData() {
		this.paramSub = this.activatedRoute.params.subscribe((params) => {
			this.sheetId = params['sheetId'];
			this.workbookId = params['workbookId'];
		});
		this.sheetDocSub = this.firestoreService
			.getSheetDocument(this.workbookId, this.sheetId)
			.subscribe((sheetData: any) => {
				this.currentSheet = sheetData;
				this.currentSheet.headerFields = this.sortHeaderFields(this.currentSheet.headerFields);
				this.nameForm.setValue({ name: sheetData.name });
			});
	}

	clearUpdateMessages() {
		this.invalidNameForm = false;
		this.nameUpdateFailure = false;
		this.nameUpdateSuccess = false;
	}

	async updateSheetName(fg: FormGroup) {
		try {
			this.clearUpdateMessages();
			if (!fg.valid) throw new Error('Form not valid');
			this.invalidNameForm = false;
			this.currentSheet.name = fg.value.name;
			const result = this.firestoreService.updateSheet(this.workbookId, this.sheetId, this.currentSheet);
			if (result) this.nameUpdateSuccess = true;
			else throw new Error('Failed to update sheet');
		} catch (error) {
			console.log(error);
			this.invalidNameForm = true;
		}
	}

	openEditFieldModal(headerField?: any) {
		let headerFieldToEdit = headerField ? headerField : { name: '', text: true, value: '', primary: false };
		const modalRef = this.modalService.open(EditHeaderFieldComponent);
		modalRef.componentInstance.fieldToEdit = headerFieldToEdit;
		modalRef.componentInstance.workbookId = this.workbookId;
		modalRef.componentInstance.sheetId = this.sheetId;
		modalRef.componentInstance.data = this.currentSheet;
		modalRef.componentInstance.fs = this.firestoreService;
	}

	openEditRowModal(row?: any) {
		if (!row) {
			row = this.getRow(this.currentSheet.headerFields);
		}
		const modalRef = this.modalService.open(EditRowComponent);
		modalRef.componentInstance.rowToEdit = row;
		modalRef.componentInstance.workbookId = this.workbookId;
		modalRef.componentInstance.sheetId = this.sheetId;
		modalRef.componentInstance.data = this.currentSheet;
		modalRef.componentInstance.fs = this.firestoreService;
	}

	getRow(headerFields: Array<any>) {
		let row = {};
		headerFields.forEach((headerField: any) => {
			row[headerField.name] = headerField.value;
			if (!headerField.text) row[headerField.name] = parseFloat(row[headerField.name]);
		});
		return row;
	}
}
