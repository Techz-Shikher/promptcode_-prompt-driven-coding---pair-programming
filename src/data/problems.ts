import { Problem, ProblemPack } from '../types';

export const PROBLEMS: Problem[] = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    category: 'solve',
    difficulty: 'Easy',
    acceptance: '53.4%',
    tags: ['Array', 'Hash Table', 'Two Pointers'],
    learningObjective: 'Master prompting for optimal O(N) lookup using hash maps instead of O(N²) nested loops.',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: 'nums = [2, 7, 11, 15], target = 9',
        output: '[0, 1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: 'nums = [3, 2, 4], target = 6',
        output: '[1, 2]',
        explanation: 'nums[1] + nums[2] == 6, we return [1, 2].'
      },
      {
        input: 'nums = [3, 3], target = 6',
        output: '[0, 1]',
        explanation: 'nums[0] + nums[1] == 6, we return [0, 1].'
      }
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    recommendedPrompt: 'Solve the DSA question "Two Sum" strictly using the 7-section format: 1. Restating the problem, 2. Naming the technique, 3. Key observations, 4. The algorithm, 5. Correctness arguments, 6. Complexity analyses, 7. Potential pitfalls.',
    promptTips: [
      'Strictly mandates the 7 canonical DSA sections (Restating, Technique, Observations, Algorithm, Correctness, Complexity, Pitfalls).',
      'Forces single-pass O(N) Hash Map strategy over quadratic brute force.',
      'Demands loop invariant proof and boundary edge case disclosure.'
    ],
    starterCode: {
      typescript: `export function twoSum(nums: number[], target: number): number[] {
  // Write your prompt on the right to generate optimal step-by-step code
  return [];
}`,
      python: `def twoSum(nums: list[int], target: int) -> list[int]:
    # Prompt the AI to solve using a single pass hash table
    return []`,
      cpp: `#include <vector>
#include <unordered_map>

std::vector<int> twoSum(std::vector<int>& nums, int target) {
    // Prompt the AI to solve with std::unordered_map
    return {};
}`,
      java: `import java.util.HashMap;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Prompt the AI to solve with HashMap
        return new int[]{};
    }
}`,
      go: `package main

func twoSum(nums []int, target int) []int {
    // Prompt the AI to solve with map[int]int
    return []int{}
}`
    },
    testCases: [
      { id: 'tc1', input: 'nums = [2, 7, 11, 15], target = 9', expected: '[0, 1]', label: 'Standard positive array' },
      { id: 'tc2', input: 'nums = [3, 2, 4], target = 6', expected: '[1, 2]', label: 'Non-sorted elements' },
      { id: 'tc3', input: 'nums = [-1, -2, -3, -4, -5], target = -8', expected: '[2, 4]', label: 'Negative integers' },
      { id: 'tc4', input: 'nums = [0, 4, 3, 0], target = 0', expected: '[0, 3]', label: 'Zero values' }
    ]
  },
  {
    id: 'longest-substring-without-repeating',
    title: 'Longest Substring Without Repeating Characters',
    category: 'solve',
    difficulty: 'Medium',
    acceptance: '34.8%',
    tags: ['Hash Table', 'String', 'Sliding Window'],
    learningObjective: 'Learn sliding window prompt structures: expanding right pointer, contracting left pointer.',
    description: `Given a string \`s\`, find the length of the **longest substring** without duplicate characters.

A substring is a contiguous non-empty sequence of characters within a string.`,
    examples: [
      {
        input: 's = "abcabcbb"',
        output: '3',
        explanation: 'The answer is "abc", with the length of 3.'
      },
      {
        input: 's = "bbbbb"',
        output: '1',
        explanation: 'The answer is "b", with the length of 1.'
      },
      {
        input: 's = "pwwkew"',
        output: '3',
        explanation: 'The answer is "wke", with the length of 3. Notice that "pwke" is a subsequence and not a substring.'
      }
    ],
    constraints: [
      '0 <= s.length <= 5 * 10^4',
      's consists of English letters, digits, symbols and spaces.'
    ],
    recommendedPrompt: 'Solve the DSA question "Longest Substring Without Repeating Characters" strictly using the 7-section format: 1. Restating the problem, 2. Naming the technique, 3. Key observations, 4. The algorithm, 5. Correctness arguments, 6. Complexity analyses, 7. Potential pitfalls.',
    promptTips: [
      'Demands the 7 canonical DSA sections without code fluff.',
      'Specifies sliding window with dynamic index contraction.',
      'Forces explicit verification of the key pitfall: repeated char before left pointer.'
    ],
    starterCode: {
      typescript: `export function lengthOfLongestSubstring(s: string): number {
  // Use prompt to formulate sliding window algorithm
  return 0;
}`,
      python: `def lengthOfLongestSubstring(s: str) -> int:
    # Use prompt to formulate sliding window algorithm
    return 0`,
      cpp: `#include <string>
#include <unordered_map>
#include <algorithm>

int lengthOfLongestSubstring(std::string s) {
    return 0;
}`,
      java: `import java.util.HashMap;

class Solution {
    public int lengthOfLongestSubstring(String s) {
        return 0;
    }
}`,
      go: `package main

func lengthOfLongestSubstring(s string) int {
    return 0
}`
    },
    testCases: [
      { id: 'tc1', input: 's = "abcabcbb"', expected: '3', label: 'Mixed characters' },
      { id: 'tc2', input: 's = "bbbbb"', expected: '1', label: 'All identical chars' },
      { id: 'tc3', input: 's = "pwwkew"', expected: '3', label: 'Repeating middle char' },
      { id: 'tc4', input: 's = ""', expected: '0', label: 'Empty string boundary' }
    ]
  },
  {
    id: 'trapping-rain-water',
    title: 'Trapping Rain Water',
    category: 'solve',
    difficulty: 'Hard',
    acceptance: '61.8%',
    tags: ['Array', 'Two Pointers', 'Dynamic Programming', 'Monotonic Stack'],
    learningObjective: 'Prompt for two-pointer invariants or monotonic stack boundary traps with O(1) space optimization.',
    description: `Given \`n\` non-negative integers representing an elevation map where the width of each bar is \`1\`, compute how much water it can trap after raining.`,
    examples: [
      {
        input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]',
        output: '6',
        explanation: 'The above elevation map is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water are trapped.'
      },
      {
        input: 'height = [4,2,0,3,2,5]',
        output: '9',
        explanation: 'Water trapped across valleys totals 9 units.'
      }
    ],
    constraints: [
      'n == height.length',
      '1 <= n <= 2 * 10^4',
      '0 <= height[i] <= 10^5'
    ],
    recommendedPrompt: 'Solve the DSA question "Trapping Rain Water" strictly using the 7-section format: 1. Restating the problem, 2. Naming the technique, 3. Key observations, 4. The algorithm, 5. Correctness arguments, 6. Complexity analyses, 7. Potential pitfalls.',
    promptTips: [
      'Enforce two-pointer invariant: water at index i is determined by min(maxLeft, maxRight) - height[i].',
      'Explicitly eliminate auxiliary array requirement to achieve strict O(1) space.',
      'Mandate edge case handling for strictly increasing or decreasing elevations.'
    ],
    starterCode: {
      typescript: `export function trap(height: number[]): number {
  // Solve with two-pointer O(1) space or monotonic stack
  return 0;
}`,
      python: `def trap(height: list[int]) -> int:
    return 0`,
      cpp: `#include <vector>
#include <algorithm>

int trap(std::vector<int>& height) {
    return 0;
}`,
      java: `class Solution {
    public int trap(int[] height) {
        return 0;
    }
}`,
      go: `func trap(height []int) int {
    return 0
}`
    },
    testCases: [
      { id: 'tc1', input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', expected: '6', label: 'Classic multi-valley elevation' },
      { id: 'tc2', input: 'height = [4,2,0,3,2,5]', expected: '9', label: 'Deep center canyon' },
      { id: 'tc3', input: 'height = [1,2,3,4,5]', expected: '0', label: 'Monotonically increasing (no water trapped)' },
      { id: 'tc4', input: 'height = [5,4,3,2,1]', expected: '0', label: 'Monotonically decreasing' }
    ]
  },
  {
    id: 'coin-change',
    title: 'Coin Change',
    category: 'solve',
    difficulty: 'Medium',
    acceptance: '44.2%',
    tags: ['Dynamic Programming', 'Breadth-First Search', 'Array'],
    learningObjective: 'Master bottom-up dynamic programming prompts, state transitions, and unreachable amount flags (-1).',
    description: `You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money.

Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return \`-1\`.

You may assume that you have an infinite number of each kind of coin.`,
    examples: [
      {
        input: 'coins = [1, 2, 5], amount = 11',
        output: '3',
        explanation: '11 = 5 + 5 + 1 (3 coins)'
      },
      {
        input: 'coins = [2], amount = 3',
        output: '-1',
        explanation: 'Amount 3 cannot be formed using denomination 2.'
      },
      {
        input: 'coins = [1], amount = 0',
        output: '0',
        explanation: '0 coins needed for amount 0.'
      }
    ],
    constraints: [
      '1 <= coins.length <= 12',
      '1 <= coins[i] <= 2^31 - 1',
      '0 <= amount <= 10^4'
    ],
    recommendedPrompt: 'Solve the DSA question "Coin Change" strictly using the 7-section format: 1. Restating the problem, 2. Naming the technique, 3. Key observations, 4. The algorithm, 5. Correctness arguments, 6. Complexity analyses, 7. Potential pitfalls.',
    promptTips: [
      'Demand bottom-up 1D DP table where dp[i] = min number of coins for amount i.',
      'Ensure dp table is initialized with amount + 1 rather than Infinity to prevent arithmetic overflow.',
      'Check amount = 0 base case explicitly.'
    ],
    starterCode: {
      typescript: `export function coinChange(coins: number[], amount: number): number {
  // Bottom-up DP: dp[i] = min(dp[i], dp[i - coin] + 1)
  return -1;
}`,
      python: `def coinChange(coins: list[int], amount: int) -> int:
    return -1`,
      cpp: `#include <vector>
#include <algorithm>

int coinChange(std::vector<int>& coins, int amount) {
    return -1;
}`,
      java: `import java.util.Arrays;

class Solution {
    public int coinChange(int[] coins, int amount) {
        return -1;
    }
}`,
      go: `func coinChange(coins []int, amount int) int {
    return -1
}`
    },
    testCases: [
      { id: 'tc1', input: 'coins = [1,2,5], amount = 11', expected: '3', label: 'Optimal greed fail case (5+5+1)' },
      { id: 'tc2', input: 'coins = [2], amount = 3', expected: '-1', label: 'Impossible denomination' },
      { id: 'tc3', input: 'coins = [1], amount = 0', expected: '0', label: 'Zero amount' },
      { id: 'tc4', input: 'coins = [2,5,10,1], amount = 27', expected: '4', label: 'Mixed coin combinations (10+10+5+2)' }
    ]
  },
  {
    id: 'course-schedule-ii',
    title: 'Course Schedule II',
    category: 'solve',
    difficulty: 'Medium',
    acceptance: '50.1%',
    tags: ['Graph', 'Topological Sort', 'BFS', 'DFS'],
    learningObjective: 'Prompt for topological sorting using Kahn’s in-degree queue or 3-color DFS with cycle detection.',
    description: `There are a total of \`numCourses\` courses you have to take, labeled from \`0\` to \`numCourses - 1\`. You are given an array \`prerequisites\` where \`prerequisites[i] = [a_i, b_i]\` indicates that you must take course \`b_i\` first if you want to take course \`a_i\`.

Return the ordering of courses you should take to finish all courses. If there are many valid answers, return **any** of them. If it is impossible to finish all courses (due to a cycle), return an **empty array**.`,
    examples: [
      {
        input: 'numCourses = 2, prerequisites = [[1,0]]',
        output: '[0, 1]',
        explanation: 'There are a total of 2 courses to take. To take course 1 you should have finished course 0. So the correct course order is [0,1].'
      },
      {
        input: 'numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]',
        output: '[0, 1, 2, 3]',
        explanation: 'Either [0,1,2,3] or [0,2,1,3] is valid.'
      },
      {
        input: 'numCourses = 2, prerequisites = [[1,0],[0,1]]',
        output: '[]',
        explanation: 'Deadlock cycle between course 0 and 1.'
      }
    ],
    constraints: [
      '1 <= numCourses <= 2000',
      '0 <= prerequisites.length <= numCourses * (numCourses - 1)',
      'prerequisites[i].length == 2',
      'All the pairs prerequisites[i] are unique.'
    ],
    recommendedPrompt: 'Solve the DSA question "Course Schedule II" strictly using the 7-section format: 1. Restating the problem, 2. Naming the technique, 3. Key observations, 4. The algorithm, 5. Correctness arguments, 6. Complexity analyses, 7. Potential pitfalls.',
    promptTips: [
      'Specify Kahn’s algorithm with in-degree array and queue of zero-indegree vertices.',
      'Check termination condition: if result list length < numCourses, a cycle exists, return empty array.',
      'Establish adjacency list building time O(V + E).'
    ],
    starterCode: {
      typescript: `export function findOrder(numCourses: number, prerequisites: number[][]): number[] {
  // Kahn's algorithm: In-degree queue for topological order
  return [];
}`,
      python: `def findOrder(numCourses: int, prerequisites: list[list[int]]) -> list[int]:
    return []`,
      cpp: `#include <vector>
#include <queue>

std::vector<int> findOrder(int numCourses, std::vector<std::vector<int>>& prerequisites) {
    return {};
}`,
      java: `import java.util.*;

class Solution {
    public int[] findOrder(int numCourses, int[][] prerequisites) {
        return new int[0];
    }
}`,
      go: `func findOrder(numCourses int, prerequisites [][]int) []int {
    return []int{}
}`
    },
    testCases: [
      { id: 'tc1', input: 'numCourses = 2, prereq = [[1,0]]', expected: '[0, 1]', label: 'Simple linear prerequisite' },
      { id: 'tc2', input: 'numCourses = 2, prereq = [[1,0],[0,1]]', expected: '[]', label: 'Direct cycle deadlock' },
      { id: 'tc3', input: 'numCourses = 1, prereq = []', expected: '[0]', label: 'Single isolated node' }
    ]
  },
  {
    id: 'subarray-sum-equals-k',
    title: 'Subarray Sum Equals K',
    category: 'solve',
    difficulty: 'Medium',
    acceptance: '43.6%',
    tags: ['Array', 'Hash Table', 'Prefix Sum'],
    learningObjective: 'Learn prefix sum + hash map frequency lookup: finding continuous subarrays summing to target k in O(N).',
    description: `Given an array of integers \`nums\` and an integer \`k\`, return the total number of subarrays whose sum equals to \`k\`.

A subarray is a contiguous non-empty sequence of elements within an array.`,
    examples: [
      {
        input: 'nums = [1, 1, 1], k = 2',
        output: '2',
        explanation: 'Subarrays [1, 1] at indices [0, 1] and [1, 2] both sum to 2.'
      },
      {
        input: 'nums = [1, 2, 3], k = 3',
        output: '2',
        explanation: 'Subarrays [1, 2] and [3] sum to 3.'
      }
    ],
    constraints: [
      '1 <= nums.length <= 2 * 10^4',
      '-1000 <= nums[i] <= 1000',
      '-10^7 <= k <= 10^7'
    ],
    recommendedPrompt: 'Solve the DSA question "Subarray Sum Equals K" strictly using the 7-section format: 1. Restating the problem, 2. Naming the technique, 3. Key observations, 4. The algorithm, 5. Correctness arguments, 6. Complexity analyses, 7. Potential pitfalls.',
    promptTips: [
      'Emphasize why two pointers/sliding window fails here (array contains negative numbers).',
      'Prompt for prefix sum hash map: map sum frequencies, checking for prefixSum - k.',
      'Crucial invariant: seed map with {0: 1} to account for subarrays starting at index 0.'
    ],
    starterCode: {
      typescript: `export function subarraySum(nums: number[], k: number): number {
  // Prefix sums with frequency Hash Map
  return 0;
}`,
      python: `def subarraySum(nums: list[int], k: int) -> int:
    return 0`,
      cpp: `#include <vector>
#include <unordered_map>

int subarraySum(std::vector<int>& nums, int k) {
    return 0;
}`,
      java: `import java.util.HashMap;

class Solution {
    public int subarraySum(int[] nums, int k) {
        return 0;
    }
}`,
      go: `func subarraySum(nums []int, k int) int {
    return 0
}`
    },
    testCases: [
      { id: 'tc1', input: 'nums = [1, 1, 1], k = 2', expected: '2', label: 'Uniform positive array' },
      { id: 'tc2', input: 'nums = [1, -1, 0], k = 0', expected: '3', label: 'Negative and zero numbers' },
      { id: 'tc3', input: 'nums = [3, 4, 7, 2, -3, 1, 4, 2], k = 7', expected: '4', label: 'Multiple overlapping ranges' }
    ]
  },
  {
    id: 'lru-cache',
    title: 'LRU Cache (Least Recently Used)',
    category: 'solve',
    difficulty: 'Medium',
    acceptance: '42.1%',
    tags: ['Design', 'Hash Table', 'Linked List', 'Doubly-Linked List'],
    learningObjective: 'Master design prompts: demanding O(1) get and put time complexity through combined data structures.',
    description: `Design a data structure that follows the constraints of a **Least Recently Used (LRU) cache**.

Implement the \`LRUCache\` class:
- \`LRUCache(int capacity)\` Initialize the LRU cache with positive size \`capacity\`.
- \`int get(int key)\` Return the value of the \`key\` if the key exists, otherwise return \`-1\`.
- \`void put(int key, int value)\` Update the value of the \`key\` if the \`key\` exists. Otherwise, add the \`key-value\` pair to the cache. If the number of keys exceeds \`capacity\` from this operation, **evict** the least recently used key.

The functions \`get\` and \`put\` must each run in **O(1)** average time complexity.`,
    examples: [
      {
        input: '["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]\n[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]',
        output: '[null, null, null, 1, null, -1, null, -1, 3, 4]',
        explanation: 'LRUCache lRUCache = new LRUCache(2);\nlRUCache.put(1, 1); // cache is {1=1}\nlRUCache.put(2, 2); // cache is {1=1, 2=2}\nlRUCache.get(1);    // return 1, {2=2, 1=1}\nlRUCache.put(3, 3); // LRU key was 2, evicts key 2, {1=1, 3=3}\nlRUCache.get(2);    // returns -1 (not found)'
      }
    ],
    constraints: [
      '1 <= capacity <= 3000',
      '0 <= key <= 10^4',
      '0 <= value <= 10^5',
      'At most 2 * 10^5 calls will be made to get and put.'
    ],
    recommendedPrompt: 'Solve the DSA question "LRU Cache" strictly using the 7-section format: 1. Restating the problem, 2. Naming the technique, 3. Key observations, 4. The algorithm, 5. Correctness arguments, 6. Complexity analyses, 7. Potential pitfalls.',
    promptTips: [
      'Demands the 7 canonical DSA sections without syntax distractions.',
      'Identifies the combined Doubly-Linked List + Hash Map paradigm.',
      'Provides asymptotic O(1) proofs and boundary eviction pitfalls.'
    ],
    starterCode: {
      typescript: `export class LRUCache {
  constructor(capacity: number) {
    // Implement O(1) LRU Cache
  }

  get(key: number): number {
    return -1;
  }

  put(key: number, value: number): void {
    // Put logic with O(1) eviction
  }
}`,
      python: `class LRUCache:
    def __init__(self, capacity: int):
        pass

    def get(self, key: int) -> int:
        return -1

    def put(self, key: int, value: int) -> None:
        pass`,
      cpp: `class LRUCache {
public:
    LRUCache(int capacity) {}
    int get(int key) { return -1; }
    void put(int key, int value) {}
};`,
      java: `class LRUCache {
    public LRUCache(int capacity) {}
    public int get(int key) { return -1; }
    public void put(int key, int value) {}
}`,
      go: `type LRUCache struct {}

func Constructor(capacity int) LRUCache { return LRUCache{} }
func (this *LRUCache) Get(key int) int { return -1 }
func (this *LRUCache) Put(key int, value int) {}`
    },
    testCases: [
      { id: 'tc1', input: 'cap=2, put(1,1), put(2,2), get(1)', expected: '1', label: 'Basic read access' },
      { id: 'tc2', input: 'cap=2, put(3,3), get(2)', expected: '-1', label: 'Eviction verification' },
      { id: 'tc3', input: 'cap=1, put(2,1), get(2), put(3,2), get(2)', expected: '-1', label: 'Single item capacity' }
    ]
  },
  {
    id: 'median-of-two-sorted-arrays',
    title: 'Median of Two Sorted Arrays',
    category: 'solve',
    difficulty: 'Hard',
    acceptance: '39.7%',
    tags: ['Array', 'Binary Search', 'Divide and Conquer'],
    learningObjective: 'Master logarithmic binary search partitioning across two independent arrays in O(log(min(m, n))).',
    description: `Given two sorted arrays \`nums1\` and \`nums2\` of size \`m\` and \`n\` respectively, return the **median** of the two sorted arrays.

The overall run time complexity should be **O(log (m+n))**.`,
    examples: [
      {
        input: 'nums1 = [1, 3], nums2 = [2]',
        output: '2.00000',
        explanation: 'merged array = [1, 2, 3] and median is 2.'
      },
      {
        input: 'nums1 = [1, 2], nums2 = [3, 4]',
        output: '2.50000',
        explanation: 'merged array = [1, 2, 3, 4] and median is (2 + 3) / 2 = 2.5.'
      }
    ],
    constraints: [
      'nums1.length == m',
      'nums2.length == n',
      '0 <= m <= 1000',
      '0 <= n <= 1000',
      '1 <= m + n <= 2000',
      '-10^6 <= nums1[i], nums2[i] <= 10^6'
    ],
    recommendedPrompt: 'Solve the DSA question "Median of Two Sorted Arrays" strictly using the 7-section format: 1. Restating the problem, 2. Naming the technique, 3. Key observations, 4. The algorithm, 5. Correctness arguments, 6. Complexity analyses, 7. Potential pitfalls.',
    promptTips: [
      'Ensure binary search runs on the shorter array to guarantee O(log(min(M, N))).',
      'Define partition cut invariants: leftMaxA <= rightMinB and leftMaxB <= rightMinA.',
      'Explicitly handle -Infinity and +Infinity boundary guards when cut is at 0 or length.'
    ],
    starterCode: {
      typescript: `export function findMedianSortedArrays(nums1: number[], nums2: number[]): number {
  // Binary search partitioning on smaller array
  return 0;
}`,
      python: `def findMedianSortedArrays(nums1: list[int], nums2: list[int]) -> float:
    return 0.0`,
      cpp: `#include <vector>
#include <algorithm>

double findMedianSortedArrays(std::vector<int>& nums1, std::vector<int>& nums2) {
    return 0.0;
}`,
      java: `class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        return 0.0;
    }
}`,
      go: `func findMedianSortedArrays(nums1 []int, nums2 []int) float64 {
    return 0.0
}`
    },
    testCases: [
      { id: 'tc1', input: 'nums1 = [1, 3], nums2 = [2]', expected: '2.00000', label: 'Odd total length' },
      { id: 'tc2', input: 'nums1 = [1, 2], nums2 = [3, 4]', expected: '2.50000', label: 'Even total length' },
      { id: 'tc3', input: 'nums1 = [], nums2 = [1]', expected: '1.00000', label: 'Empty first array' }
    ]
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    category: 'solve',
    difficulty: 'Easy',
    acceptance: '40.9%',
    tags: ['String', 'Stack'],
    learningObjective: 'Master LIFO stack invariants for matching balanced delimiters and catching early unclosed tokens.',
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    examples: [
      { input: 's = "()"', output: 'true', explanation: 'Matching pair.' },
      { input: 's = "()[]{}"', output: 'true', explanation: 'All pairs properly closed.' },
      { input: 's = "(]"', output: 'false', explanation: 'Mismatched closing bracket.' }
    ],
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only \'()[]{}\'.'
    ],
    recommendedPrompt: 'Solve the DSA question "Valid Parentheses" strictly using the 7-section format: 1. Restating the problem, 2. Naming the technique, 3. Key observations, 4. The algorithm, 5. Correctness arguments, 6. Complexity analyses, 7. Potential pitfalls.',
    promptTips: [
      'Enforce stack invariant: top of stack must match closing symbol.',
      'Check odd length shortcut: if s.length % 2 !== 0, immediate return false.',
      'Check final stack emptiness to catch unmatched opening brackets.'
    ],
    starterCode: {
      typescript: `export function isValid(s: string): boolean {
  return false;
}`,
      python: `def isValid(s: str) -> bool:
    return False`,
      cpp: `#include <string>
#include <stack>

bool isValid(std::string s) {
    return false;
}`,
      java: `import java.util.Stack;

class Solution {
    public boolean isValid(String s) {
        return false;
    }
}`,
      go: `func isValid(s string) bool {
    return false
}`
    },
    testCases: [
      { id: 'tc1', input: 's = "()"', expected: 'true', label: 'Single pair' },
      { id: 'tc2', input: 's = "()[]{}"', expected: 'true', label: 'Sequential valid pairs' },
      { id: 'tc3', input: 's = "(]"', expected: 'false', label: 'Mismatched closing bracket' },
      { id: 'tc4', input: 's = "([)]"', expected: 'false', label: 'Interleaved invalid brackets' },
      { id: 'tc5', input: 's = "["', expected: 'false', label: 'Single unmatched opener' }
    ]
  },
  {
    id: 'debug-binary-search-loop',
    title: 'Bug: Infinite Loop & Off-by-One in Binary Search',
    category: 'debug',
    difficulty: 'Easy',
    acceptance: '61.2%',
    tags: ['Debugging', 'Binary Search', 'Off-by-one', 'Edge Cases'],
    learningObjective: 'Learn root-cause prompt engineering: isolating midpoint rounding and boundary condition bugs.',
    description: `The following binary search implementation has a severe bug: when a target number is greater than elements or not found, or when \`nums.length == 2\`, it falls into an **infinite loop** or skips the boundary element due to integer division and boundary pointer updates.

**Your Task**: Formulate a prompt to pinpoint the root cause, explain the execution trace that causes the freeze, and apply the exact fix.`,
    examples: [
      {
        input: 'nums = [1, 3, 5, 6], target = 5',
        output: '2',
        explanation: 'Target 5 is at index 2.'
      },
      {
        input: 'nums = [1, 3, 5, 6], target = 2',
        output: '-1',
        explanation: 'Currently hangs in an infinite loop instead of returning -1.'
      }
    ],
    constraints: [
      '1 <= nums.length <= 10^4',
      'nums is sorted in ascending order with unique elements.'
    ],
    recommendedPrompt: 'Act as a Senior Debugger. In the provided search function, analyze why target=2 on [1, 3, 5, 6] causes an infinite loop. Identify the flaw in the while loop condition and midpoint calculation (left + right)/2 vs left + (right - left)/2, and explain why left = mid instead of left = mid + 1 fails to contract the window. Provide the patched code with invariant explanation.',
    promptTips: [
      'Provide the specific failing input in the prompt to ground the trace.',
      'Ask the AI to explain the pointer divergence at (left, right) values before providing code.',
      'Demand minimal surgical edits rather than rewriting the whole file.'
    ],
    starterCode: {
      typescript: `export function search(nums: number[], target: number): number {
  let left = 0;
  let right = nums.length; // BUG 1: length vs length - 1

  while (left < right) {   // BUG 2: loop condition
    const mid = Math.floor((left + right) / 2); // Potential overflow in languages like C++/Java

    if (nums[mid] === target) {
      return mid;
    } else if (nums[mid] < target) {
      left = mid; // BUG 3: Infinite loop when right - left === 1
    } else {
      right = mid;
    }
  }

  return -1;
}`,
      python: `def search(nums: list[int], target: int) -> int:
    left = 0
    right = len(nums)
    while left < right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid # BUG: infinite loop
        else:
            right = mid
    return -1`,
      cpp: `int search(std::vector<int>& nums, int target) {
    int left = 0;
    int right = nums.size();
    while (left < right) {
        int mid = (left + right) / 2;
        if (nums[mid] == target) return mid;
        else if (nums[mid] < target) left = mid;
        else right = mid;
    }
    return -1;
}`,
      java: `class Solution {
    public int search(int[] nums, int target) {
        int left = 0;
        int right = nums.length;
        while (left < right) {
            int mid = (left + right) / 2;
            if (nums[mid] == target) return mid;
            else if (nums[mid] < target) left = mid;
            else right = mid;
        }
        return -1;
    }
}`,
      go: `func search(nums []int, target int) int {
    left := 0
    right := len(nums)
    for left < right {
        mid := (left + right) / 2
        if nums[mid] == target {
            return mid
        } else if nums[mid] < target {
            left = mid
        } else {
            right = mid
        }
    }
    return -1
}`
    },
    testCases: [
      { id: 'tc1', input: 'nums = [1, 3, 5, 6], target = 5', expected: '2', label: 'Existing middle element' },
      { id: 'tc2', input: 'nums = [1, 3, 5, 6], target = 2', expected: '-1', label: 'Non-existent element (infinite loop trigger)' },
      { id: 'tc3', input: 'nums = [1, 3], target = 3', expected: '1', label: 'Two elements right boundary' },
      { id: 'tc4', input: 'nums = [5], target = 5', expected: '0', label: 'Single element array' }
    ]
  },
  {
    id: 'debug-dfs-cycle-detection',
    title: 'Bug: Directed Graph Cycle Detection False Positives',
    category: 'debug',
    difficulty: 'Medium',
    acceptance: '46.3%',
    tags: ['Debugging', 'Graph', 'DFS', 'Cycle Detection'],
    learningObjective: 'Learn to prompt for state-machine bugs in graph traversal: 3-color states (White, Gray, Black) vs naive boolean visited.',
    description: `A developer attempted to detect cycles in a directed dependency graph using a simple boolean \`visited\` set. However, in Directed Acyclic Graphs (DAGs) with cross edges or diamond dependencies (e.g., A -> B, A -> C, B -> D, C -> D), the algorithm incorrectly flags node D as a cycle because it visits D twice from different ancestor branches.

**Your Task**: Formulate a prompt to explain why a single boolean visited set fails for directed graphs, explain the tri-state (unvisited, in-recursion-stack, fully-explored) invariant, and supply the corrected code.`,
    examples: [
      {
        input: 'edges = [[0,1],[0,2],[1,3],[2,3]]',
        output: 'false (No cycle, valid diamond DAG)',
        explanation: 'Buggy code returned true (falsely claimed node 3 formed a cycle).'
      }
    ],
    constraints: [
      'Nodes numbered 0 to N - 1.',
      'Graph may contain multiple disconnected components.'
    ],
    recommendedPrompt: 'Act as a Senior Algorithm Engineer. In the provided hasCycle function, explain why a single boolean visited set causes false-positive cycle detections in diamond-shaped directed acyclic graphs. Show why node coloring (0: UNVISITED, 1: VISITING / active on recursion stack, 2: VISITED / completely explored) correctly distinguishes back-edges from cross-edges. Provide the patched code.',
    promptTips: [
      'Contrast back-edges (cycles) with cross/forward edges in directed graphs.',
      'Require tri-state coloring or explicit recursion-stack tracking (inStack set).',
      'Include a diamond DAG test case to confirm no false positives.'
    ],
    starterCode: {
      typescript: `// BUGGY: Naive visited set flags valid DAG diamond dependencies as cycles!
export function hasCycle(numNodes: number, edges: number[][]): boolean {
  const adj: number[][] = Array.from({ length: numNodes }, () => []);
  for (const [u, v] of edges) adj[u].push(v);

  const visited = new Set<number>();

  function dfs(node: number): boolean {
    if (visited.has(node)) {
      return true; // BUG: Visiting from another branch is NOT a cycle in directed graph!
    }
    visited.add(node);
    for (const neighbor of adj[node]) {
      if (dfs(neighbor)) return true;
    }
    return false;
  }

  for (let i = 0; i < numNodes; i++) {
    if (dfs(i)) return true;
  }
  return false;
}`,
      python: `def hasCycle(numNodes: int, edges: list[list[int]]) -> bool:
    # Buggy single visited set
    return False`,
      cpp: `bool hasCycle(int numNodes, std::vector<std::vector<int>>& edges) {
    return false;
}`,
      java: `class Solution {
    public boolean hasCycle(int numNodes, int[][] edges) {
        return false;
    }
}`,
      go: `func hasCycle(numNodes int, edges [][]int) bool {
    return false
}`
    },
    testCases: [
      { id: 'tc1', input: 'edges = [[0,1],[0,2],[1,3],[2,3]] (diamond DAG)', expected: 'false', label: 'Diamond DAG (Must not trigger false positive)' },
      { id: 'tc2', input: 'edges = [[0,1],[1,2],[2,0]] (triangle cycle)', expected: 'true', label: 'True back-edge cycle' },
      { id: 'tc3', input: 'edges = [[0,1],[2,3]] (disconnected trees)', expected: 'false', label: 'Disconnected forest' }
    ]
  },
  {
    id: 'develop-token-bucket-limiter',
    title: 'Development: Token Bucket Rate Limiter with Burst & Refill',
    category: 'develop',
    difficulty: 'Medium',
    acceptance: '48.9%',
    tags: ['System Design', 'Algorithms', 'Concurrency', 'Development'],
    learningObjective: 'Learn contract-first development prompting: defining interfaces, refill formulas, and fractional token safety.',
    description: `Develop a production-ready **Token Bucket Rate Limiter** commonly used in API gateways (like Cloudflare, AWS API Gateway, Express).

**Requirements**:
1. \`capacity\`: Maximum token burst capacity.
2. \`refillRate\`: Number of tokens added per second.
3. \`tryConsume(tokens = 1)\`: Returns \`true\` if tokens were deducted, \`false\` if rate limited.
4. \`getTimeUntilNextToken()\`: Returns milliseconds remaining until at least 1 token is available.
5. Must compute refills lazily on access without requiring background \`setInterval\` timers (zero CPU overhead when idle).`,
    examples: [
      {
        input: 'capacity = 5, refillRate = 2 tokens/sec. Consume 5 tokens immediately.',
        output: 'All 5 succeed. Next consume fails with 0 tokens. After 500ms, 1 token is refilled.',
        explanation: 'Tokens refill linearly based on (currentTime - lastRefillTime).'
      }
    ],
    constraints: [
      'Zero background timer polling (lazy evaluation only).',
      'Tokens must never exceed maximum capacity.',
      'Must handle sub-millisecond fractional refills without precision drift.'
    ],
    recommendedPrompt: 'Act as a Principal Backend Architect. Develop a production-grade Token Bucket Rate Limiter in TypeScript. Implement lazy timestamp-based refill math to avoid background setInterval leaks. Expose tryConsume(tokens), getAvailableTokens(), and getTimeUntilNextToken() methods. Include comprehensive unit tests testing burst consumption and lazy refill accuracy.',
    promptTips: [
      'Demand lazy refill math based on elapsed time rather than active polling.',
      'Specify edge case: token request greater than total bucket capacity must immediately return false.',
      'Ask for thread-safe or microsecond-precision consideration.'
    ],
    starterCode: {
      typescript: `export interface RateLimiter {
  tryConsume(tokens?: number): boolean;
  getAvailableTokens(): number;
  getTimeUntilNextToken(): number;
}

export class TokenBucketRateLimiter implements RateLimiter {
  private capacity: number;
  private refillRate: number; // tokens per second
  private tokens: number;
  private lastRefillTimestamp: number;

  constructor(capacity: number, refillRate: number) {
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.tokens = capacity;
    this.lastRefillTimestamp = Date.now();
  }

  tryConsume(tokens: number = 1): boolean {
    // Implement lazy refill and deduction
    return false;
  }

  getAvailableTokens(): number {
    return 0;
  }

  getTimeUntilNextToken(): number {
    return 0;
  }
}`,
      python: `import time

class TokenBucketRateLimiter:
    def __init__(self, capacity: int, refill_rate: float):
        self.capacity = capacity
        self.refill_rate = refill_rate
        self.tokens = capacity
        self.last_refill = time.time()

    def try_consume(self, tokens: int = 1) -> bool:
        return False`,
      cpp: `class TokenBucketRateLimiter {
public:
    TokenBucketRateLimiter(int capacity, double refillRate) {}
    bool tryConsume(int tokens = 1) { return false; }
};`,
      java: `class TokenBucketRateLimiter {
    public TokenBucketRateLimiter(int capacity, double refillRate) {}
    public boolean tryConsume(int tokens) { return false; }
}`,
      go: `type TokenBucketRateLimiter struct {}
func NewTokenBucket(capacity int, refillRate float64) *TokenBucketRateLimiter { return &TokenBucketRateLimiter{} }
func (t *TokenBucketRateLimiter) TryConsume(tokens int) bool { return false }`
    },
    testCases: [
      { id: 'tc1', input: 'burst 5 tokens with capacity=5', expected: 'true', label: 'Initial burst consumption' },
      { id: 'tc2', input: 'consume 6th token immediately', expected: 'false', label: 'Rate limit rejection' },
      { id: 'tc3', input: 'after 1 sec at refill=2', expected: '2 tokens available', label: 'Lazy time-based refill' }
    ]
  },
  {
    id: 'develop-typed-event-emitter',
    title: 'Development: Strictly Typed Event Emitter with Once & Wildcards',
    category: 'develop',
    difficulty: 'Medium',
    acceptance: '52.0%',
    tags: ['Architecture', 'TypeScript', 'Event-Driven', 'Development'],
    learningObjective: 'Prompt for advanced TypeScript generic contracts: type-safe event maps, listener unregistration, and memory leak guards.',
    description: `Build a production-grade, strongly typed **Event Emitter** class in TypeScript.

**Requirements**:
1. Strong generic type inference: \`EventEmitter<EventMap>\` where keys match event names and values match payload tuples.
2. \`on(event, listener)\`: Registers a listener, returns an \`unsubscribe()\` function for zero-effort cleanup.
3. \`once(event, listener)\`: Automatically removes itself after firing once.
4. \`emit(event, ...args)\`: Dispatches payload with strict compile-time argument checks.
5. \`setMaxListeners(count)\` and warning if listener count exceeds threshold (preventing event listener memory leaks).`,
    examples: [
      {
        input: 'emitter.on("userLogin", (user) => console.log(user.name)); emitter.emit("userLogin", { name: "Alex" });',
        output: 'Listener executes with full type safety.',
        explanation: 'Invalid event names or wrong payload arguments must fail compile-time TypeScript type checking.'
      }
    ],
    constraints: [
      'Must return unsubscribe function from on/once.',
      'Listener arrays must be cloned during emit to avoid mutation bugs during dispatch.',
      'Support once() wrappers without leaking memory.'
    ],
    recommendedPrompt: 'Act as a TypeScript Core Engineer. Implement a strictly typed EventEmitter<T extends Record<string, any[]>> in TypeScript. Support on, once, emit, off, and an automatic unsubscribe closure. Clone the listener array during emission to prevent re-entrant mutation bugs. Provide clean unit test assertions.',
    promptTips: [
      'Ask for re-entrant safety: deleting or adding listeners during an active emit loop.',
      'Specify generic mapping: EventEmitter<Record<string, any[]>>.',
      'Demand leak-detection warnings when listener count exceeds maxListeners.'
    ],
    starterCode: {
      typescript: `export type Listener<T extends any[] = any[]> = (...args: T) => void;

export class TypedEventEmitter<Events extends Record<string, any[]>> {
  private listeners: Map<keyof Events, Set<Listener>> = new Map();
  private maxListeners: number = 10;

  on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): () => void {
    // Prompt the AI to build type-safe listener registration
    return () => {};
  }

  once<K extends keyof Events>(event: K, listener: Listener<Events[K]>): () => void {
    // Self-destructing wrapper
    return () => {};
  }

  emit<K extends keyof Events>(event: K, ...args: Events[K]): boolean {
    // Safe dispatch with array clone
    return false;
  }
}`,
      python: `# Python Typed Event Bus
class TypedEventBus:
    pass`,
      cpp: `// C++ Event Dispatcher`,
      java: `// Java Event Bus`,
      go: `// Go Channel Event Bus`
    },
    testCases: [
      { id: 'tc1', input: 'on("ping") -> emit("ping")', expected: 'Listener called once', label: 'Basic event dispatch' },
      { id: 'tc2', input: 'once("save") -> emit("save") -> emit("save")', expected: 'Called exactly 1 time', label: 'Self-removing once listener' },
      { id: 'tc3', input: 'unsubscribe() call -> emit("ping")', expected: 'Listener not called', label: 'Unsubscribe cleanup' }
    ]
  },
  {
    id: 'develop-retry-backoff',
    title: 'Development: Resilient Retry with Exponential Backoff & Full Jitter',
    category: 'develop',
    difficulty: 'Medium',
    acceptance: '56.4%',
    tags: ['System Design', 'Async', 'Resilience', 'Development'],
    learningObjective: 'Learn to prompt for fault-tolerant network clients: exponential delay formulas, decorrelated jitter, and abort signals.',
    description: `Build a production-grade async \`retryWithBackoff\` utility as defined in AWS Architecture guidelines to prevent thundering herd problems.

**Requirements**:
1. Exponential delay calculation: \`min(maxDelay, baseDelay * 2^attempt)\`.
2. Full Jitter: randomize delay between \`0\` and computed exponential delay.
3. Retry predicate: \`shouldRetry(error)\` callback to avoid retrying 4xx client errors.
4. Support cancellation via \`AbortSignal\`.`,
    examples: [
      {
        input: 'retryWithBackoff(fetchData, { retries: 3, baseDelayMs: 100, maxDelayMs: 2000 })',
        output: 'Retries transient network hiccups with jittered exponential delay.',
        explanation: 'Full jitter distributes server reconnect waves across a Gaussian curve.'
      }
    ],
    constraints: [
      'Must respect AbortSignal during backoff wait.',
      'Must preserve original error stack if all retries are exhausted.'
    ],
    recommendedPrompt: 'Act as a Principal Cloud Infrastructure Engineer. Build a production-grade retryWithBackoff<T> in TypeScript. Implement exponential backoff with AWS Full Jitter (Math.random() * delay) to eliminate thundering herd server thrashes. Provide AbortSignal support, maxRetry limits, and custom shouldRetry(error) predicate.',
    promptTips: [
      'Explicitly prompt for AWS Full Jitter formula.',
      'Require AbortSignal integration to cleanly stop timers if user unmounts or cancels.',
      'Specify typed error propagation.'
    ],
    starterCode: {
      typescript: `export interface RetryOptions {
  retries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  shouldRetry?: (err: any) => boolean;
  signal?: AbortSignal;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  // Implement resilient exponential backoff with full jitter
  return fn();
}`,
      python: `import asyncio
import random

async def retry_with_backoff(fn, retries=3, base_delay=0.1, max_delay=2.0):
    pass`,
      cpp: `// C++ Retry with Jitter`,
      java: `// Java Retry with Jitter`,
      go: `// Go Retry with Jitter`
    },
    testCases: [
      { id: 'tc1', input: 'Fails 2 times then succeeds on 3rd attempt', expected: 'Success value returned', label: 'Transient failure recovery' },
      { id: 'tc2', input: 'Fails with non-retryable 404', expected: 'Immediate error throw without retry', label: 'Non-retryable predicate check' }
    ]
  }
];

