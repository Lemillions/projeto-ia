import { Card } from './src/core/card.js';
import { HandEvaluator } from './src/core/hand_evaluator.js';

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || "Assertion failed");
    }
    console.log("PASS:", message);
}

function test() {
    console.log("Testing HandEvaluator...");


    const royal = [
        new Card('A', 'h'), new Card('K', 'h'), new Card('Q', 'h'), 
        new Card('J', 'h'), new Card('T', 'h'), new Card('2', 'c'), new Card('3', 'd')
    ];
    const resRoyal = HandEvaluator.evaluate(royal);
    assert(resRoyal.rank === HandEvaluator.RANKS.ROYAL_FLUSH, "Royal Flush detection");


    const sf = [
        new Card('9', 'h'), new Card('8', 'h'), new Card('7', 'h'), 
        new Card('6', 'h'), new Card('5', 'h'), new Card('A', 'c'), new Card('K', 'd')
    ];
    const resSf = HandEvaluator.evaluate(sf);
    assert(resSf.rank === HandEvaluator.RANKS.STRAIGHT_FLUSH, "Straight Flush detection");


    const quads = [
        new Card('A', 'h'), new Card('A', 'c'), new Card('A', 'd'), 
        new Card('A', 's'), new Card('K', 'h'), new Card('2', 'c'), new Card('3', 'd')
    ];
    const resQuads = HandEvaluator.evaluate(quads);
    assert(resQuads.rank === HandEvaluator.RANKS.FOUR_OF_A_KIND, "Four of a Kind detection");


    const fh = [
        new Card('K', 'h'), new Card('K', 'c'), new Card('K', 'd'), 
        new Card('Q', 's'), new Card('Q', 'h'), new Card('2', 'c'), new Card('3', 'd')
    ];
    const resFh = HandEvaluator.evaluate(fh);
    assert(resFh.rank === HandEvaluator.RANKS.FULL_HOUSE, "Full House detection");


    const flush = [
        new Card('A', 'h'), new Card('J', 'h'), new Card('8', 'h'), 
        new Card('4', 'h'), new Card('2', 'h'), new Card('9', 'c'), new Card('T', 'd')
    ];
    const resFlush = HandEvaluator.evaluate(flush);
    assert(resFlush.rank === HandEvaluator.RANKS.FLUSH, "Flush detection");


    const wheel = [
        new Card('A', 'h'), new Card('2', 'c'), new Card('3', 'd'), 
        new Card('4', 's'), new Card('5', 'h'), new Card('9', 'c'), new Card('T', 'd')
    ];
    const resWheel = HandEvaluator.evaluate(wheel);
    assert(resWheel.rank === HandEvaluator.RANKS.STRAIGHT, "Wheel Straight detection");

    console.log("All tests passed!");
}

test();
