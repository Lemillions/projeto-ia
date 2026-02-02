import { Card } from './src/core/card.js';
import { GameState } from './src/core/game_state.js';
import { ExactEngine } from './src/engines/exact_engine.js';

function debug() {
    console.log("Debugging Distribution...");

    const gameState = new GameState();
    gameState.setPlayerHand(new Card('A', 's'), new Card('K', 's'));
    gameState.setCommunityCards([
        new Card('J', 's'),
        new Card('5', 's'),
        new Card('2', 'd'),
        new Card('9', 'c')
    ]);

    const engine = new ExactEngine();
    const results = engine.calculate(gameState);
    
    console.log("Results keys:", Object.keys(results));
    if (results.handDistribution) {
        console.log("Hand Distribution keys:", Object.keys(results.handDistribution));
        const sampleKey = Object.keys(results.handDistribution)[0];
        console.log("Sample Entry:", JSON.stringify(results.handDistribution[sampleKey], null, 2));
    } else {
        console.error("handDistribution is MISSING from results!");
    }
}

debug();
