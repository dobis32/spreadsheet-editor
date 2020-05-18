import { Component, OnInit, isDevMode } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { FirestoreService } from 'src/app/services/firestore.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { ExcelService } from 'src/app/services/excel.service';

@Component({
	selector: 'app-workbook-list',
	templateUrl: './workbook-list.component.html',
	styleUrls: [ './workbook-list.component.scss' ]
})
export class WorkbookListComponent implements OnInit {
	public workbooks: Array<any>;
	public workbookForm: FormGroup;
	public signedInAuth: Subscription;
	public addWorkbookFailure: boolean;
	public importWorkbookFailure: boolean;
	public importNotReady: boolean;
	public workbookSub: Subscription;
	public uid: string;
	public importData: any;
	constructor(
		public formBuilder: FormBuilder,
		public firestoreService: FirestoreService,
		public route: ActivatedRoute,
		public router: Router,
		public excelService: ExcelService
	) {
		this.workbooks = new Array<any>();
		this.addWorkbookFailure = false;
		this.importWorkbookFailure = false;
		this.importNotReady = true;
		this.workbookForm = this.formBuilder.group({ name: new FormControl('', [ Validators.required ]) });
		if (isDevMode()) {
			this.uid = 'test_uid';
			this.workbookSub = this.firestoreService.getWorkbookCollection().subscribe((workbooksData) => {
				this.workbooks = workbooksData;
			});
		} else {
			this.signedInAuth = this.firestoreService.signedIn.subscribe((user) => {
				if (user) {
					this.uid = user.uid;
					this.workbookSub = this.firestoreService.getWorkbookCollection().subscribe((workbooksData) => {
						this.workbooks = workbooksData;
					});
				} else {
					this.router.navigate([ '/login' ]);
				}
			});
		}
	}

	ngOnInit(): void {}

	ngOnDestroy(): void {
		if (this.signedInAuth) this.signedInAuth.unsubscribe();
		if (this.workbookSub) this.workbookSub.unsubscribe();
	}

	async importChange(event: any) {
		try {
			this.importData = undefined;
			this.importNotReady = true;
			this.importWorkbookFailure = false;
			const importFile = await this.excelService.importExcelFile(event);
			if (importFile.result) {
				this.importNotReady = false;
				this.importData = importFile.data;
			} else throw new Error('Import failed.');
		} catch (error) {
			console.log(error);
			this.importWorkbookFailure = true;
		}
	}

	async importDataToFirestore() {
		try {
			if (!this.importData) throw new Error('No data to import');
			console.log(this.importData);
			const { workbookDoc, sheetDocs } = <any>this.excelService.formatData(this.importData, this.uid);
			console.log(workbookDoc, sheetDocs);
			const workbookId = await this.firestoreService.addWorkbook(workbookDoc);
			if (!workbookId) throw new Error('Failed to upload workbook to Firestore');
			sheetDocs.forEach((sheet) => {
				this.firestoreService.addSheet(workbookId, sheet).catch((error) => {
					console.log(`Failed to add sheet ${sheet.name} to Firestore`, error);
				});
			});
		} catch (error) {
			console.log(error);
			this.importWorkbookFailure = true;
		}
	}

	async addWorkbook(fg: FormGroup) {
		try {
			this.addWorkbookFailure = false;
			if (!fg.value.name) throw new Error('Invalid workbook name');
			const workbook = { name: fg.value.name, uid: this.uid, headerFields: [], rows: [] };
			let result = await this.firestoreService.addWorkbook(workbook);
			if (!result) throw new Error('Failed to add workbook');
			fg.reset();
		} catch (error) {
			console.log(error);
			this.addWorkbookFailure = true;
		}
	}

	confirmDelete(id: string) {
		if (confirm('Are you sure you want to delete this workbook?')) {
			this.deleteWorkbook(id);
		}
	}

	async deleteWorkbook(id: string) {
		try {
			if (!id) throw new Error('Invalid ID');
			const result = await this.firestoreService.deleteWorkbook(id);
			if (!result) throw new Error('Failed to remove workbook');
		} catch (error) {
			console.log(error);
		}
	}

	editWorkbook(id: string) {
		if (id) this.router.navigate([ 'workbooks', id, 'edit' ]);
		else console.log('[ROUTER ERROR] Invalid ID parameter');
	}

	viewWorkbook(id: string) {
		if (id) this.router.navigate([ 'workbooks', id, 'sheets', 'list' ]);
		else console.log('[ROUTER ERROR] Invalid ID parameter');
	}

	signOut() {
		// temporary
		let result = this.firestoreService.signOut();
		if (result) console.log('sign out successful');
		else console.log('sign out failed');
	}
}
