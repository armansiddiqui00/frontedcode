import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';

import { User, Role } from '../_models';

const users: User[] = [
    { id: 1, username: 'HR', password: 'hr123', firstName: 'Gazt', lastName: 'HR', role: Role.HR, status:true },
    { id: 2, username: 'user', password: 'user', firstName: 'Gazt', lastName: 'User', role: Role.User,status:true },
    { id: 3, username: 'manager', password: 'manager', firstName: 'Gazt', lastName: 'Manager', role: Role.Manager,status:true },
    { id: 4, username: 'agent', password: 'agent', firstName: 'Gazt', lastName: 'Agent', role: Role.agent,status:true }
];

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const { url, method, headers, body } = request;

        // wrap in delayed observable to simulate server api call
        return of(null)
            .pipe(mergeMap(handleRoute))
            .pipe(materialize()) // call materialize and dematerialize to ensure delay even if an error is thrown (https://github.com/Reactive-Extensions/RxJS/issues/648)
            .pipe(delay(500))
            .pipe(dematerialize());

        function handleRoute() {
            switch (true) {
                case url.endsWith('/users/authenticate') && method === 'POST':
                    return authenticate();
                case url.endsWith('/users') && method === 'GET':
                    return getUsers();
                case url.match(/\/users\/\d+$/) && method === 'GET':
                    return getUserById();
                    case url.endsWith('/users/accessPages') && method === 'POST':
                    return getAccess();
                default:
                    // pass through any requests not handled above
                    return next.handle(request);
            }

        }

        // route functions

        function authenticate() {
            const { username, password } = body;
            const user = users.find(x => x.username === username && x.password === password);
            if (!user) return error('Username or password is incorrect');
            return ok({
                id: user.id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                status:user.status,
                token: `fake-jwt-token.${user.id}`
            });
        }

        function getAccess() {
            const { id } = body;
            const user = users.find(x => x.id === id);
          //  if (!user) return error('Username or password is incorrect');
            return ok({access:true})
        }

        function getUsers() {
            console.log("Test-1:",!isHR());
            if (currentUser().role === Role.HR && !isHR()) return unauthorized();
           if (currentUser().role === Role.Manager && !isManager()) return unauthorized();
            if (currentUser().role === Role.agent && !isAgent()) return unauthorized();
            return ok(users);
        }

        function getUserById() {
            if (!isLoggedIn()) return unauthorized();

            // only admins can access other user records
            if (!isHR() && currentUser().id !== idFromUrl()) return unauthorized();
            console.log(idFromUrl());
            const user = users.find(x => x.id === idFromUrl());
            return ok(user);
        }

        // helper functions

        function ok(body) {
            return of(new HttpResponse({ status: 200, body }));
        }

        function unauthorized() {
            return throwError({ status: 401, error: { message: 'unauthorized' } });
        }

        function error(message) {
            return throwError({ status: 400, error: { message } });
        }

        function isLoggedIn() {
            const authHeader = headers.get('Authorization') || '';
            return authHeader.startsWith('Bearer fake-jwt-token');
        }

        function isHR() {
            return isLoggedIn() && currentUser().role === Role.HR;
        }
        function isManager() {
          //  console.log(isLoggedIn() && currentUser().role === Role.Manager,"test:::;", isLoggedIn(), currentUser().role, Role.Manager);
            
            return isLoggedIn() && currentUser().role === Role.Manager;
        }
        function isAgent() {
            return isLoggedIn() && currentUser().role === Role.agent;
        }

        function currentUser() {
           // if (!isLoggedIn()){ return};
            const id = parseInt(headers.get('Authorization').split('.')[1]);
            return users.find(x => x.id === id);
        }

        function idFromUrl() {
            const urlParts = url.split('/');
            return parseInt(urlParts[urlParts.length - 1]);
        }
    }
}

export const fakeBackendProvider = {
    // use fake backend in place of Http service for backend-less development
    provide: HTTP_INTERCEPTORS,
    useClass: FakeBackendInterceptor,
    multi: true
};