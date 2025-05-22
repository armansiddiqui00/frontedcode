import { MenuItem } from "./menu-item";


export class SideMenu {

    public menuOpen: boolean;
    public menuItems: MenuItem[];

    constructor() {
        this.menuOpen = false;
        this.menuItems = [];
    }

    public copy(sideMenu: SideMenu): SideMenu {
        return Object.assign(this, sideMenu);
    }
}