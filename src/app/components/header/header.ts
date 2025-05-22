
export class Header {

  public mailCount: number;

  constructor() {
    this.mailCount = 0;
  }

  public copy(header: Header): Header {
    return Object.assign(this, header);
  }

}