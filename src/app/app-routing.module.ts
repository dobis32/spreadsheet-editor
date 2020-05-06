import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WorkbookListComponent } from './workbooks/workbook-list/workbook-list.component';
import { WorkbookEditorComponent } from './workbooks/workbook-editor/workbook-editor.component';

export const routes: Routes = [
	{
		path: 'workbook/list',
		component: WorkbookListComponent
	},
	{
		path: 'workbooks/edit/:id',
		component: WorkbookEditorComponent
	}
];

@NgModule({
	imports: [ RouterModule.forRoot(routes) ],
	exports: [ RouterModule ]
})
export class AppRoutingModule {}
