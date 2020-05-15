import { browser, by, element, ElementFinder, ElementArrayFinder } from 'protractor';

export class AppPage {
	private waitCondition = function(n) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				resolve();
			}, n);
		});
	};

	navigateTo(url?: string) {
		browser.get(browser.baseUrl + (url ? url : ''));
	}

	query(query: string): ElementFinder {
		return element(by.css(query));
	}

	queryAll(query: string): ElementArrayFinder {
		return element.all(by.css(query));
	}

	async wait(n: number) {
		await browser.wait(this.waitCondition(n), n + 100);
	}

	async login() {
		await this.query('#sign-in-form #email').sendKeys('some@email.com');
		await this.query('#sign-in-form #password').sendKeys('some_password');
		await this.query('#sign-in-form #login-button').click();
		await browser.wait(this.waitCondition(1000), 1100);
	}

	async addWorkbook(name: string) {
		await this.query('#add-workbook-form #name').sendKeys(name);
		await this.query('#add-workbook-form #add-workbook-button').click();
		await browser.wait(this.waitCondition(1000), 1100);
	}

	async addHeaderField(name: string, value: string) {
		await this.query('#add-header-field-button').click();
		await this.wait(1000);
		await this.query('.modal-body #header-field-form #name-input').sendKeys(name);
		await this.wait(1000);
		await this.query('.modal-body #header-field-form #value-input').sendKeys(value);
		await this.wait(1000);
		await this.query('.modal-body #header-field-form #save-button').click();
		await this.wait(1000);
	}

	async addRow() {
		await this.query('#add-row-button').click();
		await this.wait(1000);
		let inputs = await this.queryAll('input');
		await new Promise((resolve, reject) => {
			inputs.forEach(async (input) => {
				await input.sendKeys('_value_');
			});
			resolve();
		});
		await this.wait(1000);
		await this.query('#save-row-button').click();
	}
}
