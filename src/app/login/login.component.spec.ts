import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { FirestoreService } from '../services/firestore.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { routes } from '../app-routing.module';
import { of } from 'rxjs';
import { FormBuilder } from '@angular/forms';

class MockFirestoreService {
	public signedIn = of(true);
	signIn(email: string, password: string) {
		try {
			if (!email && !password) throw new Error();
			return Promise.resolve(true);
		} catch (error) {
			return Promise.resolve(false);
		}
	}
}

describe('LoginComponent', () => {
	let component: LoginComponent;
	let fixture: ComponentFixture<LoginComponent>;

	beforeEach(
		async(() => {
			TestBed.configureTestingModule({
				imports: [ RouterTestingModule.withRoutes(routes) ],
				declarations: [ LoginComponent ],
				providers: [ FormBuilder, { provide: FirestoreService, useClass: MockFirestoreService } ]
			}).compileComponents();
		})
	);

	beforeEach(() => {
		fixture = TestBed.createComponent(LoginComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should have a FormBuilder injected into it', () => {
		expect(component.formBuilder).toBeTruthy();
		expect(fixture.debugElement.injector.get(FormBuilder)).toBeTruthy();
	});

	it('should have a Router injected into it', () => {
		expect(component.router).toBeTruthy();
		expect(fixture.debugElement.injector.get(Router)).toBeTruthy();
	});

	it('should have the FirestoreService injected into it', () => {
		expect(component.firestoreService).toBeTruthy();
		expect(fixture.debugElement.injector.get(FirestoreService)).toBeTruthy();
	});

	it('should have a function for signing in with the credentials entered into the sign in form', () => {
		let signInSpy = spyOn(component, 'signIn').and.callThrough();

		component.signInForm.setValue({ email: 'some@email.com', password: 'red123' });

		expect(signInSpy).toHaveBeenCalledTimes(0);

		component.signIn(component.signInForm);

		expect(signInSpy).toHaveBeenCalledTimes(1);
		expect(signInSpy).toHaveBeenCalledWith(component.signInForm);
	});

	it('should have a function for signing into Firestore auth', () => {
		let fs = fixture.debugElement.injector.get(FirestoreService);
		let fsSpy = spyOn(fs, 'signIn').and.callThrough();

		expect(fsSpy).toHaveBeenCalledTimes(0);

		component.signInForm.setValue({ email: 'some@email.com', password: 'red123' });
		component.signIn(component.signInForm);

		expect(fsSpy).toHaveBeenCalledTimes(1);
	});

	it('should have a form that requires a valid email value and a truthy password value', () => {
		expect(component.signInForm.controls['password'].valid).toBeFalse();
		expect(component.signInForm.controls['email'].valid).toBeFalse();

		component.signInForm.setValue({ password: 'some_value', email: 'invalid_email' });

		expect(component.signInForm.controls['password'].valid).toBeTrue();

		expect(component.signInForm.controls['email'].valid).toBeFalse();

		component.signInForm.setValue({ password: 'some_value', email: 'valid@email.com' });

		expect(component.signInForm.controls['password'].valid).toBeTrue();
		expect(component.signInForm.controls['email'].valid).toBeTrue();
	});
});
