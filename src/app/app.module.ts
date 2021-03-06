import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WorkbookListComponent } from './workbooks/workbook-list/workbook-list.component';
import { AngularFireModule } from '@angular/fire';
import { environment } from 'src/environments/environment';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { WorkbookEditorComponent } from './workbooks/workbook-editor/workbook-editor.component';
import { NgbModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EditHeaderFieldComponent } from './modals/edit-header-field/edit-header-field.component';
import { EditRowComponent } from './modals/edit-row/edit-row.component';
import { LoginComponent } from './login/login.component';
import { SheetListComponent } from './sheets/sheet-list/sheet-list.component';
import { SheetEditorComponent } from './sheets/sheet-editor/sheet-editor.component';
import { SheetViewerComponent } from './sheets/sheet-viewer/sheet-viewer.component';

@NgModule({
	declarations: [
		AppComponent,
		WorkbookListComponent,
		WorkbookEditorComponent,
		EditHeaderFieldComponent,
		EditRowComponent,
		LoginComponent,
		SheetListComponent,
		SheetEditorComponent,
		SheetViewerComponent
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		FormsModule,
		ReactiveFormsModule,
		AngularFireModule.initializeApp(environment.firebase),
		NgbModule
		// AngularFirestoreModule.enablePersistence()
	],
	providers: [],
	bootstrap: [ AppComponent ],
	entryComponents: [ EditHeaderFieldComponent ]
})
export class AppModule {}
