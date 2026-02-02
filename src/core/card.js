
class Card {
    static SUITS = {
        CLUBS: 'c',
        DIAMONDS: 'd',
        HEARTS: 'h',
        SPADES: 's'
    };

    static RANKS = {
        '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, 
        '8': 8, '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
    };

    constructor(rank, suit) {
        if (!Card.RANKS[rank]) throw new Error(`Invalid rank: ${rank}`);
        if (!Object.values(Card.SUITS).includes(suit)) throw new Error(`Invalid suit: ${suit}`);
        
        this.rank = rank;
        this.suit = suit;
        this.value = Card.RANKS[rank];
    }

    toString() {
        return `${this.rank}${this.suit}`;
    }

    equals(other) {
        return this.rank === other.rank && this.suit === other.suit;
    }
}

export { Card };
