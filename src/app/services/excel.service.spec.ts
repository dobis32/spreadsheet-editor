import { TestBed } from '@angular/core/testing';

import { ExcelService } from './excel.service';

describe('ExcelService', () => {
	let service: ExcelService;
	let unformattedWorkbookData;
	let mockUID;
	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(ExcelService);
		mockUID = 'mock_uid';
		unformattedWorkbookData = {
			name: 'import_workbook',
			sheets: [
				{
					name: 'sheet1',
					data: [
						[ 'field1', 'field2', 'field3', 'field4' ],
						[ 'value', 'value', 123, 'value' ],
						[ 'value', 'value', 123, 'value' ],
						[ 'value', 'value', 123, 'value' ],
						[ 'value', 'value', 123, 'value' ]
					]
				},
				{
					name: 'sheet2',
					data: [
						[ 'field1', 'field2', 'field3', 'field4' ],
						[ 'value', 'value', 123, 'value' ],
						[ 'value', 'value', 123, 'value' ],
						[ 'value', 'value', 123, 'value' ],
						[ 'value', 'value', 123, 'value' ]
					]
				},
				{
					name: 'sheet3',
					data: [
						[ 'field1', 'field2', 'field3', 'field4' ],
						[ 'value', 'value', 123, 'value' ],
						[ 'value', 'value', 123, 'value' ],
						[ 'value', 'value', 123, 'value' ],
						[ 'value', 'value', 123, 'value' ]
					]
				}
			]
		};
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should have a funciton for formatting JSON data of imported workbooks', async () => {
		const result = service.formatData(unformattedWorkbookData, mockUID);
		expect(service.formatData).toBeTruthy();
		expect(typeof service.formatData).toEqual('function');
		expect(result.workbookDoc).toBeTruthy();
		expect(result.sheetDocs).toBeTruthy();
	});
});
