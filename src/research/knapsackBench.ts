export interface KnapsackItem { id: number; weight: number; value: number }
export interface ClassicalBenchmarkReport {
  algorithmVersion: 'classical-knapsack-v1';
  seed: number;
  itemCount: number;
  capacity: number;
  itemsChecksum: string;
  baseline: { name: 'Exact dynamic programming'; complexity: 'O(n × capacity)'; value: number; medianMs: number };
  heuristic: { name: 'Value/weight greedy'; complexity: 'O(n log n)'; value: number; medianMs: number };
  optimalityGapPercent: number;
  warmups: number;
  repetitions: number;
}

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

export function generateKnapsackInstance(seed: number, itemCount: number): KnapsackItem[] {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffff_ffff) throw new RangeError('Seed must be an unsigned 32-bit integer.');
  if (!Number.isInteger(itemCount) || itemCount < 1 || itemCount > 1_000) throw new RangeError('Item count must be from 1 to 1,000.');
  const random = seededRandom(seed);
  return Array.from({ length: itemCount }, (_, id) => ({
    id,
    weight: 1 + Math.floor(random() * 40),
    value: 10 + Math.floor(random() * 91),
  }));
}

export function solveKnapsackDynamicProgramming(items: KnapsackItem[], capacity: number): number {
  validateInput(items, capacity);
  const best = new Array<number>(capacity + 1).fill(0);
  for (const item of items) {
    for (let remaining = capacity; remaining >= item.weight; remaining -= 1) {
      best[remaining] = Math.max(best[remaining], best[remaining - item.weight] + item.value);
    }
  }
  return best[capacity];
}

export function solveKnapsackGreedy(items: KnapsackItem[], capacity: number): number {
  validateInput(items, capacity);
  const ranked = [...items].sort((left, right) => right.value / right.weight - left.value / left.weight || left.id - right.id);
  let remaining = capacity;
  let value = 0;
  for (const item of ranked) {
    if (item.weight <= remaining) {
      remaining -= item.weight;
      value += item.value;
    }
  }
  return value;
}

function validateInput(items: KnapsackItem[], capacity: number) {
  if (!Array.isArray(items) || items.length < 1 || items.length > 1_000) throw new RangeError('Provide between 1 and 1,000 items.');
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 10_000) throw new RangeError('Capacity must be from 1 to 10,000.');
  for (const item of items) {
    if (!item || !Number.isInteger(item.weight) || item.weight < 1 || !Number.isInteger(item.value) || item.value < 0 || !Number.isInteger(item.id)) {
      throw new RangeError('Every item needs an integer id, positive weight, and non-negative value.');
    }
  }
}

function median(values: number[]) {
  const ordered = [...values].sort((left, right) => left - right);
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2 ? ordered[middle] : (ordered[middle - 1] + ordered[middle]) / 2;
}

function fingerprint(items: KnapsackItem[]) {
  let hash = 0x811c9dc5;
  for (const byte of new TextEncoder().encode(items.map(({ id, weight, value }) => `${id}:${weight}:${value};`).join(''))) {
    hash ^= byte;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

export function runClassicalBenchmark(seed: number, itemCount: number, capacity: number): ClassicalBenchmarkReport {
  const items = generateKnapsackInstance(seed, itemCount);
  validateInput(items, capacity);
  const warmups = 3;
  const repetitions = 7;
  const baselineTimes: number[] = [];
  const heuristicTimes: number[] = [];
  const measure = (solve: () => number, samples: number[]) => {
    const started = performance.now();
    solve();
    samples.push(performance.now() - started);
  };

  for (let run = 0; run < warmups; run += 1) {
    solveKnapsackDynamicProgramming(items, capacity);
    solveKnapsackGreedy(items, capacity);
  }
  for (let run = 0; run < repetitions; run += 1) {
    if (run % 2 === 0) {
      measure(() => solveKnapsackDynamicProgramming(items, capacity), baselineTimes);
      measure(() => solveKnapsackGreedy(items, capacity), heuristicTimes);
    } else {
      measure(() => solveKnapsackGreedy(items, capacity), heuristicTimes);
      measure(() => solveKnapsackDynamicProgramming(items, capacity), baselineTimes);
    }
  }

  const baselineValue = solveKnapsackDynamicProgramming(items, capacity);
  const heuristicValue = solveKnapsackGreedy(items, capacity);
  return {
    algorithmVersion: 'classical-knapsack-v1', seed: seed >>> 0, itemCount, capacity,
    itemsChecksum: fingerprint(items),
    baseline: { name: 'Exact dynamic programming', complexity: 'O(n × capacity)', value: baselineValue, medianMs: median(baselineTimes) },
    heuristic: { name: 'Value/weight greedy', complexity: 'O(n log n)', value: heuristicValue, medianMs: median(heuristicTimes) },
    optimalityGapPercent: baselineValue === 0 ? 0 : Number((((baselineValue - heuristicValue) / baselineValue) * 100).toFixed(2)),
    warmups, repetitions,
  };
}
