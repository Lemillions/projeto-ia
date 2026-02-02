import { Card } from './src/core/card.js';
import { GameState } from './src/core/game_state.js';
import { ExactEngine } from './src/engines/exact_engine.js';
import { MonteCarloEngine } from './src/engines/monte_carlo_engine.js';

function runTest() {
    console.log("Setting up Game State (Turn Phase)...");
    

    
    const gameState = new GameState();
    gameState.setPlayerHand(new Card('A', 's'), new Card('K', 's'));
    gameState.setCommunityCards([
        new Card('J', 's'),
        new Card('5', 's'),
        new Card('2', 'd'),
        new Card('9', 'c')
    ]);
    
    console.log("Player Hand: As Ks");
    console.log("Board: Js 5s 2d 9c");
    
    console.log("\nRunning Exact Engine...");
    const exactEngine = new ExactEngine();
    const startExact = performance.now();
    const exactResults = exactEngine.calculate(gameState);
    const endExact = performance.now();
    console.log(`Time: ${(endExact - startExact).toFixed(2)}ms`);
    console.log("Exact Results:", JSON.stringify(exactResults, null, 2));
    
    console.log("\nRunning Monte Carlo Engine (N=20000)...");
    const mcEngine = new MonteCarloEngine(20000);
    const startMC = performance.now();
    const mcResults = mcEngine.calculate(gameState);
    const endMC = performance.now();
    console.log(`Time: ${(endMC - startMC).toFixed(2)}ms`);
    console.log("Monte Carlo Results:", JSON.stringify(mcResults, null, 2));
    

    const diff = Math.abs(exactResults.playerWin - mcResults.playerWin);
    console.log(`\nDifference in Player Win Prob: ${(diff * 100).toFixed(4)}%`);
    
    if (diff < 0.02) {
        console.log("PASS: Results are within tolerance.");
    } else {
        console.error("WARNING: Results differ significantly!");
    }
}

runTest();
