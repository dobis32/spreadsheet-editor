import { Component, OnInit, isDevMode } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { FirestoreService } from 'src/app/services/firestore.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

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
	public workbookSub: Subscription;
	public uid: string;
	constructor(
		public formBuilder: FormBuilder,
		public firestoreService: FirestoreService,
		public route: ActivatedRoute,
		public router: Router
	) {
		this.workbooks = new Array<any>();
		this.addWorkbookFailure = false;
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

	async removeWorkbook(id: string) {
		try {
			if (!id) throw new Error('Invalid ID');
			const result = await this.firestoreService.removeWorkbook(id);
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
