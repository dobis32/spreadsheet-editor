import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable, of } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class FirestoreService {
	public signedIn: Observable<any>;
	public uid: string;
	constructor(public firestore: AngularFirestore, public afAuth: AngularFireAuth) {
		this.signedIn = new Observable((subscriber) => {
			this.afAuth.onAuthStateChanged(subscriber);
		});
	}

	getWorkbookCollection() {
		return this.firestore.collection(`workbooks`).valueChanges({ idField: 'id' });
	}

	getSheetCollection(id: string) {
		try {
			if (!id) throw new Error('Invalid workbook ID');
			return this.firestore.collection(`workbooks/${id}/sheets`).valueChanges({ idField: 'id' });
		} catch (error) {
			console.log(error);
			return <Observable<any>>of(false);
		}
	}

	async addWorkbook(data: any) {
		let workbook = { ...data };
		try {
			if (!workbook) throw new Error('Invalid workbook data provided');
			if (!this.uid) throw new Error('No user logged in.');
			workbook.uid = this.uid;
			await this.firestore.collection('workbooks').add(workbook);
			return true;
		} catch (error) {
			console.log(error);
			return false;
		}
	}

	async removeWorkbook(id: string) {
		try {
			if (!id) throw new Error('Invalid workbook ID');
			await this.firestore.collection('workbooks').doc(id).delete();
			return true;
		} catch (error) {
			console.log(error);
			return false;
		}
	}

	async updateWorkbook(id: string, data: any) {
		try {
			if (!id || !data) throw new Error('Invalid ID or data');
			await this.firestore.collection('workbooks').doc(id).update(data);
			return true;
		} catch (error) {
			console.log(error);
			return false;
		}
	}

	async updateSheet(bookId: string, sheetId: string, data: any) {
		try {
			if (!bookId || !sheetId || !data) throw new Error('Invalid ID or data');
			await this.firestore.collection(`/workbooks/${bookId}/sheets`).doc(sheetId).update(data);
			return true;
		} catch (error) {
			console.log(error);
			return false;
		}
	}

	getWorkbookDocument(id: string) {
		try {
			if (!id) throw new Error('Invalid workbook ID');
			return this.firestore.collection('workbooks').doc(id).valueChanges();
		} catch (error) {
			console.log(error);
			return of(false);
		}
	}

	getSheetDocument(workbookId: string, sheetId: string) {
		try {
			if (!workbookId || !sheetId) throw new Error('Invalid workbook ID or sheet ID');
			return this.firestore.collection(`workbooks/${workbookId}/sheets`).doc(sheetId).valueChanges();
		} catch (error) {
			console.log(error);
			return of(false);
		}
	}

	async signIn(email: string, password: string) {
		// temporary
		try {
			if (!email || !password) throw new Error('Invalid email and/or password');
			await this.afAuth.signInWithEmailAndPassword(email, password);
			return true;
		} catch (error) {
			console.log('Sign in failed', error);
			return false;
		}
	}

	async signOut() {
		// temporary
		try {
			await this.afAuth.signOut();
			return true;
		} catch (error) {
			console.log('Sign out failed', error);
			return false;
		}
	}

	async addSheet(workbookId: string, sheetData: any) {
		try {
			if (!workbookId || !sheetData) throw new Error('Invalid workbook ID or sheet data');
			await this.firestore.collection(`/workbooks/${workbookId}/sheets`).add(sheetData);
			return true;
		} catch (error) {
			console.log(error);
			return false;
		}
	}

	async removeSheet(workbookId: string, sheetId: string) {
		try {
			if (!workbookId || !sheetId) throw new Error('Invalid workbook ID or sheet ID');
			await this.firestore.collection(`/workbooks/${workbookId}/sheets`).doc(sheetId).delete();
			return true;
		} catch (error) {
			console.log(error);
			return false;
		}
	}
}
