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

	private mockRows = [
		{
			field1: 'some_value',
			field2: 3000.001
		},
		{
			field1: 'some_other_value',
			field2: 123
		}
	];

	private mockHeaderFields = [
		{
			name: 'field1',
			text: true,
			value: 'some_value'
		},
		{
			name: 'field2',
			text: false,
			value: 300.001
		}
	];

	getWorkBookDocument(n?: number) {
		let workbook: any = { ...this.mockWorkbookDocument };
		workbook.defaults = { rows: new Array<any>(), headerFields: new Array<any>() };
		this.mockRows.forEach((row) => {
			workbook.defaults.rows.push({ ...row });
		});
		this.mockHeaderFields.forEach((headerField) => {
			workbook.defaults.headerFields.push({ ...headerField });
		});
		return workbook;
	}

	getWorkbookCollection;
}

// export let mockWorkbookDocument = {
// 	id: 'id',
// 	uid: 'uid',
// 	name: 'name',
// 	defaults: {
// 		headerFields: [
// 			{
// 				name: 'field1',
// 				text: true,
// 				value: 'some_value'
// 			},
// 			{
// 				name: 'field2',
// 				text: false,
// 				value: 300.001
// 			}
// 		],
// 		rows: [
// 			{
// 				field1: 'some_value',
// 				field2: 3000.001
// 			},
// 			{
// 				field1: 'some_other_value',
// 				field2: 123
// 			}
// 		]
// 	}
// };
