import {Card} from "../../../src/domain/entities/card";

describe('Card', () => {
    test('doit initialiser une carte avec une valeur et être cachée par défaut', () => {
        const card = new Card(5);
        expect(card.value).toBe(5);
        expect(card.isVisible).toBe(false);
    });

    test('doit retourner la carte (la rendre visible)', () => {
        const card = new Card(7, false);
        card.flip();
        expect(card.isVisible).toBe(true);
    });
});