export const CURATED_PACKS: ProblemPack[] = [
  {
    id: 'blind-75-pack',
    title: 'Blind 75 & NeetCode Classics',
    description: 'The core algorithms tested by Google, Meta, and Apple: Two Pointers, Sliding Window, DP, and Prefix Sums.',
    badge: 'Elite Essential',
    category: 'solve',
    tags: ['Arrays', 'Two Pointers', 'Sliding Window', 'Stack'],
    problems: PROBLEMS.filter((p) => p.category === 'solve')
  },
  {
    id: 'dp-mastery-pack',
    title: 'Dynamic Programming Mastery',
    description: 'From 1D knapsack state transitions to 2D grid pathing and partition optimization.',
    badge: 'High Value',
    category: 'solve',
    tags: ['Dynamic Programming', 'Knapsack', 'Memoization'],
    problems: PROBLEMS.filter((p) => p.tags.includes('Dynamic Programming'))
  },
  {
    id: 'system-dev-pack',
    title: 'High-Concurrency & System Dev',
    description: 'Production-grade rate limiters, typed event emitters, and jittered retry patterns for staff-level engineers.',
    badge: 'Architecture',
    category: 'develop',
    tags: ['System Design', 'Concurrency', 'TypeScript'],
    problems: PROBLEMS.filter((p) => p.category === 'develop')
  }
];
