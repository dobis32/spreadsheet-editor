import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
	providedIn: 'root'
})
export class FirestoreService {
	constructor(public firestore: AngularFirestore) {}

	getWorkbookCollection() {
		return this.firestore.collection('workbooks').valueChanges();
	}
}
