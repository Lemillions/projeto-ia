import { Card } from './card.js';

class HandEvaluator {
    static RANKS = {
        HIGH_CARD: 1,
        PAIR: 2,
        TWO_PAIR: 3,
        THREE_OF_A_KIND: 4,
        STRAIGHT: 5,
        FLUSH: 6,
        FULL_HOUSE: 7,
        FOUR_OF_A_KIND: 8,
        STRAIGHT_FLUSH: 9,
        ROYAL_FLUSH: 10
    };


    static evaluate(cards) {
        if (cards.length < 5) throw new Error("Need at least 5 cards to evaluate");
        

        if (cards.length > 5) {
            return this.findBestHand(cards);
        }

        return this.rank5CardHand(cards);
    }

    static findBestHand(cards) {
        const combos = this.getCombinations(cards, 5);
        let bestHand = null;

        for (const combo of combos) {
            const result = this.rank5CardHand(combo);
            if (!bestHand || this.compareHands(result, bestHand) > 0) {
                bestHand = result;
            }
        }
        return bestHand;
    }

    static getCombinations(arr, k) {
        if (k === 0) return [[]];
        if (arr.length === 0) return [];
        
        const [first, ...rest] = arr;
        
        const withFirst = this.getCombinations(rest, k - 1).map(c => [first, ...c]);
        const withoutFirst = this.getCombinations(rest, k);
        
        return [...withFirst, ...withoutFirst];
    }

    static compareHands(h1, h2) {
        if (h1.rank !== h2.rank) {
            return h1.rank - h2.rank;
        }
        for (let i = 0; i < h1.tieBreakers.length; i++) {
            if (h1.tieBreakers[i] !== h2.tieBreakers[i]) {
                return h1.tieBreakers[i] - h2.tieBreakers[i];
            }
        }
        return 0;
    }

    static rank5CardHand(cards) {

        const sorted = [...cards].sort((a, b) => b.value - a.value);
        
        const isFlush = sorted.every(c => c.suit === sorted[0].suit);
        

        let isStraight = true;
        for (let i = 0; i < 4; i++) {
            if (sorted[i].value - sorted[i+1].value !== 1) {

                if (i === 0 && sorted[0].value === 14 && sorted[1].value === 5) {

                     const isLowStraight = sorted[1].value === 5 && sorted[2].value === 4 && sorted[3].value === 3 && sorted[4].value === 2;
                     if (isLowStraight) {
                         isStraight = true;

                         break;
                     }
                }
                isStraight = false;
                break;
            }
        }


        
        let straightHighCard = sorted[0].value;
        if (!isStraight && sorted[0].value === 14) {

             const wheel = [14, 5, 4, 3, 2];
             if (sorted.every((c, i) => c.value === wheel[i])) {
                 isStraight = true;
                 straightHighCard = 5;
             }
        }


        if (isStraight && isFlush) {
             if (straightHighCard === 14 && sorted[1].value === 13) return { rank: this.RANKS.ROYAL_FLUSH, name: 'Royal Flush', tieBreakers: [] };
             return { rank: this.RANKS.STRAIGHT_FLUSH, name: 'Straight Flush', tieBreakers: [straightHighCard] };
        }

        const counts = {};
        for (const c of sorted) {
            counts[c.value] = (counts[c.value] || 0) + 1;
        }
        
        const countValues = Object.values(counts);
        const uniqueRanks = Object.keys(counts).map(Number).sort((a, b) => b - a);
        
        if (countValues.includes(4)) {
            const quadRank = uniqueRanks.find(r => counts[r] === 4);
            const kicker = uniqueRanks.find(r => counts[r] === 1);
            return { rank: this.RANKS.FOUR_OF_A_KIND, name: 'Four of a Kind', tieBreakers: [quadRank, kicker] };
        }
        
        if (countValues.includes(3) && countValues.includes(2)) {
            const tripRank = uniqueRanks.find(r => counts[r] === 3);
            const pairRank = uniqueRanks.find(r => counts[r] === 2);
            return { rank: this.RANKS.FULL_HOUSE, name: 'Full House', tieBreakers: [tripRank, pairRank] };
        }
        
        if (isFlush) {
            return { rank: this.RANKS.FLUSH, name: 'Flush', tieBreakers: sorted.map(c => c.value) };
        }
        
        if (isStraight) {
            return { rank: this.RANKS.STRAIGHT, name: 'Straight', tieBreakers: [straightHighCard] };
        }
        
        if (countValues.includes(3)) {
            const tripRank = uniqueRanks.find(r => counts[r] === 3);
            const kickers = uniqueRanks.filter(r => r !== tripRank);
            return { rank: this.RANKS.THREE_OF_A_KIND, name: 'Three of a Kind', tieBreakers: [tripRank, ...kickers] };
        }
        
        if (countValues.filter(x => x === 2).length === 2) {
            const pairs = uniqueRanks.filter(r => counts[r] === 2);
            const kicker = uniqueRanks.find(r => counts[r] === 1);
            return { rank: this.RANKS.TWO_PAIR, name: 'Two Pair', tieBreakers: [...pairs, kicker] };
        }
        
        if (countValues.includes(2)) {
            const pairRank = uniqueRanks.find(r => counts[r] === 2);
            const kickers = uniqueRanks.filter(r => r !== pairRank);
            return { rank: this.RANKS.PAIR, name: 'Pair', tieBreakers: [pairRank, ...kickers] };
        }
        
        return { rank: this.RANKS.HIGH_CARD, name: 'High Card', tieBreakers: sorted.map(c => c.value) };
    }
}

export { HandEvaluator };
