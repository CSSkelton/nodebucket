/**
 * Title: home.component.ts
 * Author: Professor Krasso
 * Date: 8/5/23
 */

// imports statements
import { Component } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  isSignedIn: boolean;

  constructor (private cookieService: CookieService, private router: Router) {
    this.isSignedIn = this.cookieService.get('session_user') ? true:false;
  }
}
