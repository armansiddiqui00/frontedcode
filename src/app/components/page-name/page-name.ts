

export class PageName {
    public main: string;
    public submenu: string;
    public breadcrumb: string[];

    constructor() {
        this.main = "";
        this.submenu = "";
        this.breadcrumb = [];
    }

    public copy(pageName: PageName) {
        return Object.assign(this, pageName, { breadcrumb: pageName?.breadcrumb?.filter(crumb => true) });
    }
}