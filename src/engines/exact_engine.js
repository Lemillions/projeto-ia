import { ProbabilityEngine } from './probability_engine.js';
import { HandEvaluator } from '../core/hand_evaluator.js';

class ExactEngine extends ProbabilityEngine {
    constructor() {
        super();
    }

    calculate(gameState) {
        this.resetStats();
        

        this.results.handDistribution = {};
        const handNames = Object.values(HandEvaluator.RANKS).map(r => this.getHandName(r));
        
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

        const deck = gameState.deck;
        const availableCards = deck.cards;
        
        const neededCommunity = 5 - gameState.communityCards.length;
        
        const cpuCombos = this.getCombinations(availableCards, 2);
        
        for (const cpuHand of cpuCombos) {
            const cpuHandStr = cpuHand.map(c => c.toString()).join(',');
            const remainingForBoard = availableCards.filter(c => !cpuHand.includes(c));
            
            if (neededCommunity > 0) {
                const boardCombos = this.getCombinations(remainingForBoard, neededCommunity);
                for (const extraBoard of boardCombos) {
                    this.evaluateScenario(gameState, cpuHand, extraBoard, cpuHandStr);
                }
            } else {
                this.evaluateScenario(gameState, cpuHand, [], cpuHandStr);
            }
        }
        
        return this.computeProbabilities();
    }
    
    getHandName(rankVal) {
        return Object.keys(HandEvaluator.RANKS).find(key => HandEvaluator.RANKS[key] === rankVal);
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
        const total = this.results.playerWins + this.results.cpuWins + this.results.ties; 
        

        const distribution = {};
        for (const [rank, stat] of Object.entries(this.results.handDistribution)) {
             if (stat.count > 0) {
                 distribution[rank] = {
                     name: this.getReadableName(stat.name),
                     probability: stat.count / total,
                     winRate: stat.wins / stat.count,
                     lossRate: stat.losses / stat.count,
                     tieRate: stat.ties / stat.count,
                     causingHands: Array.from(stat.causingHands)
                 };
             }
        }

        return {
            playerWin: this.results.playerWins / total,
            cpuWin: this.results.cpuWins / total,
            tie: this.results.ties / total,
            totalScenarios: total,
            handDistribution: distribution
        };
    }

    getReadableName(constName) {

        return constName.toLowerCase().split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    getCombinations(arr, k) {
        if (k === 0) return [[]];
        if (arr.length === 0) return [];
        
        const [first, ...rest] = arr;
        
        const withFirst = this.getCombinations(rest, k - 1).map(c => [first, ...c]);
        const withoutFirst = this.getCombinations(rest, k);
        
        return [...withFirst, ...withoutFirst];
    }
}

export { ExactEngine };
