import { Deck } from './deck.js';

class GameState {
    constructor() {
        this.deck = new Deck();
        this.playerHand = [];
        this.cpuHand = [];
        this.communityCards = [];
    }

    reset() {
        this.deck.reset();
        this.deck.shuffle();
        this.playerHand = [];
        this.cpuHand = [];
        this.communityCards = [];
    }

    setPlayerHand(c1, c2) {
        this.playerHand = [c1, c2];
        this.updateDeck();
    }

    setCPUHand(c1, c2) {
        this.cpuHand = [c1, c2];
        this.updateDeck();
    }

    setCommunityCards(cards) {
        this.communityCards = cards;
        this.updateDeck();
    }

    addCommunityCard(card) {
        this.communityCards.push(card);
        this.updateDeck();
    }

    updateDeck() {

        const knownCards = [...this.playerHand, ...this.communityCards];

        if (this.cpuHand.length > 0) {
            knownCards.push(...this.cpuHand);
        }
        
        this.deck.reset();
        this.deck.removeCards(knownCards);
    }
    
    clone() {
        const clone = new GameState();
        clone.playerHand = [...this.playerHand];
        clone.cpuHand = [...this.cpuHand];
        clone.communityCards = [...this.communityCards];

        clone.updateDeck();
        return clone;
    }
}

export { GameState };
