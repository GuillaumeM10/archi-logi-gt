import {Game} from "../../../src/domain/entities/game";
import {Player} from "../../../src/domain/entities/player";

describe('Game', () => {
    let game: Game;

    beforeEach(() => {
        game = new Game();
    });

    test('doit initialiser une partie avec un deck mélangé', () => {
        expect(game.deck.length).toBe(150);
        expect(game.discardPile.length).toBe(0);
        expect(game.players.length).toBe(0);
        expect(game.started).toBe(false);
    });

    test("doit ajouter un joueur avant le début de la partie", () => {
        const player = new Player("Alice");
        game.addPlayer(player);
        expect(game.players.length).toBe(1);
        expect(game.players[0].name).toBe("Alice");
    });

    test("ne doit pas ajouter un joueur après le début de la partie", () => {
        game.started = true;
        const player = new Player("Bob");
        game.addPlayer(player);
        expect(game.players.length).toBe(0);
    });

    test("ne doit pas démarrer avec moins de 2 joueurs", () => {
        game.addPlayer(new Player("Alice"));
        game.startGame();
        expect(game.started).toBe(true);
    });

    test("doit démarrer correctement avec au moins 2 joueurs", () => {
        game.addPlayer(new Player("Alice"));
        game.addPlayer(new Player("Bob"));
        game.startGame();
        expect(game.started).toBe(true);
        expect(game.discardPile.length).toBe(1);
    });

    test("doit permettre à un joueur de piocher une carte cachée", () => {
        game.addPlayer(new Player("Alice"));
        game.addPlayer(new Player("Bob"));
        game.startGame();
        const previousDeckSize = game.deck.length;

        game.drawCard(false);
        expect(game.deck.length).toBe(previousDeckSize - 1);
        expect(game.mustPlayDrawnCard).toBe(true);
    });

    test("doit permettre à un joueur de piocher une carte de la défausse", () => {
        game.addPlayer(new Player("Alice"));
        game.addPlayer(new Player("Bob"));
        game.startGame();
        const previousDiscardPileSize = game.discardPile.length;

        game.drawCard(true);
        expect(game.discardPile.length).toBe(previousDiscardPileSize - 1);
        expect(game.mustPlayDrawnCard).toBe(true);
    });

    test("ne doit pas permettre à un joueur de jouer une carte sans en avoir pioché une", () => {
        game.addPlayer(new Player("Alice"));
        game.addPlayer(new Player("Bob"));
        game.startGame();

        console.log = jest.fn();
        game.playDrawnCard(0, 0);

        expect(console.log).toHaveBeenCalledWith("❌ Vous devez d’abord piocher une carte.");
    });

    test("doit permettre de jouer une carte piochée", () => {
        game.addPlayer(new Player("Alice"));
        game.addPlayer(new Player("Bob"));
        game.startGame();

        game.drawCard(false);
        const drawnValue = game.drawnCard?.value;

        game.playDrawnCard(0, 0);
        game.nextTurn()
        expect(game.mustPlayDrawnCard).toBe(false);
        expect(game.getCurrentPlayer().grid[0][0].value).toBe(drawnValue);
    });

    test("doit gérer la fin de la partie correctement", () => {
        game.addPlayer(new Player("Alice"));
        game.addPlayer(new Player("Bob"));
        game.startGame();

        game.trackFirstPlayerToFinish();
        game.endGame();
        expect(game.gameOver).toBe(true);
    });

    test("doit calculer les scores correctement à la fin de la partie", () => {
        const alice = new Player("Alice");
        const bob = new Player("Bob");
        game.addPlayer(alice);
        game.addPlayer(bob);
        game.startGame();

        game.endGame();

        expect(alice.score).toBeDefined();
        expect(bob.score).toBeDefined();
    });
});
