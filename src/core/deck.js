import { Card } from './card.js';


class Deck {
    constructor() {
        this.cards = [];
        this.reset();
    }

    reset() {
        this.cards = [];
        const suits = Object.values(Card.SUITS);
        const ranks = Object.keys(Card.RANKS);

        for (const suit of suits) {
            for (const rank of ranks) {
                this.cards.push(new Card(rank, suit));
            }
        }
    }

    shuffle() {

        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    deal() {
        if (this.cards.length === 0) throw new Error("Deck is empty");
        return this.cards.pop();
    }

    removeCards(cardsToRemove) {

        this.cards = this.cards.filter(card => 
            !cardsToRemove.some(rem => rem.equals(card))
        );
    }
    
    remaining() {
        return this.cards.length;
    }
}

export { Deck };
