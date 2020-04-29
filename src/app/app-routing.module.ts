import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WorkbookListComponent } from './workbooks/workbook-list/workbook-list.component';

const routes: Routes = [
	{
		path: 'workbook/list',
		component: WorkbookListComponent
	}
];

@NgModule({
	imports: [ RouterModule.forRoot(routes) ],
	exports: [ RouterModule ]
})
export class AppRoutingModule {}
