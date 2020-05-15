import { AppPage } from './app.po';
import { browser, logging, element, by } from 'protractor';

describe('Workbook Edit page', () => {
	let page: AppPage;

	beforeEach(async () => {
		await browser.waitForAngularEnabled(false);
		page = new AppPage();
		page.navigateTo('/workbooks/list');
		await page.wait(1000);
		await page.addWorkbook('test_workbook');
		await page.wait(1000);
		await page.query('.workbook-listing .edit-button').click();
		await page.wait(1000);
	});

	it('should allow the user to update the workbook name', async () => {
		expect(page.query('#workbook-editor-heading').getText()).toEqual('Workbook Editor');
		await page.query('#name-form #name-input').clear();
		await page.wait(1000);
		await page.query('#name-form #name-input').sendKeys('_new_name_');
		await page.wait(1000);
		await page.query('#name-form button').click();
		await page.wait(1000);
		expect(await page.query('.success-message').getText()).toEqual('Name updated successfully.');
	});

	it('should display a modal for adding header fields when after clicking the "add header field" button', async () => {
		await page.query('#add-header-field-button').click();
		await page.wait(1000);
		expect(await page.query('#edit-header-field-modal').getText()).toEqual('Edit Header Field');
	});

	it('should allow a user to add a new header field', async () => {
		const initCount = (await page.queryAll('.header-field-listing')).length;
		await page.addHeaderField('_name_', '_value_');
		expect(await page.query('.success-message').getText()).toEqual('Updated successfully.');
		await page.wait(1000);
		const currCount = (await page.queryAll('.header-field-listing')).length;
		expect(currCount).toBeGreaterThan(initCount);
	});

	it('should allow a user to delete a header field', async () => {
		await page.wait(1000);
		const initCount = (await page.queryAll('.header-field-listing')).length;
		await page.wait(1000);
		await page.queryAll('.header-field-listing button').click();
		await page.wait(1000);
		await page.query('#delete-header-field-button').click();
		await page.wait(1000);
		const currCount = (await page.queryAll('.header-field-listing')).length;
		expect(currCount).toBeLessThan(initCount);
	});

	it('should allow a user to add a row', async () => {
		await page.addHeaderField('_test_field_', '_value_');
		await page.addRow();
		await page.wait(1000);
		const initCount = (await page.queryAll('.header-field-listing')).length;
		await page.wait(1000);
		await page.addRow();
		await page.wait(1000);
		const currCount = (await page.queryAll('.header-field-listing')).length;
		expect(currCount).toBeGreaterThan(initCount);
	});

	afterEach(async () => {
		// Assert that there are no errors emitted from the browser
		const logs = await browser.manage().logs().get(logging.Type.BROWSER);
		expect(logs).not.toContain(
			jasmine.objectContaining({
				level: logging.Level.SEVERE
			} as logging.Entry)
		);
	});
});
