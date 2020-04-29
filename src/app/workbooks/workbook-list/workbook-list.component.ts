import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
	selector: 'app-workbook-list',
	templateUrl: './workbook-list.component.html',
	styleUrls: [ './workbook-list.component.scss' ]
})
export class WorkbookListComponent implements OnInit {
	public workbooks: Array<any>;
	public workbookForm: FormGroup;
	constructor(public formBuilder: FormBuilder) {
		this.workbooks = [
			{ name: 'mockBook1', id: 'id1' },
			{ name: 'mockBook2', id: 'id2' },
			{ name: 'mockBook3', id: 'id3' }
		];
		this.workbookForm = this.formBuilder.group({ name: '' });
	}

	ngOnInit(): void {}

	addWorkbook(fg: FormGroup) {
		const workbook = { name: fg.value.name, id: 'id' + this.workbooks.length.toString() };
		this.workbooks.push(workbook);
		fg.reset();
	}
}
