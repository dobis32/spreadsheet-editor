import { TestBed } from '@angular/core/testing';
import { AngularFirestore } from '@angular/fire/firestore';
import { FirestoreService } from './firestore.service';
import { of } from 'rxjs';
import { mockWorkbookData } from '../../assets/mockData';
class MockAngularFirestore {
	collection(name: string) {
		return {
			valueChanges: () => {
				let collection: Array<any> = [];
				switch (name) {
					case 'workbooks':
						collection = mockWorkbookData;
						break;
				}
				return of(collection);
			}
		};
	}
}

describe('FirestoreService', () => {
	let service: FirestoreService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [ FirestoreService, { provide: AngularFirestore, useClass: MockAngularFirestore } ]
		});
		service = TestBed.inject(FirestoreService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should have Angular Firestore injected into it', () => {
		expect(TestBed.get(AngularFirestore)).toBeTruthy();
		expect(service.firestore).toBeTruthy();
	});

	it('should have a function to get the workbooks collection from the firestore firebase', () => {
		let afs = TestBed.get(AngularFirestore);
		let afsSpy = spyOn(afs, 'collection').and.callFake(() => {
			return {
				valueChanges: () => {}
			};
		});
		service.getWorkbookCollection();
		expect(afsSpy).toHaveBeenCalled();
		expect(afsSpy).toHaveBeenCalledWith('workbooks');
	});
});
