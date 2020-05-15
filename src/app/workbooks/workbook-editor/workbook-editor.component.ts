import { Component, OnInit, isDevMode } from '@angular/core';
import { FirestoreService } from 'src/app/services/firestore.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EditHeaderFieldComponent } from '../../modals/edit-header-field/edit-header-field.component';
import { EditRowComponent } from '../../modals/edit-row/edit-row.component';
import { Router } from '@angular/router';

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
	public invalidNameForm: boolean;
	public nameUpdateFailure: boolean;
	public nameUpdateSuccess: boolean;
	public workbookSub: Subscription;
	public paramSub: Subscription;
	public sort = function(a: string, b: string, isAsc: boolean) {
		return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
	};

	constructor(
		public formBuilder: FormBuilder,
		public firestoreService: FirestoreService,
		public activatedRoute: ActivatedRoute,
		public router: Router,
		public modalService: NgbModal
	) {
		this.invalidNameForm = false;
		this.nameUpdateFailure = false;
		this.nameUpdateSuccess = false;
		this.nameForm = this.formBuilder.group({
			name: new FormControl('', [ Validators.required, Validators.minLength(1) ])
		});
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
		if (this.signInAuth) this.signInAuth.unsubscribe();
		if (this.workbookSub) this.workbookSub.unsubscribe();
		if (this.paramSub) this.paramSub.unsubscribe();
	}

	initData() {
		this.paramSub = this.activatedRoute.params.subscribe((params) => {
			this.workbookId = params['id'];
		});
		this.workbookSub = this.firestoreService.getWorkbookDocument(this.workbookId).subscribe((workbookDoc: any) => {
			this.currentWorkbook = workbookDoc;
			this.currentWorkbook.headerFields = this.sortHeaderFields(this.currentWorkbook.headerFields);
			this.nameForm.setValue({ name: this.currentWorkbook.name });
			console.log(this.currentWorkbook);
		});
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

	clearUpdateMessages() {
		this.invalidNameForm = false;
		this.nameUpdateFailure = false;
		this.nameUpdateSuccess = false;
	}

	openEditFieldModal(headerField?: any) {
		let headerFieldToEdit = headerField ? headerField : { name: '', text: true, value: '', primary: true };
		if (!headerField && this.currentWorkbook.headerFields.length) headerFieldToEdit.primary = false;
		const modalRef = this.modalService.open(EditHeaderFieldComponent);
		modalRef.componentInstance.fieldToEdit = headerFieldToEdit;
		modalRef.componentInstance.workbookId = this.workbookId;
		modalRef.componentInstance.data = this.currentWorkbook;
		modalRef.componentInstance.fs = this.firestoreService;
	}

	openEditRowModal(row?: any) {
		let rowToEdit = row ? row : this.getDefaultRow();
		const modalRef = this.modalService.open(EditRowComponent);
		modalRef.componentInstance.rowToEdit = rowToEdit;
		modalRef.componentInstance.workbookId = this.workbookId;
		modalRef.componentInstance.data = this.currentWorkbook;
		modalRef.componentInstance.fs = this.firestoreService;
	}

	getDefaultRow() {
		let row = {};
		this.currentWorkbook.headerFields.forEach((headerField) => {
			row[headerField.name] = headerField.text ? headerField.value : parseFloat(headerField.value);
		});
		return row;
	}

	async updateWorkbookName(fg: FormGroup) {
		try {
			this.clearUpdateMessages();
			if (!fg.valid) throw new Error('Invlaid workbook name');
			const data = { ...this.currentWorkbook };
			const id = this.workbookId;
			data.name = fg.value.name;
			const result = await this.firestoreService.updateWorkbook(id, data);
			if (result) this.nameUpdateSuccess = true;
			else this.nameUpdateFailure = true;
		} catch (error) {
			console.log(error);
			this.invalidNameForm = true;
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
