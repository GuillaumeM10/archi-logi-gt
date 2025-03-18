import { Card } from "../../../src/domain/entities/card";
import {Player} from "../../../src/domain/entities/player";

describe('Player', () => {
    let player: Player;
    let deck: Card[];
    let discardPile: Card[];

    beforeEach(() => {
        player = new Player('Alice');
        deck = Array.from({ length: 150 }, (_, i) => new Card(i % 13));
        discardPile = [];
    });

    test('doit initialiser une grille avec 3x4 cartes depuis le deck', () => {
        player.initializeGrid(deck);
        expect(player.grid.length).toBe(3);
        expect(player.grid[0].length).toBe(4);
        expect(deck.length).toBe(150 - 12);
    });

    test('doit révéler une carte si elle est cachée', () => {
        player.initializeGrid(deck);
        const [row, col] = [0, 0];
        player.grid[row][col].isVisible = false;

        player.revealCard(row, col);

        expect(player.grid[row][col].isVisible).toBe(true);
    });

    test('doit remplacer une carte dans la grille', () => {
        player.initializeGrid(deck);
        const newCard = new Card(10);
        const [row, col] = [1, 2];

        player.replaceCard(row, col, newCard);
        expect(player.grid[row][col]).toBe(newCard);
    });

    test('doit calculer correctement le score du joueur', () => {
        player.grid = [
            [new Card(1), new Card(2), new Card(3), new Card(4)],
            [new Card(5), new Card(6), new Card(7), new Card(8)],
            [new Card(9), new Card(10), new Card(11), new Card(12)]
        ];

        player.calculateScore();
        expect(player.score).toBe(78);
    });

    test('doit détecter si toutes les cartes sont révélées', () => {
        player.grid = [
            [new Card(1, true), new Card(2, true), new Card(3, true), new Card(4, true)],
            [new Card(5, true), new Card(6, true), new Card(7, true), new Card(8, true)],
            [new Card(9, true), new Card(10, true), new Card(11, true), new Card(12, true)]
        ];

        expect(player.allCardsRevealed()).toBe(true);
    });

    test('ne doit pas détecter toutes les cartes révélées si une est cachée', () => {
        player.grid = [
            [new Card(1, true), new Card(2, true), new Card(3, false), new Card(4, true)],
            [new Card(5, true), new Card(6, true), new Card(7, true), new Card(8, true)],
            [new Card(9, true), new Card(10, true), new Card(11, true), new Card(12, true)]
        ];

        expect(player.allCardsRevealed()).toBe(false);
    });

    test('doit afficher la grille correctement', () => {
        player.grid = [
            [new Card(1, true), new Card(2, true), new Card(3, false), new Card(4, true)],
            [new Card(5, true), new Card(6, false), new Card(7, true), new Card(8, true)],
            [new Card(9, true), new Card(10, true), new Card(11, true), new Card(12, false)]
        ];

        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        player.displayGrid();

        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });

    test('doit supprimer une colonne correcte si toutes les valeurs sont identiques et visibles', () => {
        player.grid = [
            [new Card(3, true), new Card(1, true), new Card(2, true), new Card(4, true)],
            [new Card(3, true), new Card(5, true), new Card(7, true), new Card(8, true)],
            [new Card(3, true), new Card(9, true), new Card(11, true), new Card(12, true)]
        ];

        player.checkAndRemoveColumn(discardPile);

        expect(player.grid[0].length).toBe(3);
        expect(discardPile.length).toBe(3);
    });

    test('ne doit pas supprimer une colonne si une carte est cachée', () => {
        player.grid = [
            [new Card(3, true), new Card(1, true), new Card(2, true), new Card(4, true)],
            [new Card(3, true), new Card(5, true), new Card(7, true), new Card(8, true)],
            [new Card(3, false), new Card(9, true), new Card(11, true), new Card(12, true)]
        ];

        player.checkAndRemoveColumn(discardPile);

        expect(player.grid[0].length).toBe(4);
        expect(discardPile.length).toBe(0);
    });
});
