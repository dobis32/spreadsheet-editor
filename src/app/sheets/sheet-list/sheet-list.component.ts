import { Component, OnInit } from '@angular/core';
import { FirestoreService } from 'src/app/services/firestore.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';

@Component({
	selector: 'app-sheet-list',
	templateUrl: './sheet-list.component.html',
	styleUrls: [ './sheet-list.component.scss' ]
})
export class SheetListComponent implements OnInit {
	public sheets: Array<any>;
	public workbookId: string;
	public workbook: any;
	public sheetDataSub: Subscription;
	public signedInAuth: Subscription;
	public sheetForm: FormGroup;
	public invalidSheetForm: boolean;

	constructor(
		public firestoreService: FirestoreService,
		public activatedRoute: ActivatedRoute,
		public router: Router,
		public formBuilder: FormBuilder
	) {
		this.sheetForm = this.formBuilder.group({
			name: new FormControl('', [ Validators.required ])
		});
		this.sheets = new Array();
		this.activatedRoute.params.subscribe((params) => {
			this.workbookId = params['workbookId'];
		});
		this.signedInAuth = this.firestoreService.signedIn.subscribe((user) => {
			if (user) {
				this.getSheetData(this.workbookId);
				this.getWorkbookData(this.workbookId);
			} else {
				this.router.navigate([ '/login' ]);
			}
		});
	}

	ngOnInit(): void {}

	getWorkbookData(workbookId: string) {
		if (workbookId)
			this.firestoreService.getWorkbookDocument(this.workbookId).subscribe((workbookData) => {
				this.workbook = workbookData;
				console.log('workbook', this.workbook);
			});
		else this.workbook = {};
	}

	getSheetData(workbookId: string) {
		if (workbookId)
			this.firestoreService.getSheetCollection(workbookId).subscribe((sheetData) => {
				if (sheetData) this.sheets = sheetData;
				else this.sheets = new Array();
			});
		else this.router.navigate([ '/workbooks/list' ]);
	}

	async addSheet(fg: FormGroup) {
		try {
			this.invalidSheetForm = false;
			if (!fg.valid) throw new Error('Invalid form');
			let data = {
				name: fg.value.name,
				headerFields: this.workbook.defaults.headerFields,
				rows: this.workbook.defaults.rows
			};
			await this.firestoreService.addSheet(this.workbookId, data);
			return true;
		} catch (error) {
			console.log(error);
			this.invalidSheetForm = true;
		}
	}

	signOut() {
		// temporary
		let result = this.firestoreService.signOut();
		if (result) console.log('sign out successful');
		else console.log('sign out failed');
	}
}
