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

@NgModule({
	declarations: [ AppComponent, WorkbookListComponent, WorkbookEditorComponent ],
	imports: [
		BrowserModule,
		AppRoutingModule,
		FormsModule,
		ReactiveFormsModule,
		AngularFireModule.initializeApp(environment.firebase)
		// AngularFirestoreModule.enablePersistence()
	],
	providers: [],
	bootstrap: [ AppComponent ]
})
export class AppModule {}
