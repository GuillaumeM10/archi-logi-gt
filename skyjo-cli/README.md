# Projet Skyjo - version CLI

___

## IMPORTANT

**Le répertoire possède deux branches :**

- **main** : contient l'application des différents patterns, un jeu fonctionnel via API et une interface homme machine (
  bonus).
- **CLI** : contient l'application jouable en CLI, une clean architecture et des tests unitaires. (les instruction pour
  lancer l'application en CLI sont dans le README.md de la branche bonus)

___

## Changements par rapport au projet sur #main

### Lancement du projet

1. Se situer dans le répertoire skyjo-cli ```cd skyjo-cli```
2. Installer les dépendances ```pnpm i```
3. Lancer le projet ```pnpm start:dev```

### Comment jouer

Dans le terminal, une fois le programme lancé, vous serez guidé. Le but reste le même que sur la branche main : terminer
la partie avec le score le plus faible, en échangeant ou révélant les cartes de son jeu. 
<br> 
Cette fois, tout se passe dans le terminal, via des inputs numériques (sauf les noms des joueurs).

### L'architecture

Sur cette branche, l'architecture mise en place est la **clean archi**, avec la séparation des services, entités et la partie infrasctructure (pas de BDD ici, seules les inputs via CLI sont gérées)

### Tests

De plus sur cette branche, des tests sont présents afin de couvrir les différents aspects du domain. 
Le service de jeu n'est pas testé (on aurait pu vérifier que les appels se font bien aux entités), car moins important que vraiment bien tester les entités, avec toutes les features disponibles.
<br>
De plus, dans les tests seuls les fichiers de la clean archi sont inclus (pas le main.ts, pas les fichiers à la racine)
<br> 
<br> 
Une feature importante, difficile à illustrer lors des démos ou du jeu : si un joueur arrive à faire une colonne avec 3 cartes de la même valeur, alros cette colonne disparait et la défausse se voit ajouter les 3 cartes suppriées.
Cette feature est testée, cela permet de tester ce corner case.

Afin de lancer les tests, executez les commandes suivantes:
1. ```cd skyjo-ci```
2. ```pnpm test``` (pour simplement run les tests)
3. ```pnpm test:cov``` (pour run les tests et afficher le coverage globale de l'application)
