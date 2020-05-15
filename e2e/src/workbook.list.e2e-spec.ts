// import { AppPage } from './app.po';
// import { browser, logging, element, by } from 'protractor';

// describe('Workbook List page', () => {
// 	let page: AppPage;

// 	beforeEach(async () => {
// 		await browser.waitForAngularEnabled(false);
// 		page = new AppPage();
// 		page.navigateTo('/workbooks/list');
// 		await page.wait(1000);
// 	});

// 	it('should allow the user to add a new workbook, which should update the number of workbooks in the list when a valid string is entered', async () => {
// 		const initCount = (await page.queryAll('.workbook-listing')).length;
// 		await page.addWorkbook('_test_workbook_');
// 		const currCount = (await page.queryAll('.workbook-listing')).length;
// 		expect(currCount).toBeGreaterThan(initCount);
// 	});

// 	it('should display an error message to the user when an attempt to add a workbook with an invalid name', async () => {
// 		await page.addWorkbook('');
// 		expect(await page.query('.error-message').getText()).toBeTruthy();
// 	});

// 	it('should allow a user to delete a workbook by clicking on the corresponding "remove" button', async () => {
// 		await page.addWorkbook('_test_workbook_');
// 		const initCount = (await page.queryAll('.workbook-listing')).length;
// 		await page.query('.workbook-listing .remove-button').click();
// 		const currCount = (await page.queryAll('.workbook-listing')).length;
// 		expect(currCount).toBeLessThan(initCount);
// 	});

// 	it('should allow a user to edit a workbook which redirects to the workbook-editor', async () => {
// 		await page.addWorkbook('_test_workbook_');
// 		await page.query('.workbook-listing .edit-button').click();
// 		expect(page.query('#workbook-editor-heading').getText()).toEqual('Workbook Editor');
// 	});

// 	afterEach(async () => {
// 		// Assert that there are no errors emitted from the browser
// 		const logs = await browser.manage().logs().get(logging.Type.BROWSER);
// 		expect(logs).not.toContain(
// 			jasmine.objectContaining({
// 				level: logging.Level.SEVERE
// 			} as logging.Entry)
// 		);
// 	});
// });
