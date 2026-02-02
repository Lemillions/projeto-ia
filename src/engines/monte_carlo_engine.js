import { ProbabilityEngine } from './probability_engine.js';
import { HandEvaluator } from '../core/hand_evaluator.js';

class MonteCarloEngine extends ProbabilityEngine {
    constructor(simulations = 10000) {
        super();
        this.simulations = simulations;
    }

    calculate(gameState) {
        this.resetStats();
        this.results.totalSimulations = this.simulations;


        this.results.handDistribution = {};
        for (const [key, value] of Object.entries(HandEvaluator.RANKS)) {
             this.results.handDistribution[value] = {
                 name: key,
                 count: 0,
                 wins: 0,
                 losses: 0,
                 ties: 0,
                 causingHands: new Set()
             };
        }

        const availableCards = [...gameState.deck.cards];
        const neededCommunity = 5 - gameState.communityCards.length;
        
        for (let i = 0; i < this.simulations; i++) {
            const cardsNeeded = 2 + neededCommunity;
            

            
            const currentDeck = [...availableCards];
            

             for (let j = 0; j < cardsNeeded; j++) {
                const r = j + Math.floor(Math.random() * (currentDeck.length - j));
                [currentDeck[j], currentDeck[r]] = [currentDeck[r], currentDeck[j]];
            }
            
            const cpuHand = [currentDeck[0], currentDeck[1]];
            const cpuHandStr = cpuHand.map(c => c.toString()).join(',');
            const extraBoard = currentDeck.slice(2, 2 + neededCommunity);
            
            this.evaluateScenario(gameState, cpuHand, extraBoard, cpuHandStr);
        }

        return this.computeProbabilities();
    }

    evaluateScenario(gameState, cpuHand, extraBoard, cpuHandStr) {
        const finalBoard = [...gameState.communityCards, ...extraBoard];
        
        const playerResult = HandEvaluator.evaluate([...gameState.playerHand, ...finalBoard]);
        const cpuResult = HandEvaluator.evaluate([...cpuHand, ...finalBoard]);
        
        const comparison = HandEvaluator.compareHands(playerResult, cpuResult);
        

        const rankStats = this.results.handDistribution[cpuResult.rank];
        rankStats.count++;
        rankStats.causingHands.add(cpuHandStr);
        
        if (comparison > 0) {
            this.results.playerWins++;
            rankStats.losses++;
        } else if (comparison < 0) {
            this.results.cpuWins++;
            rankStats.wins++;
        } else {
            this.results.ties++;
            rankStats.ties++;
        }
    }

    computeProbabilities() {
        const total = this.simulations;
        
        const distribution = {};
        for (const [rank, stat] of Object.entries(this.results.handDistribution)) {
             if (stat.count > 0) {
                 distribution[rank] = {
                     name: this.getReadableName(stat.name),
                     probability: stat.count / total,
                     winRate: stat.wins / stat.count,
                     causingHands: Array.from(stat.causingHands)
                 };
             }
        }

        return {
            playerWin: this.results.playerWins / total,
            cpuWin: this.results.cpuWins / total,
            tie: this.results.ties / total,
            totalSimulations: total,
            handDistribution: distribution
        };
    }
    
    getReadableName(constName) {
        return constName.toLowerCase().split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
}

export { MonteCarloEngine };
