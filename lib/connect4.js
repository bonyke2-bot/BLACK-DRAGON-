class ConnectFour {
    constructor(playerRed, playerYellow) {
        this.rows = 6;
        this.cols = 7;
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(null));
        this.playerRed = playerRed;
        this.playerYellow = playerYellow;
        this.currentTurn = playerRed; // Red starts
        this.moves = 0;
        this.winner = null;
        this.lastMove = null;
    }

    dropDisc(isYellow, col) {
        // Validate column
        if (col < 0 || col >= this.cols) return false;
        if (this.winner) return false;

        // Find first empty row from bottom
        for (let row = this.rows - 1; row >= 0; row--) {
            if (this.board[row][col] === null) {
                this.board[row][col] = isYellow ? 'Y' : 'R';
                this.moves++;
                this.lastMove = {row, col};

                // Check for win
                if (this.checkWin(row, col)) {
                    this.winner = isYellow ? this.playerYellow : this.playerRed;
                }

                // Switch turn
                this.currentTurn = isYellow ? this.playerRed : this.playerYellow;
                return true;
            }
        }
        return false; // Column is full
    }

    checkWin(row, col) {
        const player = this.board[row][col];
        if (!player) return false;

        // Directions: horizontal, vertical, diagonal down-right, diagonal up-right
        const directions = [
            [0, 1],   // right
            [1, 0],   // down
            [1, 1],   // down-right
            [-1, 1]   // up-right
        ];

        for (const [dr, dc] of directions) {
            let count = 1;

            // Check positive direction
            for (let i = 1; i < 4; i++) {
                const newRow = row + dr * i;
                const newCol = col + dc * i;
                if (newRow < 0 || newRow >= this.rows || newCol < 0 || newCol >= this.cols) break;
                if (this.board[newRow][newCol] === player) count++;
                else break;
            }

            // Check negative direction
            for (let i = 1; i < 4; i++) {
                const newRow = row - dr * i;
                const newCol = col - dc * i;
                if (newRow < 0 || newRow >= this.rows || newCol < 0 || newCol >= this.cols) break;
                if (this.board[newRow][newCol] === player) count++;
                else break;
            }

            if (count >= 4) return true;
        }

        return false;
    }

    isDraw() {
        return this.moves === this.rows * this.cols && !this.winner;
    }

    render() {
        let boardStr = '⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n';

        // Top column numbers
        boardStr += '1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣\n';
        boardStr += '⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n';

        // Board
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.board[row][col];
                if (cell === 'R') boardStr += '🔴';
                else if (cell === 'Y') boardStr += '🟡';
                else boardStr += '⚪';
            }
            boardStr += '\n';
        }

        // Bottom border
        boardStr += '⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n';

        return boardStr;
    }

    getBoard() {
        return this.board.map(row => [...row]);
    }
}

module.exports = ConnectFour;
