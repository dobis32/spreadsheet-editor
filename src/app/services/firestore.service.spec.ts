import { TestBed } from '@angular/core/testing';
import { AngularFirestore } from '@angular/fire/firestore';
import { FirestoreService } from './firestore.service';
import { of } from 'rxjs';
import { mockWorkbookCollection } from '../mocks/mockData';
import { AngularFireAuth, AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireModule } from '@angular/fire';
import { environment } from 'src/environments/environment';

class MockAngularFirestoreService {
	collection(name: string) {
		return {
			valueChanges: () => {
				let collection: Array<any> = [];
				switch (name) {
					case 'workbooks':
						collection = mockWorkbookCollection;
						break;
				}
				return of(collection);
			},
			doc: (id) => {
				return {
					delete: this.delete,
					valueChanges: this.valueChanges,
					update: this.update
				};
			},
			add: this.add
		};
	}

	delete() {
		return Promise.resolve();
	}

	add() {
		return Promise.resolve();
	}
	valueChanges() {
		return of({ id: 'id', uid: 'uid', name: 'name' });
	}
	update() {
		return Promise.resolve();
	}
}

class MockFireAuthService {
	public currentUser: Promise<any>;
	constructor() {
		this.currentUser = new Promise((resolve, reject) => {
			resolve({ uid: 'uid' });
		});
	}

	signInWithEmailAndPassword() {
		return new Promise((resolve, reject) => {
			resolve(true);
		});
	}
	signOut() {
		return new Promise((resolve, reject) => {
			resolve(true);
		});
	}
}

