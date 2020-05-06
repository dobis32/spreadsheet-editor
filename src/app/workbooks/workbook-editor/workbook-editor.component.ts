import { Component, OnInit } from '@angular/core';
import { FirestoreService } from 'src/app/services/firestore.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';

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
		public route: ActivatedRoute
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

	addHeaderField() {
		// implement me
	}

	deleteHeaderField() {}

	editRow(row: any) {
		console.log('edit row:', row);
		row.field1 = 'foobar';
		console.log(row, this.currentWorkbook);
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
