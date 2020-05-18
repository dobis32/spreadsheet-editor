import { Component, OnInit, isDevMode } from '@angular/core';
import { FirestoreService } from 'src/app/services/firestore.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ExcelService } from 'src/app/services/excel.service';

@Component({
	selector: 'app-sheet-list',
	templateUrl: './sheet-list.component.html',
	styleUrls: [ './sheet-list.component.scss' ]
})
export class SheetListComponent implements OnInit {
	public sheets: Array<any>;
	public workbookId: string;
	public workbook: any;
	public signedInAuth: Subscription;
	public sheetForm: FormGroup;
	public exportForm: FormGroup;
	public invalidSheetForm: boolean;
	public paramSub: Subscription;
	public workbookSub: Subscription;
	public sheetSub: Subscription;
	public uid: string;
	public exportFailed: boolean;
	constructor(
		public firestoreService: FirestoreService,
		public activatedRoute: ActivatedRoute,
		public router: Router,
		public formBuilder: FormBuilder,
		public excelService: ExcelService
	) {
		this.sheetForm = this.formBuilder.group({
			name: new FormControl('', [ Validators.required ])
		});
		this.exportForm = this.formBuilder.group({
			fileName: new FormControl('', [ Validators.required, Validators.minLength(1) ])
		});
		this.sheets = new Array();
		this.paramSub = this.activatedRoute.params.subscribe((params) => {
			this.workbookId = params['workbookId'];
		});
		if (isDevMode()) {
			this.uid = 'test_uid';
			this.getSheetData(this.workbookId);
			this.getWorkbookData(this.workbookId);
		} else {
			this.signedInAuth = this.firestoreService.signedIn.subscribe((user) => {
				if (user) {
					this.uid = user.uid;
					this.getSheetData(this.workbookId);
					this.getWorkbookData(this.workbookId);
				} else {
					this.router.navigate([ 'login' ]);
				}
			});
		}
	}

	ngOnInit(): void {}

	ngOnDestory(): void {
		if (this.signedInAuth) this.signedInAuth.unsubscribe();
		if (this.paramSub) this.paramSub.unsubscribe();
		if (this.workbookSub) this.workbookSub.unsubscribe();
		if (this.sheetSub) this.sheetSub.unsubscribe();
	}

	exportWorkbook(fg: FormGroup) {
		try {
			this.exportFailed = false;

			if (!fg.valid) throw new Error('Invalid workbook name');
			else {
				let sheetNames = this.getSheetNames(this.sheets);
				let sheetData = [];
				this.sheets.forEach((sheet) => {
					sheetData.push(this.getRowsData(sheet));
				});
				this.excelService.exportAsExcelFile(sheetNames, sheetData, fg.value.fileName);
				fg.reset();
			}
		} catch (error) {
			console.log(error);
			this.exportFailed = true;
		}
	}

	getSheetNames(sheets: Array<any>) {
		let sheetNames = [];
		sheets.forEach((sheet) => {
			sheetNames.push(sheet.name);
		});
		return sheetNames;
	}

	getRowsData(sheet: any) {
		let sheetData = [];
		let headerFields = [];
		sheet.headerFields.forEach((field) => {
			headerFields.push(field.name);
		});
		sheetData.push(headerFields);
		sheet.rows.forEach((row) => {
			let rowData = [];
			sheet.headerFields.forEach((field) => {
				rowData.push(row[field.name]);
			});
			sheetData.push(rowData);
		});

		return sheetData;
	}

	getWorkbookData(workbookId: string) {
		if (workbookId)
			this.workbookSub = this.firestoreService.getWorkbookDocument(this.workbookId).subscribe((workbookData) => {
				this.workbook = workbookData;
				console.log('workbook', this.workbook);
			});
		else this.workbook = {};
	}

	getSheetData(workbookId: string) {
		if (workbookId)
			this.sheetSub = this.firestoreService.getSheetCollection(workbookId).subscribe((sheetData) => {
				if (sheetData) this.sheets = sheetData;
				else this.sheets = new Array();
			});
		else this.router.navigate([ '/workbooks/list' ]);
	}

	async addSheet(fg: FormGroup) {
		try {
			this.invalidSheetForm = false;
			if (!fg.valid) throw new Error('Invalid form');
			if (!this.workbook) throw new Error('Invalid workbook');
			let headerFields = this.workbook.headerFields;
			let rows = this.workbook.rows;
			let data = {
				uid: this.uid,
				name: fg.value.name,
				headerFields: Array.isArray(headerFields) ? headerFields : [],
				rows: Array.isArray(rows) ? rows : []
			};
			await this.firestoreService.addSheet(this.workbookId, data);
			return true;
		} catch (error) {
			console.log(error);
			this.invalidSheetForm = true;
		}
	}

	confirmDelete(workbookId: string, sheetId: string) {
		if (confirm('Are you sure you want to delete this sheet?')) {
			this.deleteSheet(workbookId, sheetId);
		}
	}

	async deleteSheet(workbookId: string, sheetId: string) {
		console.log(workbookId, sheetId);
		try {
			if (!workbookId || !sheetId) throw new Error('Invalid workbook ID or sheet ID');
			const result = await this.firestoreService.deleteSheet(workbookId, sheetId);
			if (!result) throw new Error('Could not remove sheet');
		} catch (error) {
			console.log(error);
		}
	}

	editSheet(workbookId: string, sheetId: string) {
		try {
			if (!workbookId || !sheetId) throw new Error('Invalid workbook ID or sheet ID');
			this.router.navigate([ 'workbooks', workbookId, 'sheets', sheetId, 'edit' ]);
		} catch (error) {
			console.log(error);
		}
	}

	viewSheet(workbookId: string, sheetId: string) {
		try {
			if (!workbookId || !sheetId) throw new Error('Invalid workbook ID or sheet ID');
			this.router.navigate([ 'workbooks', workbookId, 'sheets', sheetId, 'view' ]);
		} catch (error) {
			console.log(error);
		}
	}

	signOut() {
		// temporary
		let result = this.firestoreService.signOut();
		if (result) console.log('sign out successful');
		else console.log('sign out failed');
	}
}
