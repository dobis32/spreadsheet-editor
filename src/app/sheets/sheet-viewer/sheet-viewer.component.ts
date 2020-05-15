import { Component, OnInit, OnDestroy } from '@angular/core';
import { FirestoreService } from 'src/app/services/firestore.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-sheet-viewer',
	templateUrl: './sheet-viewer.component.html',
	styleUrls: [ './sheet-viewer.component.scss' ]
})
export class SheetViewerComponent implements OnInit, OnDestroy {
	public userAuth: Subscription;
	public sheetDataSub: Subscription;
	public paramSub: Subscription;
	public workbookId: string;
	public sheetId: string;
	public currentSheet: any;
	constructor(public fs: FirestoreService, public activatedRoute: ActivatedRoute, public router: Router) {
		this.currentSheet = { headerFields: [], rows: [] };
		this.paramSub = this.activatedRoute.params.subscribe((params) => {
			this.workbookId = params['workbookId'];
			this.sheetId = params['sheetId'];
		});
		this.userAuth = this.fs.signedIn.subscribe((user) => {
			if (user)
				this.sheetDataSub = this.fs.getSheetDocument(this.workbookId, this.sheetId).subscribe((sheetData) => {
					this.currentSheet = sheetData;
				});
			else this.router.navigate([ 'login' ]);
		});
	}

	ngOnInit(): void {}

	ngOnDestroy(): void {
		if (this.userAuth) this.userAuth.unsubscribe();
		if (this.sheetDataSub) this.sheetDataSub.unsubscribe();
		if (this.paramSub) this.paramSub.unsubscribe();
	}

	signOut() {
		// temporary
		let result = this.fs.signOut();
		if (result) console.log('sign out successful');
		else console.log('sign out failed');
	}
}
