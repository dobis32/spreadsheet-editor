import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
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
	constructor(
		public formBuilder: FormBuilder,
		public firestoreService: FirestoreService,
		public route: ActivatedRoute,
		public router: Router
	) {
		this.workbooks = new Array<any>();
		this.signedInAuth = this.firestoreService.signedIn.subscribe((user) => {
			if (user) {
				this.firestoreService.getWorkbookCollection().subscribe((workbooksData) => {
					this.workbooks = workbooksData;
				});
			} else {
				this.router.navigate([ '/login' ]);
			}
		});
		this.workbookForm = this.formBuilder.group({ name: '' });
	}

	ngOnInit(): void {}

	async addWorkbook(fg: FormGroup) {
		try {
			if (!fg.value.name) throw new Error('Invalid workbook name');
			const workbook = { name: fg.value.name };
			let result = await this.firestoreService.addWorkbook(workbook);
			if (result) console.log('result of book add is truthy');
			fg.reset();
		} catch (error) {
			console.log(error);
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
