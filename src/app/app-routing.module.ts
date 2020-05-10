import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WorkbookListComponent } from './workbooks/workbook-list/workbook-list.component';
import { WorkbookEditorComponent } from './workbooks/workbook-editor/workbook-editor.component';
import { LoginComponent } from './login/login.component';
import { SheetListComponent } from './sheets/sheet-list/sheet-list.component';

export const routes: Routes = [
	{
		path: 'login',
		component: LoginComponent
	},
	{
		path: 'workbooks/list',
		component: WorkbookListComponent
	},
	{
		path: 'workbooks/:id/edit',
		component: WorkbookEditorComponent
	},
	{
		path: 'workbooks/:workbookId/list',
		component: SheetListComponent
	},
	{
		path: 'workbooks/edit/:id',
		component: WorkbookEditorComponent
	},
	{ path: '**', component: LoginComponent }
];

@NgModule({
	imports: [ RouterModule.forRoot(routes) ],
	exports: [ RouterModule ]
})
export class AppRoutingModule {}
