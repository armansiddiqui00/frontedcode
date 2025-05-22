import { ActivatedRoute, Router } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RouteService {
  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  getCurrentPageName() {
    setTimeout(() =>{
        const currentRoute = this.router.url;
    return currentRoute;
    })
  }
}
