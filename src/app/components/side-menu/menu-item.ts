

export class MenuItem {
  pageId: number = 0;
  public icon: string = '';
  public selected: string = '';
  public text: string;
  public subMenu: MenuItem[];
  public dropdown: boolean;
  public active: boolean;
  public link: string;
  public pageTitle: string

  constructor() {
    this.text = "menu item";
    this.dropdown = false;
    this.active = false;
    this.subMenu = [];
    this.link = "/";
  }

  public copy(menuItem: MenuItem): MenuItem {
    return Object.assign(this, menuItem);
  }

}
