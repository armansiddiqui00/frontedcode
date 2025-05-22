import { Injectable } from '@angular/core';
import { StoreService } from './store.service';
import { NavigationStart, Route, Router } from '@angular/router';
import { SideMenu } from '../components/side-menu/side-menu';
import { MenuItem } from '../components/side-menu/menu-item';
import { PageName } from '../components/page-name/page-name';
import { NavigationService } from './navigation.service';
//import { UserService } from '../services/user.service';
import { map } from 'rxjs/operators';
//import { Role } from '../_enums'
import { User } from '../_models';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthenticationService } from '../_services';
import { Title } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SideMenuService {
urlPageName:any;
menuDataList;
  constructor(
    public store: StoreService,
    public navigation: NavigationService,
    //private userService: User,
    private http: HttpClient,
    private authenticationService:AuthenticationService,
    private titleService: Title,private router:Router,
  ) {
   
    // if(this.menuDataList?.loginUserDetails?.menus == null){
    //   this.router.navigate(['/permission-denied']);
    //   return;
    // }else{
    //   this.router.navigate(['']);
    // }
    
  }

  private messageSource = new BehaviorSubject<string>("default message");
    currentMessage = this.messageSource.asObservable();

    rowData:any
  changeMessage(message: string) {
    this.messageSource.next(message)
    this.rowData=message
    //this.userID=message
   // console.log('message',this.rowData)
  }

  toggleSideMenu() {
    let sideMenu = new SideMenu().copy(this.store.sideMenu.value);
    sideMenu.menuOpen = !sideMenu.menuOpen;
    if (!sideMenu.menuOpen) {
      sideMenu.menuItems.forEach(item => item.dropdown = false);
    }
    this.store.sideMenu.next(sideMenu);
  }

  // toggleSubMenu(index: number) {
  //   let sideMenu = new SideMenu().copy(this.store.sideMenu.value);
    
  //   sideMenu.menuItems[index].dropdown = !sideMenu.menuItems[index].dropdown;
  //   this.store.sideMenu.next(sideMenu);
  // }
  
  toggleSubMenu(index: number) {
    let sideMenu = new SideMenu().copy(this.store.sideMenu.value);
    sideMenu.menuItems.forEach((menu, i) => {
      if (i == index)
        menu.dropdown = !menu.dropdown;
      else
        menu.dropdown = false
    });
    this.store.sideMenu.next(sideMenu);
  }

  menuItemClick(index: number) {
    let sideMenu = new SideMenu().copy(this.store.sideMenu.value);

    let selectedItem = sideMenu.menuItems[index];

    if (selectedItem.subMenu.length > 0) {
      sideMenu.menuOpen = true;
      selectedItem.dropdown = !selectedItem.dropdown;
      this.store.sideMenu.next(sideMenu);
    } else {
      sideMenu.menuOpen = false;
      sideMenu.menuItems.forEach(item => { item.dropdown = false; item.active = false });
      this.store.sideMenu.next(sideMenu);
      this.navigation.navigateTo([selectedItem.link]);
    }
  }

  subMenuClick(index: number, jndex: number,openInNewTab = false) {    
    let sideMenu = new SideMenu().copy(this.store.sideMenu.value);
    let selectedSubItem = sideMenu.menuItems[index].subMenu[jndex];
    if (openInNewTab) {
      window.open(location.origin + '/RIMS/#' + selectedSubItem.link + '?pageId=' + selectedSubItem.pageId, '_blank');
    } 
    else {
      sideMenu.menuOpen = true;
      sideMenu.menuItems.forEach(item => { item.dropdown = false; item.active = false; });
      sideMenu.menuItems.forEach(item => { item.subMenu.forEach(itm => { itm.selected = "" }) })
      sideMenu.menuItems.forEach(item => {item.subMenu.forEach(itm => { if(itm.pageId ==selectedSubItem.pageId){item.dropdown=true}}) })
      this.store.sideMenu.next(sideMenu);

      selectedSubItem["selected"] = "custom-class";
      sideMenu.menuItems[index].active = true;
      this.titleService.setTitle(selectedSubItem.pageTitle)
    //  this.navigation.navigateTo([selectedSubItem.link + '?pageId=' + selectedSubItem.pageId]);
    this.navigation.navigateTo(selectedSubItem.link + '?pageId=' + selectedSubItem.pageId);
    }
 
   // sideMenu.menuOpen = false;
    //sideMenu.menuItems.forEach(item => { item.dropdown = false; item.active = false });

    this.store.sideMenu.next(sideMenu);
    // this.navigation.navigateTo([selectedSubItem.link + '?pageId=' + selectedSubItem.pageId]);
  }

  getUserAccess(id:string,menu:any,item:any){
    //let paeId=item.id;
    return this.http.post<any>(`${environment.apiUrl}users/accessPages`, {id}).pipe(map( user => {
      //menu.push(user)
        return user;
    }));
  }

  setMenu(){
    this.authenticationService.currentUser.subscribe(data=>{this.menuDataList = data});
    //console.log('menu',this.menuDataList)
    let menu=this.menuDataList?.loginUserDetails !=undefined?this.menuDataList?.loginUserDetails?.menus:this.menuDataList?.menus
   if(menu !=null && menu !=""){
    this.menuDataList =this.menuDataList !=undefined && this.menuDataList !=null? JSON.parse(menu):null;
   }
 
   
    //console.log("menulist",this.menuDataList)
    this.navigation?.router?.events.forEach(event => {
      if (event instanceof NavigationStart) {
        let sideMenu = new SideMenu().copy(this.store.sideMenu.value);
        let pageName = new PageName().copy(this.store.pageName.value);
        pageName.submenu = null;
        sideMenu.menuItems.forEach(menuItem => {
          menuItem.active = false;
          if (event.url.startsWith(menuItem.link)) {
            pageName.main = menuItem.text;
            menuItem.active = true;
          } else {
            if (menuItem.subMenu.length > 0) {
              menuItem.subMenu.forEach(subMenuItem => {
                if (event.url.startsWith(subMenuItem.link)) {
                  pageName.main = menuItem.text;
                  pageName.submenu = subMenuItem.text;
                  menuItem.active = true;
                }
              })
            }
          }
        });
        this.store.pageName.next(pageName);
        this.store.sideMenu.next(sideMenu);
      }
    });

    let sideMenu = new SideMenu();

    //Dynamic menu creation
    let navItems: any[] = [];
    this.menuDataList.menu != undefined && this.menuDataList.menu !=null? Object.keys(this.menuDataList.menu).forEach((o)=>{
  
      let menuItem = this.menuDataList.menu[o];
      let item = new MenuItem().copy(<MenuItem><unknown>{
        icon: menuItem.iconPath, text: menuItem.displayName, subMenu: [],active:menuItem.active, pageId: menuItem.id, dropdown: false, link: menuItem.resourcePath, menuData: menuItem
      })
      navItems.push(item);
     
    }):""
    
    navItems?.forEach((o)=>{
      let subMenu:any[] =[];
      Object.keys(o.menuData).forEach((key)=>{
        if(typeof o.menuData[key] == 'object'){
          let subMenuItem = o.menuData[key];
          if (subMenuItem && location.href.indexOf(subMenuItem.resourcePath) > -1) {
            this.titleService.setTitle(subMenuItem.pageTitle)
          }
          subMenuItem && subMenu.push(new MenuItem().copy(<any>{pageId:subMenuItem.id, text:subMenuItem.displayName,subMenu:[],active:subMenuItem.active, pageTitle:subMenuItem.pageTitle, link:subMenuItem.resourcePath, icon: 'fa fa-circle',dropdown:false}))
        }
      })
     if(subMenu.length){
      o.subMenu = subMenu
     }
    });

    navItems?.forEach(item=>{
      sideMenu.menuItems.push(item);
    })
    this.store.sideMenu.next(sideMenu)

  }
}
