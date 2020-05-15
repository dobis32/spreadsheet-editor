// import { AppPage } from './app.po';
// import { browser, logging } from 'protractor';

// describe('Login page', () => {
// 	let page: AppPage;

// 	beforeEach(() => {
// 		page = new AppPage();
// 	});

// 	it('should default to the login screen when a user is not signed in', () => {
// 		page.navigateTo();
// 		expect(page.query('#sign-in-form')).toBeTruthy();
// 	});

// 	it('should show an error message when invalid login credentials are submitted to the login form', async () => {
// 		page.navigateTo();
// 		await page.query('#sign-in-form #email').sendKeys('');
// 		await page.query('#sign-in-form #password').sendKeys('');
// 		await page.query('#sign-in-form #email').click();
// 		expect(page.query('.error-message')).toBeTruthy();
// 		await page.query('#sign-in-form #email').sendKeys('not_an_email');
// 		await page.query('#sign-in-form #password').sendKeys('some_password');
// 		await page.query('#sign-in-form #email').click();
// 		expect(page.query('.error-message')).toBeTruthy();
// 	});

// 	it('should redirect the user to the workbook list screen after a successful login', async () => {
// 		page.navigateTo();
// 		await page.login();
// 		expect(page.query('#workbook-list-heading').getText()).toEqual('Workbook List');
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
