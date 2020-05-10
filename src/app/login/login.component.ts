import { Component, OnInit } from '@angular/core';
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
		this.signInAuth = this.firestoreService.signedIn.subscribe((user) => {
			if (user) {
				this.router.navigate([ '/workbooks/list' ]);
			}
		});
	}

	ngOnInit(): void {}

	signIn(fg: FormGroup) {
		this.invalidCredentials = false;
		if (fg.valid) this.firestoreService.signIn(fg.value.email, fg.value.password);
		else this.invalidCredentials = true;
	}
}