describe('FirestoreService', () => {
	let service: FirestoreService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [ AngularFireModule.initializeApp(environment.firebase), AngularFireAuthModule ],
			providers: [
				FirestoreService,
				{ provide: AngularFirestore, useClass: MockAngularFirestoreService },
				{ provide: AngularFireAuth, userClass: MockFireAuthService }
			]
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

	it('should have a function to get the workbooks collection from the firestore database', () => {
		let afs = TestBed.get(AngularFirestore);
		let afsSpy = spyOn(afs, 'collection').and.callFake(() => {
			return {
				valueChanges: () => {}
			};
		});
		service.getWorkbookCollection();
		expect(service.getWorkbookCollection).toBeTruthy();
		expect(typeof service.getWorkbookCollection).toEqual('function');
		expect(afsSpy).toHaveBeenCalled();
		expect(afsSpy).toHaveBeenCalledWith('test_data/test/workbooks');
	});

	it('should have a function to add a workbook the workbooks collection of the firestore database', () => {
		let afs = TestBed.get(AngularFirestore);
		let afsSpy = spyOn(afs, 'collection').and.callFake(() => {
			return {
				valueChanges: () => {}
			};
		});
		service.getWorkbookCollection();
		expect(service.getWorkbookCollection).toBeTruthy();
		expect(typeof service.getWorkbookCollection).toEqual('function');
		expect(afsSpy).toHaveBeenCalled();
		expect(afsSpy).toHaveBeenCalledWith('test_data/test/workbooks');
	});
	it('should have AngularFireAuth injected into it', () => {
		expect(service.afAuth).toBeTruthy();
		expect(TestBed.get(AngularFireAuth)).toBeTruthy();
	});

	it('should have a sign-in function that calls the signInWithEmailAndPassword AngularFireAuth function', async () => {
		let afa = TestBed.get(AngularFireAuth);
		let afaSpy = spyOn(afa, 'signInWithEmailAndPassword').and.callFake(() => {});
		expect(afaSpy).toHaveBeenCalledTimes(0);
		await service.signIn('some@email.com', 'really_strong_password');
		expect(afaSpy).toHaveBeenCalledTimes(1);
	});

	it('should have a sign-in function that returns true when called with truthy strings args', async () => {
		let truthyEmail = 'some@email.com';
		let truthyPassword = 'really_strong_password';
		let afa = TestBed.get(AngularFireAuth);
		let afaSpy = spyOn(afa, 'signInWithEmailAndPassword').and.callFake(() => {});
		expect(truthyEmail && truthyPassword).toBeTruthy();
		expect(afaSpy).toHaveBeenCalledTimes(0);
		expect(await service.signIn(truthyEmail, truthyPassword)).toBeTrue();
	});

	it('should have a sign-in function that returns false when called with falsy strings args', async () => {
		let truthyEmail = 'some@email.com';
		let truthyPassword = 'really_strong_password';
		let falsyEmail = '';
		let falsyPassword = '';
		let afa = TestBed.get(AngularFireAuth);
		let afaSpy = spyOn(afa, 'signInWithEmailAndPassword').and.callFake(() => {});
		expect(truthyEmail && truthyPassword).toBeTruthy();
		expect(falsyEmail || falsyPassword).toBeFalsy();
		expect(afaSpy).toHaveBeenCalledTimes(0);
		expect(await service.signIn(truthyEmail, falsyPassword)).toBeFalse();
		expect(await service.signIn(falsyEmail, truthyPassword)).toBeFalse();
		expect(await service.signIn(falsyEmail, falsyPassword)).toBeFalse();
	});

	it('should have a sign-out function that calls the sign-out AngularFireAuth function', async () => {
		let afa = TestBed.get(AngularFireAuth);
		let afaSpy = spyOn(afa, 'signOut').and.callFake(() => {});
		expect(afaSpy).toHaveBeenCalledTimes(0);
		await service.signOut();
		expect(afaSpy).toHaveBeenCalledTimes(1);
	});

	it('should have a  sign-out function that returns true when the promise, returned from the sign-out AngularFireAuth function, resolves', async () => {
		let afa = TestBed.get(AngularFireAuth);
		let afaSpy = spyOn(afa, 'signOut').and.callFake(() => {});
		expect();
		expect(afaSpy).toHaveBeenCalledTimes(0);
		expect(await service.signOut()).toBeTrue();
		expect(afaSpy).toHaveBeenCalledTimes(1);
	});

	it('should have a sign-out function that returns true when the sign-out AngularFireAuth function returns a rejecting promise', async () => {
		let afa = TestBed.get(AngularFireAuth);
		let afaSpy = spyOn(afa, 'signOut').and.callFake(() => {
			return Promise.reject();
		});
		expect(afaSpy).toHaveBeenCalledTimes(0);
		expect(await service.signOut()).toBeFalse();
		expect(afaSpy).toHaveBeenCalledTimes(1);
	});

	it('should have a function for adding a new workbook that calls the appropriate AngularFirestore function when a truthy arg is passed', async () => {
		let afs = TestBed.get(AngularFirestore);
		let afsSpy = spyOn(afs, 'add').and.callThrough();
		let truthyWorkbookData = mockWorkbookCollection[0];
		expect(truthyWorkbookData).toBeTruthy();
		expect(afsSpy).toHaveBeenCalledTimes(0);
		await service.addWorkbook(truthyWorkbookData);
		expect(afsSpy).toHaveBeenCalledTimes(1);
	});

	it('should have a function for adding a new workbook that does not call the appropriate AngularFirestore function when a falsy arg is passed', async () => {
		let afs = TestBed.get(AngularFirestore);
		let afsSpy = spyOn(afs, 'add').and.callThrough();
		let falsyWorkbookData = undefined;
		expect(falsyWorkbookData).toBeFalsy();
		expect(afsSpy).toHaveBeenCalledTimes(0);
		await service.addWorkbook(falsyWorkbookData);
		expect(afsSpy).toHaveBeenCalledTimes(0);
	});

	it('should have a function for removing a workbook that calls the appropriate AngularFirestore function when a truthy string arg is passed', () => {
		let afs = TestBed.get(AngularFirestore);
		let afsSpy = spyOn(afs, 'delete').and.callThrough();
		let truthyID = 'someID';
		expect(truthyID).toBeTruthy();
		expect(afsSpy).toHaveBeenCalledTimes(0);
		service.removeWorkbook(truthyID);
		expect(afsSpy).toHaveBeenCalledTimes(1);
	});

	it('should have a function for removing a workbook that does not call the appropriate AngularFirestore function when a falsy string arg is passed', () => {
		let afs = TestBed.get(AngularFirestore);
		let afsSpy = spyOn(afs, 'delete').and.callThrough();
		let falsyID = '';
		expect(falsyID).toBeFalsy();
		expect(afsSpy).toHaveBeenCalledTimes(0);
		service.removeWorkbook(falsyID);
		expect(afsSpy).toHaveBeenCalledTimes(0);
	});

	it('should have a function for retrieving a workbook document that calls the appropriate AngularFirestore function when a truthy string arg is passed', () => {
		let afs = TestBed.get(AngularFirestore);
		let afsSpy = spyOn(afs, 'valueChanges').and.callThrough();
		expect(service.getWorkbookDocument).toBeTruthy();
		expect(typeof service.getWorkbookDocument).toEqual('function');
		service.getWorkbookDocument('id');
		expect(afsSpy).toHaveBeenCalledTimes(1);
	});

	it('should have a function for retrieving a workbook document that does not call the appropriate AngularFirestore function when a falsy string arg is passed', () => {
		let afs = TestBed.get(AngularFirestore);
		let afsSpy = spyOn(afs, 'valueChanges').and.callThrough();
		expect(service.getWorkbookDocument).toBeTruthy();
		expect(typeof service.getWorkbookDocument).toEqual('function');
		service.getWorkbookDocument('');
		expect(afsSpy).toHaveBeenCalledTimes(0);
	});

	it('should have an updateWorkbook function', () => {
		expect(service.updateWorkbook).toBeTruthy();
		expect(typeof service.updateWorkbook).toEqual('function');
	});

	it('should have a function for updating a workbook that calls the appropriate AngularFirestore function when truthy ID and data args are passed in', () => {
		let afs = TestBed.get(AngularFirestore);
		let afsSpy = spyOn(afs, 'update').and.callThrough();

		expect(afsSpy).toHaveBeenCalledTimes(0);

		service.updateWorkbook('some_ID', mockWorkbookCollection);

		expect(afsSpy).toHaveBeenCalledTimes(1);
	});

	it('should have a function for updating a workbook that calls the appropriate AngularFirestore function when truthy ID and data args are passed in', () => {
		let falsyID = '';
		let falsyData = undefined;

		expect(falsyID).toBeFalsy();
		expect(falsyData).toBeFalsy();

		let afs = TestBed.get(AngularFirestore);
		let afsSpy = spyOn(afs, 'update').and.callThrough();

		expect(afsSpy).toHaveBeenCalledTimes(0);

		service.updateWorkbook(falsyID, mockWorkbookCollection);
		service.updateWorkbook('some_id', falsyData);
		service.updateWorkbook(falsyID, falsyData);

		expect(afsSpy).toHaveBeenCalledTimes(0);
	});

	it('should have a function for getting a sheet collection within a given workbook document', () => {
		let falsyID = '';
		let truthyID = 'truthy_id';

		expect(falsyID).toBeFalsy();
		expect(truthyID).toBeTruthy();

		let afSpy = spyOn(service.firestore, 'collection').and.callThrough();
		expect(afSpy).toHaveBeenCalledTimes(0);
		service.getSheetCollection(truthyID);
		expect(afSpy).toHaveBeenCalledTimes(1);
		service.getSheetCollection(falsyID);
		expect(afSpy).toHaveBeenCalledTimes(1);
	});

	it('should have a function for adding a new sheet to the data base with the corresoponding firestore function when valid ID and data arguments are passed', () => {
		let afs = TestBed.get(AngularFirestore);
		let fsSpy = spyOn(afs, 'add').and.callThrough();

		expect(service.addSheet).toBeTruthy();
		expect(typeof service.addSheet).toEqual('function');
		expect(fsSpy).toHaveBeenCalledTimes(0);

		service.addSheet('some_id', { name: 'some_name', uid: 'some_uid', headerFields: [], rows: [] });

		expect(fsSpy).toHaveBeenCalledTimes(1);

		service.addSheet('', { name: 'some_name', uid: 'some_uid', headerFields: [], rows: [] });

		expect(fsSpy).toHaveBeenCalledTimes(1);

		service.addSheet('some_id', undefined);

		expect(fsSpy).toHaveBeenCalledTimes(1);
	});

	it('should have a function for adding a new sheet to the data base with the corresoponding firestore function when valid ID and data arguments are passed', async () => {
		let afs = TestBed.get(AngularFirestore);
		let fsSpy = spyOn(afs, 'delete').and.callThrough();

		expect(service.removeSheet).toBeTruthy();
		expect(typeof service.removeSheet).toEqual('function');
		expect(fsSpy).toHaveBeenCalledTimes(0);

		service.removeSheet('some_id', 'some_other_id');

		expect(fsSpy).toHaveBeenCalledTimes(1);

		service.removeSheet('', 'some_other_id');

		expect(fsSpy).toHaveBeenCalledTimes(1);

		service.removeSheet('some_id', '');

		expect(fsSpy).toHaveBeenCalledTimes(1);
	});

	it('should have a function for retrieving a sheet document with the corresponding firestore function when valid workbook ID and sheet ID are passed in', () => {
		let afs = TestBed.get(AngularFirestore);
		let fsSpy = spyOn(afs, 'valueChanges').and.callThrough();

		expect(service.getSheetDocument).toBeTruthy();
		expect(typeof service.getSheetCollection).toEqual('function');
		expect(fsSpy).toHaveBeenCalledTimes(0);

		service.getSheetDocument('some_id', 'some_other_id');

		expect(fsSpy).toHaveBeenCalledTimes(1);

		service.getSheetDocument('', 'some_other_id');

		expect(fsSpy).toHaveBeenCalledTimes(1);
		service.getSheetDocument('some_id', '');

		expect(fsSpy).toHaveBeenCalledTimes(1);
	});

	it('should have a function for updating a sheet document that calls the appropriate Firestore function when valid args are passed', () => {
		let afs = TestBed.get(AngularFirestore);
		let fsSpy = spyOn(afs, 'update');

		expect(fsSpy).toHaveBeenCalledTimes(0);

		service.updateSheet('workbook_id', 'sheet_id', { data: 'some_data' });

		expect(fsSpy).toHaveBeenCalledTimes(1);

		service.updateSheet('workbook_id', 'sheet_id', undefined);

		service.updateSheet('', 'sheet_id', { data: 'some_data' });

		service.updateSheet('workbook_id', '', { data: 'some_data' });

		expect(fsSpy).toHaveBeenCalledTimes(1);
	});
});
