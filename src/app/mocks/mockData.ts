export let mockWorkbookCollection = [
	{ name: 'book1', id: 'id1', uid: 'uid1' },
	{ name: 'book2', id: 'id2', uid: 'uid2' },
	{ name: 'book3', id: 'id3', uid: 'uid3' },
	{ name: 'book4', id: 'id4', uid: 'uid4' },
	{ name: 'book5', id: 'id5', uid: 'uid5' }
];

export class MockWorkBookFactory {
	constructor() {}

	private mockWorkbookDocument = {
		id: 'id',
		uid: 'uid',
		name: 'name'
	};

	private mockHeaderFields = [
		{
			name: 'a_field1',
			text: true,
			value: 'some_value',
			primary: true
		},
		{
			name: 'b_field2',
			text: false,
			value: 300.001,
			primary: false
		},
		{
			name: 'c_field3',
			text: true,
			value: 'some_other_value',
			primary: false
		}
	];

	private makeRow() {
		let row = {};
		this.mockHeaderFields.forEach((headerField) => {
			row[headerField.name] = headerField.value;
		});
		return row;
	}

	getNRows(n: number) {
		let rows = [];
		for (let i = 0; i < n; i++) {
			let row = this.makeRow();
			rows.push(row);
		}
		return rows;
	}

	getWorkBookDocument(n?: number) {
		let workbook: any = {
			...this.mockWorkbookDocument,
			rows: this.getNRows(3),
			headerFields: this.copyHeaderFields()
		};

		return workbook;
	}

	copyHeaderFields() {
		let copiedFields = [];
		this.mockHeaderFields.forEach((mockField) => {
			let fieldCopy = {};
			Object.assign(fieldCopy, mockField);
			copiedFields.push(fieldCopy);
		});
		return copiedFields;
	}
}

export class MockSheetFactory {
	constructor() {}

	private mockSheetDocument = {
		id: 'id',
		uid: 'uid',
		name: 'name'
	};

	private mockHeaderFields = [
		{
			name: 'a_field1',
			text: true,
			value: 'some_value',
			primary: true
		},
		{
			name: 'b_field2',
			text: false,
			value: 300.001,
			primary: false
		},
		{
			name: 'c_field3',
			text: true,
			value: 'some_other_value',
			primary: false
		}
	];

	private makeRow() {
		let row = {};
		this.mockHeaderFields.forEach((headerField) => {
			row[headerField.name] = headerField.value;
		});
		return row;
	}

	getNRows(n: number) {
		let rows = [];
		for (let i = 0; i < n; i++) {
			let row = this.makeRow();
			rows.push(row);
		}
		return rows;
	}

	getSheetDocument(n?: number) {
		let sheet = { ...this.mockSheetDocument, rows: this.getNRows(3), headerFields: this.copyHeaderFields() };
		return sheet;
	}

	copyHeaderFields() {
		let copiedFields = [];
		this.mockHeaderFields.forEach((mockField) => {
			let fieldCopy = {};
			Object.assign(fieldCopy, mockField);
			copiedFields.push(fieldCopy);
		});
		return copiedFields;
	}
}
