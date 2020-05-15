import { Component, OnInit, isDevMode } from '@angular/core';
import { FirestoreService } from '../services/firestore.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: [ './login.component.scss' ]
})
export class LoginComponent implements OnInit {
	public signInAuth: Subscription;
	public signInForm: FormGroup;
	public invalidCredentials: boolean;

	constructor(public formBuilder: FormBuilder, public router: Router, public firestoreService: FirestoreService) {
		this.signInForm = this.formBuilder.group({
			email: new FormControl('', [ Validators.required, Validators.email ]),
			password: new FormControl('', [ Validators.required ])
		});
		this.invalidCredentials = false;

		if (!isDevMode())
			this.signInAuth = this.firestoreService.signedIn.subscribe((user) => {
				if (user) {
					this.router.navigate([ '/workbooks/list' ]);
				}
			});
	}

	ngOnInit(): void {}

	ngOnDestroy(): void {
		if (this.signInAuth) this.signInAuth.unsubscribe();
	}

	async signIn(fg: FormGroup) {
		try {
			this.invalidCredentials = false;
			if (!fg.valid) throw new Error('Invalid credentials');
			const result = await this.firestoreService.signIn(fg.value.email, fg.value.password);
			if (result) this.router.navigate([ 'workbooks', 'list' ]);
			else throw new Error('Invalid credentials');
		} catch (error) {
			console.log(error);
			this.invalidCredentials = true;
		}
	}
}
