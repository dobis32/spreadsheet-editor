import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FirestoreService } from 'src/app/services/firestore.service';
import { Subscription } from 'rxjs';
@Component({
	selector: 'app-workbook-list',
	templateUrl: './workbook-list.component.html',
	styleUrls: [ './workbook-list.component.scss' ]
})
export class WorkbookListComponent implements OnInit {
	public workbooks: Array<any> = new Array<any>();
	public workbookForm: FormGroup;
	public signedInAuth: Subscription;
	constructor(public formBuilder: FormBuilder, public firestoreService: FirestoreService) {
		this.firestoreService.loggedIn.subscribe((user) => {
			if (user) {
				console.log('USER IS LOGGED IN');
				this.firestoreService.getWorkbookCollection().subscribe((workbooksData) => {
					this.workbooks = workbooksData;
					console.log('workbook sub', this.workbooks);
				});
			} else {
				console.log('USER IS NOT LOGGED IN');
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
			await this.firestoreService.removeWorkbook(id);
		} catch (error) {
			console.log(error);
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
