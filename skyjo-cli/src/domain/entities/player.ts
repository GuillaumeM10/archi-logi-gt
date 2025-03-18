import { Card } from './card';
import * as readlineSync from 'readline-sync';

export class Player {
    name: string;
    grid: Card[][];
    score: number;

    constructor(name: string) {
        this.name = name;
        this.grid = [];
        this.score = 0;
    }

    initializeGrid(deck: Card[]): void {
        this.grid = Array.from({ length: 3 }, () =>
            Array.from({ length: 4 }, () => deck.pop() as Card)
        );
    }

    revealCard(row: number, col: number): void {
        if (this.grid[row][col].isVisible) {
            console.log('❌ Cette carte est déjà visible.');
            row = readlineSync.questionInt('Ligne (1-3) : ') - 1;
            col = readlineSync.questionInt('Colonne (1-4) : ') - 1;
            this.revealCard(row, col);

            return;
        }
        this.grid[row][col].flip();
        console.log(`👀 ${this.name} a révélé une carte : ${this.grid[row][col].value}`);
    }

    replaceCard(row: number, col: number, newCard: Card): void {
        console.log(`🔄 ${this.name} remplace une carte (${row + 1}, ${col + 1})`);
        this.grid[row][col] = newCard;
    }

    calculateScore(): void {
        this.score = this.grid.flat()
            .reduce((total, card) => total + card.value, 0);
    }

    allCardsRevealed(): boolean {
        return this.grid.flat().every(card => card.isVisible);
    }

    displayGrid(): void {
        console.log(`📜 Grille de ${this.name}:`);
        this.grid.forEach(row => {
            console.log(row.map(card => (card.isVisible ? `[${card.value}]` : `[??]`)).join(' '));
        });
    }

    checkAndRemoveColumn(discardPile: Card[]): void {
        let columnsToRemove: number[] = [];

        for (let col = 0; col < this.grid[0].length; col++) {
            const columnCards = this.grid.map(row => row[col]);

            if (columnCards.every(card => card.isVisible && card.value === columnCards[0].value)) {
                columnsToRemove.push(col);
            }
        }

        if (columnsToRemove.length > 0) {
            console.log(`💥 ${this.name} a éliminé ${columnsToRemove.length} colonne(s) !`);

            columnsToRemove.reverse().forEach(col => {
                discardPile.push(...this.grid.map(row => row[col]));
                this.grid.forEach(row => row.splice(col, 1));
            });
        }
    }
}
