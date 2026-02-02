class ProbabilityEngine {
    constructor() {
        this.results = {
            playerWins: 0,
            cpuWins: 0,
            ties: 0,
            totalSimulations: 0
        };
    }

    calculate(gameState) {
        throw new Error("Method 'calculate' must be implemented.");
    }
    
    resetStats() {
        this.results = {
            playerWins: 0,
            cpuWins: 0,
            ties: 0,
            totalSimulations: 0
        };
    }
}

export { ProbabilityEngine };
