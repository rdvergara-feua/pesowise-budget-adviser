// Snake rules with no DOM in them, so they can be tested on their own.
// State: { snake: [{x,y}...] (head first), dir, queue, food, score, over, won }

export const COLS = 20;
export const ROWS = 20;

export function placeFood(state, rng = Math.random) {
  const taken = new Set(state.snake.map((p) => `${p.x},${p.y}`));
  const free = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) if (!taken.has(`${x},${y}`)) free.push({ x, y });
  }
  return free.length ? free[Math.floor(rng() * free.length)] : null;
}

export function newGame(rng = Math.random) {
  const state = {
    snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }],
    dir: { x: 1, y: 0 },
    queue: [],
    food: null,
    score: 0,
    over: false,
    won: false,
  };
  state.food = placeFood(state, rng);
  return state;
}

// Remember up to two turns so fast key taps aren't lost, and never allow a
// 180-degree reversal (which would instantly hit the snake's own neck).
export function queueTurn(state, dx, dy) {
  const last = state.queue.length ? state.queue[state.queue.length - 1] : state.dir;
  if (last.x === dx && last.y === dy) return;
  if (last.x === -dx && last.y === -dy) return;
  if (state.queue.length < 2) state.queue.push({ x: dx, y: dy });
}

export function step(state, rng = Math.random) {
  if (state.over) return state;
  if (state.queue.length) state.dir = state.queue.shift();

  const head = { x: state.snake[0].x + state.dir.x, y: state.snake[0].y + state.dir.y };
  const eats = state.food && head.x === state.food.x && head.y === state.food.y;

  if (head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS) {
    state.over = true;
    return state;
  }
  // The tail moves away this tick unless we are growing, so it is safe to enter.
  const body = eats ? state.snake : state.snake.slice(0, -1);
  if (body.some((p) => p.x === head.x && p.y === head.y)) {
    state.over = true;
    return state;
  }

  state.snake.unshift(head);
  if (eats) {
    state.score += 1;
    state.food = placeFood(state, rng);
    if (!state.food) state.over = state.won = true;
  } else {
    state.snake.pop();
  }
  return state;
}

// Milliseconds between moves: speeds up as you collect coins.
export const delay = (score) => Math.max(70, 150 - score * 4);
