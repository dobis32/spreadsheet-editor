import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class FirestoreService {
	public loggedIn: Observable<any>;
	public uid: string;
	constructor(public firestore: AngularFirestore, public afAuth: AngularFireAuth) {
		this.loggedIn = new Observable((subscriber) => {
			this.afAuth.onAuthStateChanged((user) => {
				console.log(user.uid);
				this.uid = user.uid;
				if (user) subscriber.next(user.uid);
				else {
					this.uid = undefined;
					subscriber.next(false);
					subscriber.complete();
				}
			});
		});
	}

	getWorkbookCollection() {
		return this.firestore.collection(`workbooks`).valueChanges({ idField: 'id' });
	}

	async addWorkbook(data: any) {
		let workbook = { ...data };
		try {
			if (!workbook) throw new Error('Invalid workbook data provided');
			if (!this.uid) throw new Error('No user logged in.');
			workbook.uid = this.uid;
			return await this.firestore.collection('workbooks').add(workbook);
		} catch (error) {
			console.log(error);
			return false;
		}
	}

	async removeWorkbook(id: string) {
		try {
			if (!id) throw new Error('Invalid ID provided');
			await this.firestore.collection('workbooks').doc(id).delete();
			return true;
		} catch (error) {
			console.log(error);
			return false;
		}
	}

	async signIn(email: string, password: string) {
		// temporary
		try {
			console.log('signing in');
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
			console.log('signing out');
			await this.afAuth.signOut();
			return true;
		} catch (error) {
			console.log('Sign out failed', error);
			return false;
		}
	}
}
