export class Card {
    constructor(public value: number, public isVisible: boolean = false) {}

    flip(): void {
        this.isVisible = true;
    }
}
