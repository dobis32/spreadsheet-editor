import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SheetViewerComponent } from './sheet-viewer.component';
import { RouterTestingModule } from '@angular/router/testing';
import { FirestoreService } from 'src/app/services/firestore.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { MockSheetFactory } from 'dist/spreadsheet-editor/assets/mockData';

class MockFirestoreService {
	private mockDataFactory: MockSheetFactory;
	public signedIn: Observable<any>;
	constructor() {
		this.signedIn = <Observable<any>>of(true);
		this.mockDataFactory = new MockSheetFactory();
	}

	getSheetDocument(workbookId: string, sheetId: string) {
		try {
			if (!workbookId || !sheetId) throw new Error();
			else return of(this.mockDataFactory.getSheetDocument());
		} catch (error) {
			return of(false);
		}
	}
}

class MockActivatedRoute {
	public params: Observable<any>;
	constructor() {
		this.params = of({ workbookId: 'workbook_id', sheetId: 'sheetId' });
	}
}

class MockRouter {}

describe('SheetViewerComponent', () => {
	let component: SheetViewerComponent;
	let fixture: ComponentFixture<SheetViewerComponent>;

	beforeEach(
		async(() => {
			TestBed.configureTestingModule({
				imports: [ RouterTestingModule ],
				declarations: [ SheetViewerComponent ],
				providers: [
					{ provide: FirestoreService, useClass: MockFirestoreService },
					{ provide: ActivatedRoute, useClass: MockActivatedRoute },
					{ provide: Router, useClass: MockRouter }
				]
			}).compileComponents();
		})
	);

	beforeEach(() => {
		fixture = TestBed.createComponent(SheetViewerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
