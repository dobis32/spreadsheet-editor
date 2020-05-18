import { Injectable } from '@angular/core';
// import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = 'xlsx';

@Injectable({
	providedIn: 'root'
})
export class ExcelService {
	constructor() {}

	public formatData(unformattedData: any, uid: string) {
		let workbookDoc = <any>{};
		let sheetDocs = [];
		workbookDoc.name = unformattedData.name;
		workbookDoc.headerFields = [];
		workbookDoc.rows = [];
		workbookDoc.uid = uid;

		unformattedData.sheets.forEach((sheet) => {
			sheetDocs.push(this.formatSheet(sheet));
		});

		return { workbookDoc, sheetDocs };
	}

	formatSheet(sheet: any) {
		let formattedSheet = <any>{};
		// name
		formattedSheet.name = sheet.name;
		// headerfields
		const headerFields = this.formatHeaderFields(sheet.data[0]);
		formattedSheet.headerFields = headerFields;
		// rows
		let rows = [];
		sheet.data.forEach((row) => {
			rows.push(this.formatRow(headerFields, row));
		});
		formattedSheet.rows = rows;

		return formattedSheet;
	}

	formatHeaderFields(headerData: Array<string | number>) {
		let headerFields = [];
		headerData.forEach((data) => {
			headerFields.push({ name: data, text: true, value: 'None' });
		});
		return headerFields;
	}

	formatRow(headerFields: Array<any>, rowData: Array<any>) {
		let row = {};
		for (let i = 0; i < headerFields.length; i++) {
			row[headerFields[i].name] = rowData[i + 1] ? rowData[i + 1] : 'None'; // row[0] is really the header field data; do not include
		}
		return row;
	}

	public importExcelFile(event: any): any {
		/* wire up file reader */
		return new Promise((resolve, reject) => {
			try {
				const target: DataTransfer = <DataTransfer>event.target;
				if (target.files.length !== 1) throw new Error('Cannot use multiple files');
				if (!target.files) throw new Error('No files being uploaded!');
				const t = target.files[0];
				const reader: FileReader = new FileReader();
				reader.onerror = () => {
					reader.abort();
					throw new Error('Problem parsing file!');
				};
				let fileNameTokens = target.files[0].name.slice().split('.');
				if (fileNameTokens[fileNameTokens.length - 1] != EXCEL_EXTENSION) throw new Error('Not a .xlsx file');
				let bookName = '';
				for (let i = 0; i < fileNameTokens.length - 1; i++) {
					bookName += fileNameTokens[i];
				}
				let bookJSON = <any>{
					name: bookName,
					fileName: target.files[0].name,
					sheets: new Array<any>()
				};
				reader.onload = (e: any) => {
					/* read workbook */
					const bstr: string = e.target.result;
					const workBook: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

					/* grab first sheet */
					workBook.SheetNames.forEach((sheetName) => {
						const sheet: XLSX.WorkSheet = workBook.Sheets[sheetName];
						let sheetJSON = <any>{
							name: sheetName,
							data: XLSX.utils.sheet_to_json(sheet, { header: 1 })
						};
						bookJSON.sheets.push(sheetJSON);
					});

					/* save data */
					resolve({ result: true, data: bookJSON });
				};
				reader.readAsBinaryString(target.files[0]);
			} catch (error) {
				console.log(error);
				reject({ result: false, error });
			}
		});
	}
}
