export interface DSAQuestion {
  id: string;
  title: string;
  platform: 'LeetCode' | 'GeeksforGeeks' | 'Codeforces';
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Div. 2/3';
  topic: string;
  url: string;
  problemNumber?: string | number;
  descriptionSnippet?: string;
}

export interface DSATrack {
  id: 'beginner' | 'intermediate' | 'pro';
  title: string;
  badge: string;
  tagline: string;
  description: string;
  iconName: string;
  recommendedFor: string;
  topics: string[];
  questions: DSAQuestion[];
}

export const DSA_TRACKS: DSATrack[] = [
  {
    id: 'beginner',
    title: 'Beginner / Foundation',
    badge: 'Level 1',
    tagline: 'Master the fundamentals & basic logic',
    description: 'Designed for beginners to get confident with arrays, strings, stacks, queues, linked lists, and basic trees using curated LeetCode & GFG problems.',
    iconName: 'Sparkles',
    recommendedFor: '1st & 2nd year students, beginners starting data structures and algorithms.',
    topics: ['Arrays', 'Strings', 'Linked List', 'Stack & Queue', 'Trees (Basics)'],
    questions: [
      // Arrays
      {
        id: 'beg-arr-1',
        title: 'Two Sum',
        platform: 'LeetCode',
        difficulty: 'Easy',
        topic: 'Arrays',
        url: 'https://leetcode.com/problems/two-sum/',
        problemNumber: '#1',
        descriptionSnippet: 'Find two numbers in array that add up to target.'
      },
      {
        id: 'beg-arr-2',
        title: 'Best Time to Buy and Sell Stock',
        platform: 'LeetCode',
        difficulty: 'Easy',
        topic: 'Arrays',
        url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
        problemNumber: '#121',
        descriptionSnippet: 'Maximize profit by choosing a single day to buy and sell.'
      },
      {
        id: 'beg-arr-3',
        title: 'Remove Duplicates from Sorted Array',
        platform: 'LeetCode',
        difficulty: 'Easy',
        topic: 'Arrays',
        url: 'https://leetcode.com/problems/remove-duplicates-from-sorted-array/',
        problemNumber: '#26',
        descriptionSnippet: 'Remove duplicates in-place such that each element appears once.'
      },
      {
        id: 'beg-arr-4',
        title: 'Missing Number',
        platform: 'LeetCode',
        difficulty: 'Easy',
        topic: 'Arrays',
        url: 'https://leetcode.com/problems/missing-number/',
        problemNumber: '#268',
        descriptionSnippet: 'Find the only number in the range [0, n] missing from the array.'
      },
      {
        id: 'beg-arr-5',
        title: 'Move Zeroes',
        platform: 'LeetCode',
        difficulty: 'Easy',
        topic: 'Arrays',
        url: 'https://leetcode.com/problems/move-zeroes/',
        problemNumber: '#283',
        descriptionSnippet: 'Move all 0s to the end while maintaining the relative order.'
      },
      {
        id: 'beg-arr-6',
        title: 'Search Insert Position',
        platform: 'LeetCode',
        difficulty: 'Easy',
        topic: 'Arrays',
        url: 'https://leetcode.com/problems/search-insert-position/',
        problemNumber: '#35',
        descriptionSnippet: 'Return index if target is found or where it would be inserted in order.'
      },
      {
        id: 'beg-arr-7',
        title: 'Find Pivot Index',
        platform: 'LeetCode',
        difficulty: 'Easy',
        topic: 'Arrays',
        url: 'https://leetcode.com/problems/find-pivot-index/',
        problemNumber: '#724',
        descriptionSnippet: 'Calculate the pivot index where sum of left equals sum of right.'
      },
      {
        id: 'beg-arr-8',
        title: 'Leaders in an Array',
        platform: 'GeeksforGeeks',
        difficulty: 'Easy',
        topic: 'Arrays',
        url: 'https://www.geeksforgeeks.org/problems/leaders-in-an-array-1587115620/1',
        descriptionSnippet: 'Find all the leaders in the array that are greater than elements to their right.'
      },

      // Strings
      {
        id: 'beg-str-1',
        title: 'Valid Palindrome',
        platform: 'LeetCode',
        difficulty: 'Easy',
        topic: 'Strings',
        url: 'https://leetcode.com/problems/valid-palindrome/',
        problemNumber: '#125',
        descriptionSnippet: 'Check if phrase reads same forward and backward after cleanup.'
      },
      {
        id: 'beg-str-2',
        title: 'Valid Anagram',
        platform: 'LeetCode',
        difficulty: 'Easy',
        topic: 'Strings',
        url: 'https://leetcode.com/problems/valid-anagram/',
        problemNumber: '#242',
        descriptionSnippet: 'Determine if t is an anagram of s.'
      },
      {
        id: 'beg-str-3',
        title: 'Longest Common Prefix',
        platform: 'LeetCode',
        difficulty: 'Easy',
        topic: 'Strings',
        url: 'https://leetcode.com/problems/longest-common-prefix/',
        problemNumber: '#14',
        descriptionSnippet: 'Find longest common prefix string amongst an array of strings.'
      },
      {
        id: 'beg-str-4',
        title: 'Reverse String',
        platform: 'LeetCode',
        difficulty: 'Easy',
        topic: 'Strings',
        url: 'https://leetcode.com/problems/reverse-string/',
        problemNumber: '#344',
        descriptionSnippet: 'Reverse array of characters in-place with O(1) extra memory.'
      },
      {
        id: 'beg-str-5',
        title: 'First Unique Character in a String',
        platform: 'LeetCode',
        difficulty: 'Easy',
        topic: 'Strings',
        url: 'https://leetcode.com/problems/first-unique-character-in-a-string/',
        problemNumber: '#387',
        descriptionSnippet: 'Find the first non-repeating character in string and return its index.'
      },
      {
        id: 'beg-str-6',
        title: 'Reverse Words in a String',
        platform: 'GeeksforGeeks',
        difficulty: 'Easy',
        topic: 'Strings',
        url: 'https://www.geeksforgeeks.org/problems/reverse-words-in-a-given-string5459/1',
        descriptionSnippet: 'Reverse the words in a given string delimited by dots or spaces.'
      },

      // Linked List
      {
        id: 'beg-ll-1',
        title: 'Reverse Linked List',
        platform: 'LeetCode',
        difficulty: 'Easy',
        topic: 'Linked List',
        url: 'https://leetcode.com/problems/reverse-linked-list/',
        problemNumber: '#206',
        descriptionSnippet: 'Reverse a singly linked list iteratively and recursively.'
      },
      {
        id: 'beg-ll-2',
        title: 'Middle of the Linked List',
        platform: 'LeetCode',
        difficulty: 'Easy',
        topic: 'Linked List',
        url: 'https://leetcode.com/problems/middle-of-the-linked-list/',
        problemNumber: '#876',
        descriptionSnippet: 'Find middle node of singly linked list using slow and fast pointers.'
      },
      {
        id: 'beg-ll-3',
        title: 'Merge Two Sorted Lists',
        platform: 'LeetCode',
        difficulty: 'Easy',
        topic: 'Linked List',
        url: 'https://leetcode.com/problems/merge-two-sorted-lists/',
        problemNumber: '#21',
        descriptionSnippet: 'Merge two sorted linked lists into one sorted list.'
      },
      {
        id: 'beg-ll-4',
        title: 'Linked List Cycle',
        platform: 'LeetCode',
        difficulty: 'Easy',
        topic: 'Linked List',
        url: 'https://leetcode.com/problems/linked-list-cycle/',
        problemNumber: '#141',
        descriptionSnippet: 'Determine if linked list has a cycle using Floyd Cycle Finding algorithm.'
      },
      {
        id: 'beg-ll-5',
        title: 'Delete Node in a Linked List',
        platform: 'LeetCode',
        difficulty: 'Medium',
        topic: 'Linked List',
        url: 'https://leetcode.com/problems/delete-node-in-a-linked-list/',
        problemNumber: '#237',
        descriptionSnippet: 'Delete given node from singly linked list with only access to that node.'
      },

      // Stack & Queue
      {
        id: 'beg-sq-1',
        title: 'Valid Parentheses',
        platform: 'LeetCode',
        difficulty: 'Easy',
        topic: 'Stack & Queue',
        url: 'https://leetcode.com/problems/valid-parentheses/',
        problemNumber: '#20',
        descriptionSnippet: 'Determine if input string of brackets is valid using stack.'
      },
      {
        id: 'beg-sq-2',
        title: 'Implement Queue using Stacks',
        platform: 'LeetCode',
        difficulty: 'Easy',
        topic: 'Stack & Queue',
        url: 'https://leetcode.com/problems/implement-queue-using-stacks/',
        problemNumber: '#232',
        descriptionSnippet: 'Implement FIFO queue using only two standard stacks.'
      },
      {
        id: 'beg-sq-3',
        title: 'Implement Stack using Queues',
        platform: 'LeetCode',
        difficulty: 'Easy',
        topic: 'Stack & Queue',
        url: 'https://leetcode.com/problems/implement-stack-using-queues/',
        problemNumber: '#225',
        descriptionSnippet: 'Implement LIFO stack using standard queue operations.'
      },
      {
        id: 'beg-sq-4',
        title: 'Min Stack',
        platform: 'LeetCode',
        difficulty: 'Medium',
        topic: 'Stack & Queue',
        url: 'https://leetcode.com/problems/min-stack/',
        problemNumber: '#155',
        descriptionSnippet: 'Design a stack that retrieves the minimum element in O(1) time.'
      },
      {
        id: 'beg-sq-5',
        title: 'Next Greater Element I',
        platform: 'LeetCode',
        difficulty: 'Easy',
        topic: 'Stack & Queue',
        url: 'https://leetcode.com/problems/next-greater-element-i/',
        problemNumber: '#496',
        descriptionSnippet: 'Find the first greater element to the right using monotonic stack.'
      },
      {
        id: 'beg-sq-6',
        title: 'Parenthesis Checker',
        platform: 'GeeksforGeeks',
        difficulty: 'Easy',
        topic: 'Stack & Queue',
        url: 'https://www.geeksforgeeks.org/problems/parenthesis-checker2744/1',
        descriptionSnippet: 'Check whether brackets in an expression are balanced.'
      },

      // Trees (Basics)
      {
        id: 'beg-tree-1',
        title: 'Maximum Depth of Binary Tree',
        platform: 'LeetCode',
        difficulty: 'Easy',
        topic: 'Trees (Basics)',
        url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/',
        problemNumber: '#104',
        descriptionSnippet: 'Find number of nodes along longest path from root to furthest leaf.'
      },
      {
        id: 'beg-tree-2',
        title: 'Invert Binary Tree',
        platform: 'LeetCode',
        difficulty: 'Easy',
        topic: 'Trees (Basics)',
        url: 'https://leetcode.com/problems/invert-binary-tree/',
        problemNumber: '#226',
        descriptionSnippet: 'Invert the tree so left and right child pointers are swapped.'
      },
      {
        id: 'beg-tree-3',
        title: 'Same Tree',
        platform: 'LeetCode',
        difficulty: 'Easy',
        topic: 'Trees (Basics)',
        url: 'https://leetcode.com/problems/same-tree/',
        problemNumber: '#100',
        descriptionSnippet: 'Check if two binary trees are structurally identical and have same values.'
      },
      {
        id: 'beg-tree-4',
        title: 'Symmetric Tree',
        platform: 'LeetCode',
        difficulty: 'Easy',
        topic: 'Trees (Basics)',
        url: 'https://leetcode.com/problems/symmetric-tree/',
        problemNumber: '#101',
        descriptionSnippet: 'Check whether a binary tree is a mirror of itself.'
      },
      {
        id: 'beg-tree-5',
        title: 'Diameter of Binary Tree',
        platform: 'LeetCode',
        difficulty: 'Easy',
        topic: 'Trees (Basics)',
        url: 'https://leetcode.com/problems/diameter-of-binary-tree/',
        problemNumber: '#543',
        descriptionSnippet: 'Length of the longest path between any two nodes in a tree.'
      },
      {
        id: 'beg-tree-6',
        title: 'Binary Tree Inorder Traversal',
        platform: 'LeetCode',
        difficulty: 'Easy',
        topic: 'Trees (Basics)',
        url: 'https://leetcode.com/problems/binary-tree-inorder-traversal/',
        problemNumber: '#94',
        descriptionSnippet: 'Return the inorder traversal of binary tree nodes values.'
      }
    ]
  },
  {
    id: 'intermediate',
    title: 'Intermediate / Core DSA',
    badge: 'Level 2',
    tagline: 'Technical interview algorithms & problem solving',
    description: 'Master crucial placement concepts: Binary Search, Two Pointers, Trees & BST, Graph traversals (BFS/DFS), and fundamental to intermediate Dynamic Programming.',
    iconName: 'Target',
    recommendedFor: 'Pre-final & final year students preparing for campus placements and technical interviews.',
    topics: ['Binary Search', 'Strings', 'Two Pointers & Sliding Window', 'Trees & BST', 'Graphs', 'Dynamic Programming'],
    questions: [
      // Binary Search
      {
        id: 'int-bs-1',
        title: 'Binary Search',
        platform: 'LeetCode',
        difficulty: 'Easy',
        topic: 'Binary Search',
        url: 'https://leetcode.com/problems/binary-search/',
        problemNumber: '#704',
        descriptionSnippet: 'Classic O(log n) binary search in a sorted array.'
      },
      {
        id: 'int-bs-2',
        title: 'Search in Rotated Sorted Array',
        platform: 'LeetCode',
        difficulty: 'Medium',
        topic: 'Binary Search',
        url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/',
        problemNumber: '#33',
        descriptionSnippet: 'Find target value in an array rotated at an unknown pivot in O(log n).'
      },
      {
        id: 'int-bs-3',
        title: 'Find First and Last Position of Element',
        platform: 'LeetCode',
        difficulty: 'Medium',
        topic: 'Binary Search',
        url: 'https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/',
        problemNumber: '#34',
        descriptionSnippet: 'Find starting and ending position of target element in sorted array.'
      },
      {
        id: 'int-bs-4',
        title: 'Find Peak Element',
        platform: 'LeetCode',
        difficulty: 'Medium',
        topic: 'Binary Search',
        url: 'https://leetcode.com/problems/find-peak-element/',
        problemNumber: '#162',
        descriptionSnippet: 'Find a peak element strictly greater than its neighbors in O(log n).'
      },
      {
        id: 'int-bs-5',
        title: 'Koko Eating Bananas',
        platform: 'LeetCode',
        difficulty: 'Medium',
        topic: 'Binary Search',
        url: 'https://leetcode.com/problems/koko-eating-bananas/',
        problemNumber: '#875',
        descriptionSnippet: 'Binary search on answer space: find minimum speed k to eat all bananas.'
      },
      {
        id: 'int-bs-6',
        title: 'Search a 2D Matrix',
        platform: 'LeetCode',
        difficulty: 'Medium',
        topic: 'Binary Search',
        url: 'https://leetcode.com/problems/search-a-2d-matrix/',
        problemNumber: '#74',
        descriptionSnippet: 'Search for target in an m x n integer matrix with sorted rows.'
      },
      {
        id: 'int-bs-7',
        title: 'Allocate Minimum Pages',
        platform: 'GeeksforGeeks',
        difficulty: 'Medium',
        topic: 'Binary Search',
        url: 'https://www.geeksforgeeks.org/problems/allocate-minimum-number-of-pages0937/1',
        descriptionSnippet: 'Famous interview problem: allocate pages such that max pages assigned is minimized.'
      },

      // Strings (Intermediate)
      {
        id: 'int-str-1',
        title: 'Longest Substring Without Repeating Characters',
        platform: 'LeetCode',
        difficulty: 'Medium',
        topic: 'Strings',
        url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
        problemNumber: '#3',
        descriptionSnippet: 'Length of longest substring without duplicate characters using sliding window.'
      },
      {
        id: 'int-str-2',
        title: 'Longest Palindromic Substring',
        platform: 'LeetCode',
        difficulty: 'Medium',
        topic: 'Strings',
        url: 'https://leetcode.com/problems/longest-palindromic-substring/',
        problemNumber: '#5',
        descriptionSnippet: 'Find longest contiguous palindromic substring using expand around centers.'
      },
      {
        id: 'int-str-3',
        title: 'Group Anagrams',
        platform: 'LeetCode',
        difficulty: 'Medium',
        topic: 'Strings',
        url: 'https://leetcode.com/problems/group-anagrams/',
        problemNumber: '#49',
        descriptionSnippet: 'Group an array of strings together if they are anagrams.'
      },
      {
        id: 'int-str-4',
        title: 'String to Integer (atoi)',
        platform: 'LeetCode',
        difficulty: 'Medium',
        topic: 'Strings',
        url: 'https://leetcode.com/problems/string-to-integer-atoi/',
        problemNumber: '#8',
        descriptionSnippet: 'Implement atoi which converts a string to a 32-bit signed integer.'
      },
      {
        id: 'int-str-5',
        title: 'Find All Anagrams in a String',
        platform: 'LeetCode',
        difficulty: 'Medium',
        topic: 'Strings',
        url: 'https://leetcode.com/problems/find-all-anagrams-in-a-string/',
        problemNumber: '#438',
        descriptionSnippet: 'Find all start indices of p anagrams in s using fixed window.'
      },
      {
        id: 'int-str-6',
        title: 'Smallest Window containing all characters',
        platform: 'GeeksforGeeks',
        difficulty: 'Medium',
        topic: 'Strings',
        url: 'https://www.geeksforgeeks.org/problems/smallest-window-in-a-string-containing-all-the-characters-of-another-string-1587115621/1',
        descriptionSnippet: 'Find smallest window in string containing all characters of pattern.'
      },

      // Two Pointers & Sliding Window
      {
        id: 'int-tp-1',
        title: '3Sum',
        platform: 'LeetCode',
        difficulty: 'Medium',
        topic: 'Two Pointers & Sliding Window',
        url: 'https://leetcode.com/problems/3sum/',
        problemNumber: '#15',
        descriptionSnippet: 'Return all unique triplets [nums[i], nums[j], nums[k]] that sum to 0.'
      },
      {
        id: 'int-tp-2',
        title: 'Container With Most Water',
        platform: 'LeetCode',
        difficulty: 'Medium',
        topic: 'Two Pointers & Sliding Window',
        url: 'https://leetcode.com/problems/container-with-most-water/',
        problemNumber: '#11',
        descriptionSnippet: 'Find two lines that together with x-axis form a container containing most water.'
      },
      {
        id: 'int-tp-3',
        title: 'Longest Repeating Character Replacement',
        platform: 'LeetCode',
        difficulty: 'Medium',
        topic: 'Two Pointers & Sliding Window',
        url: 'https://leetcode.com/problems/longest-repeating-character-replacement/',
        problemNumber: '#424',
        descriptionSnippet: 'Max length of substring containing same letter after k replacements.'
      },
      {
        id: 'int-tp-4',
        title: 'Subarray Sum Equals K',
        platform: 'LeetCode',
        difficulty: 'Medium',
        topic: 'Two Pointers & Sliding Window',
        url: 'https://leetcode.com/problems/subarray-sum-equals-k/',
        problemNumber: '#560',
        descriptionSnippet: 'Find total number of subarrays whose sum equals k using prefix sum hashmap.'
      },
      {
        id: 'int-tp-5',
        title: 'Max Consecutive Ones III',
        platform: 'LeetCode',
        difficulty: 'Medium',
        topic: 'Two Pointers & Sliding Window',
        url: 'https://leetcode.com/problems/max-consecutive-ones-iii/',
        problemNumber: '#1004',
        descriptionSnippet: 'Max consecutive 1s in binary array if you can flip at most k 0s.'
      },

      // Trees & BST
      {
        id: 'int-bst-1',
        title: 'Validate Binary Search Tree',
        platform: 'LeetCode',
        difficulty: 'Medium',
        topic: 'Trees & BST',
        url: 'https://leetcode.com/problems/validate-binary-search-tree/',
        problemNumber: '#98',
        descriptionSnippet: 'Determine if a given binary tree satisfies the BST property.'
      },
      {
        id: 'int-bst-2',
        title: 'Lowest Common Ancestor of a BST',
        platform: 'LeetCode',
        difficulty: 'Medium',
        topic: 'Trees & BST',
        url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/',
        problemNumber: '#235',
        descriptionSnippet: 'Find lowest common ancestor node of two given nodes in BST.'
      },
      {
        id: 'int-bst-3',
        title: 'Binary Tree Level Order Traversal',
        platform: 'LeetCode',
        difficulty: 'Medium',
        topic: 'Trees & BST',
        url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/',
        problemNumber: '#102',
        descriptionSnippet: 'Return the level order traversal of nodes values (BFS).'
      },
      {
        id: 'int-bst-4',
        title: 'Construct Binary Tree from Preorder & Inorder',
        platform: 'LeetCode',
        difficulty: 'Medium',
        topic: 'Trees & BST',
        url: 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/',
        problemNumber: '#105',
        descriptionSnippet: 'Reconstruct unique binary tree given preorder and inorder traversals.'
      },
      {
        id: 'int-bst-5',
        title: 'Kth Smallest Element in a BST',
        platform: 'LeetCode',
        difficulty: 'Medium',
        topic: 'Trees & BST',
        url: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/',
        problemNumber: '#230',
        descriptionSnippet: 'Find kth smallest value (1-indexed) in binary search tree.'
      },
      {
        id: 'int-bst-6',
        title: 'Binary Tree Right Side View',
        platform: 'LeetCode',
        difficulty: 'Medium',
        topic: 'Trees & BST',
        url: 'https://leetcode.com/problems/binary-tree-right-side-view/',
        problemNumber: '#199',
        descriptionSnippet: 'Return values of nodes you can see ordered from top to bottom from right.'
      },

      // Graphs
      {
        id: 'int-graph-1',
        title: 'Number of Islands',
        platform: 'LeetCode',
        difficulty: 'Medium',
        topic: 'Graphs',
        url: 'https://leetcode.com/problems/number-of-islands/',
        problemNumber: '#200',
        descriptionSnippet: 'Count number of connected land components in 2D grid using DFS/BFS.'
      },
      {
        id: 'int-graph-2',
        title: 'Clone Graph',
        platform: 'LeetCode',
        difficulty: 'Medium',
        topic: 'Graphs',
        url: 'https://leetcode.com/problems/clone-graph/',
        problemNumber: '#133',
        descriptionSnippet: 'Return a deep copy of a connected undirected graph.'
      },
      {
        id: 'int-graph-3',
        title: 'Course Schedule (Cycle Detection)',
        platform: 'LeetCode',
        difficulty: 'Medium',
        topic: 'Graphs',
        url: 'https://leetcode.com/problems/course-schedule/',
        problemNumber: '#207',
        descriptionSnippet: 'Determine if you can finish all courses using topological sort (Kahn/DFS).'
      },
      {
        id: 'int-graph-4',
        title: 'Rotting Oranges',
        platform: 'LeetCode',
        difficulty: 'Medium',
        topic: 'Graphs',
        url: 'https://leetcode.com/problems/rotting-oranges/',
        problemNumber: '#994',
        descriptionSnippet: 'Multi-source BFS to find minimum minutes until no fresh orange remains.'
      },
      {
        id: 'int-graph-5',
        title: 'Detect Cycle in an Undirected Graph',
        platform: 'GeeksforGeeks',
        difficulty: 'Medium',
        topic: 'Graphs',
        url: 'https://www.geeksforgeeks.org/problems/detect-cycle-in-an-undirected-graph/1',
        descriptionSnippet: 'Check whether an undirected graph contains a cycle using parent tracking.'
      },
      {
        id: 'int-graph-6',
        title: 'Pacific Atlantic Water Flow',
        platform: 'LeetCode',
        difficulty: 'Medium',
        topic: 'Graphs',
        url: 'https://leetcode.com/problems/pacific-atlantic-water-flow/',
        problemNumber: '#417',
        descriptionSnippet: 'Find grid cells where water can flow to both Pacific and Atlantic oceans.'
      },

      // Dynamic Programming
      {
        id: 'int-dp-1',
        title: 'Climbing Stairs',
        platform: 'LeetCode',
        difficulty: 'Easy',
        topic: 'Dynamic Programming',
        url: 'https://leetcode.com/problems/climbing-stairs/',
        problemNumber: '#70',
        descriptionSnippet: 'Number of distinct ways to climb n steps taking 1 or 2 steps at a time.'
      },
      {
        id: 'int-dp-2',
        title: 'House Robber',
        platform: 'LeetCode',
        difficulty: 'Medium',
        topic: 'Dynamic Programming',
        url: 'https://leetcode.com/problems/house-robber/',
        problemNumber: '#198',
        descriptionSnippet: 'Determine maximum amount of money you can rob tonight without alerting police.'
      },
      {
        id: 'int-dp-3',
        title: 'Coin Change',
        platform: 'LeetCode',
        difficulty: 'Medium',
        topic: 'Dynamic Programming',
        url: 'https://leetcode.com/problems/coin-change/',
        problemNumber: '#322',
        descriptionSnippet: 'Fewest number of coins needed to make up amount (unbounded knapsack).'
      },
      {
        id: 'int-dp-4',
        title: 'Longest Increasing Subsequence',
        platform: 'LeetCode',
        difficulty: 'Medium',
        topic: 'Dynamic Programming',
        url: 'https://leetcode.com/problems/longest-increasing-subsequence/',
        problemNumber: '#300',
        descriptionSnippet: 'Find length of longest strictly increasing subsequence in O(n^2) or O(n log n).'
      },
      {
        id: 'int-dp-5',
        title: 'Longest Common Subsequence',
        platform: 'LeetCode',
        difficulty: 'Medium',
        topic: 'Dynamic Programming',
        url: 'https://leetcode.com/problems/longest-common-subsequence/',
        problemNumber: '#1143',
        descriptionSnippet: 'Find length of longest common subsequence between two strings.'
      },
      {
        id: 'int-dp-6',
        title: '0 - 1 Knapsack Problem',
        platform: 'GeeksforGeeks',
        difficulty: 'Medium',
        topic: 'Dynamic Programming',
        url: 'https://www.geeksforgeeks.org/problems/0-1-knapsack-problem0945/1',
        descriptionSnippet: 'Classic 0/1 knapsack: maximize value without exceeding weight capacity.'
      },
      {
        id: 'int-dp-7',
        title: 'Unique Paths',
        platform: 'LeetCode',
        difficulty: 'Medium',
        topic: 'Dynamic Programming',
        url: 'https://leetcode.com/problems/unique-paths/',
        problemNumber: '#62',
        descriptionSnippet: 'Number of possible unique paths from top-left to bottom-right of m x n grid.'
      },
      {
        id: 'int-dp-8',
        title: 'Partition Equal Subset Sum',
        platform: 'LeetCode',
        difficulty: 'Medium',
        topic: 'Dynamic Programming',
        url: 'https://leetcode.com/problems/partition-equal-subset-sum/',
        problemNumber: '#416',
        descriptionSnippet: 'Determine if array can be partitioned into two subsets with equal sum.'
      }
    ]
  },
  {
    id: 'pro',
    title: 'Pro / Advance & CP',
    badge: 'Level 3',
    tagline: 'Competitive programming & hard algorithmic challenges',
    description: 'Conquer contest problem sets on Codeforces and LeetCode Hard challenges. Designed to build peak algorithmic rating, mathematical intuition, and speed.',
    iconName: 'Trophy',
    recommendedFor: 'Competitive programmers, candidates targeting FAANG/Tier-1 top tech companies.',
    topics: ['Codeforces CP', 'LeetCode Hard', 'Advanced Graphs & Data Structures'],
    questions: [
      // Codeforces CP
      {
        id: 'pro-cf-1',
        title: 'Watermelon',
        platform: 'Codeforces',
        difficulty: 'Div. 2/3',
        topic: 'Codeforces CP',
        url: 'https://codeforces.com/problemset/problem/4/A',
        problemNumber: '4A',
        descriptionSnippet: 'Check if watermelon of weight w can be divided into two even parts.'
      },
      {
        id: 'pro-cf-2',
        title: 'Way Too Long Words',
        platform: 'Codeforces',
        difficulty: 'Div. 2/3',
        topic: 'Codeforces CP',
        url: 'https://codeforces.com/problemset/problem/71/A',
        problemNumber: '71A',
        descriptionSnippet: 'Abbreviate words longer than 10 characters using first, length-2, last.'
      },
      {
        id: 'pro-cf-3',
        title: 'Next Round',
        platform: 'Codeforces',
        difficulty: 'Div. 2/3',
        topic: 'Codeforces CP',
        url: 'https://codeforces.com/problemset/problem/158/A',
        problemNumber: '158A',
        descriptionSnippet: 'Contestants with score equal to or greater than k-th place advance.'
      },
      {
        id: 'pro-cf-4',
        title: 'Theatre Square',
        platform: 'Codeforces',
        difficulty: 'Div. 2/3',
        topic: 'Codeforces CP',
        url: 'https://codeforces.com/problemset/problem/1/A',
        problemNumber: '1A',
        descriptionSnippet: 'Calculate least number of a x a flagstones needed to pave n x m square.'
      },
      {
        id: 'pro-cf-5',
        title: 'Beautiful Matrix',
        platform: 'Codeforces',
        difficulty: 'Div. 2/3',
        topic: 'Codeforces CP',
        url: 'https://codeforces.com/problemset/problem/263/A',
        problemNumber: '263A',
        descriptionSnippet: 'Minimum number of moves to bring 1 to the center of 5x5 matrix.'
      },
      {
        id: 'pro-cf-6',
        title: 'Registration System (Hashing)',
        platform: 'Codeforces',
        difficulty: 'Div. 2/3',
        topic: 'Codeforces CP',
        url: 'https://codeforces.com/problemset/problem/4/C',
        problemNumber: '4C',
        descriptionSnippet: 'Database system that appends numbering to already existing usernames.'
      },
      {
        id: 'pro-cf-7',
        title: 'Cut Ribbon (DP)',
        platform: 'Codeforces',
        difficulty: 'Div. 2/3',
        topic: 'Codeforces CP',
        url: 'https://codeforces.com/problemset/problem/189/A',
        problemNumber: '189A',
        descriptionSnippet: 'Maximize number of ribbon pieces of lengths a, b, or c summing to n.'
      },
      {
        id: 'pro-cf-8',
        title: 'Boredom (Dynamic Programming)',
        platform: 'Codeforces',
        difficulty: 'Div. 2/3',
        topic: 'Codeforces CP',
        url: 'https://codeforces.com/problemset/problem/455/A',
        problemNumber: '455A',
        descriptionSnippet: 'Choose numbers to delete and maximize points without keeping adjacent values.'
      },
      {
        id: 'pro-cf-9',
        title: 'K-th Beautiful String',
        platform: 'Codeforces',
        difficulty: 'Div. 2/3',
        topic: 'Codeforces CP',
        url: 'https://codeforces.com/problemset/problem/1328/B',
        problemNumber: '1328B',
        descriptionSnippet: 'Find the k-th lexicographical string of length n containing two b letters.'
      },
      {
        id: 'pro-cf-10',
        title: 'Two Buttons (BFS / Greedy)',
        platform: 'Codeforces',
        difficulty: 'Div. 2/3',
        topic: 'Codeforces CP',
        url: 'https://codeforces.com/problemset/problem/520/B',
        problemNumber: '520B',
        descriptionSnippet: 'Minimum clicks on blue (subtract 1) or red (multiply 2) button to reach m from n.'
      },

      // LeetCode Hard
      {
        id: 'pro-lc-1',
        title: 'Trapping Rain Water',
        platform: 'LeetCode',
        difficulty: 'Hard',
        topic: 'LeetCode Hard',
        url: 'https://leetcode.com/problems/trapping-rain-water/',
        problemNumber: '#42',
        descriptionSnippet: 'Compute how much water elevation map can trap after raining.'
      },
      {
        id: 'pro-lc-2',
        title: 'Median of Two Sorted Arrays',
        platform: 'LeetCode',
        difficulty: 'Hard',
        topic: 'LeetCode Hard',
        url: 'https://leetcode.com/problems/median-of-two-sorted-arrays/',
        problemNumber: '#4',
        descriptionSnippet: 'Find median of two sorted arrays in O(log(m+n)) runtime.'
      },
      {
        id: 'pro-lc-3',
        title: 'Merge k Sorted Lists',
        platform: 'LeetCode',
        difficulty: 'Hard',
        topic: 'LeetCode Hard',
        url: 'https://leetcode.com/problems/merge-k-sorted-lists/',
        problemNumber: '#23',
        descriptionSnippet: 'Merge k sorted linked lists and return it as one sorted list using min-heap.'
      },
      {
        id: 'pro-lc-4',
        title: 'Sliding Window Maximum',
        platform: 'LeetCode',
        difficulty: 'Hard',
        topic: 'LeetCode Hard',
        url: 'https://leetcode.com/problems/sliding-window-maximum/',
        problemNumber: '#239',
        descriptionSnippet: 'Find max value in sliding window of size k in O(n) using monotonic deque.'
      },
      {
        id: 'pro-lc-5',
        title: 'Binary Tree Maximum Path Sum',
        platform: 'LeetCode',
        difficulty: 'Hard',
        topic: 'LeetCode Hard',
        url: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/',
        problemNumber: '#124',
        descriptionSnippet: 'Return max path sum of any non-empty path in a binary tree.'
      },
      {
        id: 'pro-lc-6',
        title: 'Edit Distance',
        platform: 'LeetCode',
        difficulty: 'Hard',
        topic: 'LeetCode Hard',
        url: 'https://leetcode.com/problems/edit-distance/',
        problemNumber: '#72',
        descriptionSnippet: 'Minimum number of operations (insert, delete, replace) to convert word1 to word2.'
      },
      {
        id: 'pro-lc-7',
        title: 'N-Queens',
        platform: 'LeetCode',
        difficulty: 'Hard',
        topic: 'LeetCode Hard',
        url: 'https://leetcode.com/problems/n-queens/',
        problemNumber: '#51',
        descriptionSnippet: 'Place n queens on an n x n chessboard such that no two attack each other.'
      },
      {
        id: 'pro-lc-8',
        title: 'Regular Expression Matching',
        platform: 'LeetCode',
        difficulty: 'Hard',
        topic: 'LeetCode Hard',
        url: 'https://leetcode.com/problems/regular-expression-matching/',
        problemNumber: '#10',
        descriptionSnippet: 'Implement regex matching with support for "." and "*".'
      },
      {
        id: 'pro-lc-9',
        title: 'Word Break II',
        platform: 'LeetCode',
        difficulty: 'Hard',
        topic: 'LeetCode Hard',
        url: 'https://leetcode.com/problems/word-break-ii/',
        problemNumber: '#140',
        descriptionSnippet: 'Construct all possible sentences where words are in dictionary.'
      },
      {
        id: 'pro-lc-10',
        title: 'First Missing Positive',
        platform: 'LeetCode',
        difficulty: 'Hard',
        topic: 'LeetCode Hard',
        url: 'https://leetcode.com/problems/first-missing-positive/',
        problemNumber: '#41',
        descriptionSnippet: 'Find smallest missing positive integer in O(n) time and O(1) space.'
      },

      // Advanced Graphs & Data Structures
      {
        id: 'pro-ds-1',
        title: 'Dijkstra Algorithm (Shortest Path)',
        platform: 'GeeksforGeeks',
        difficulty: 'Medium',
        topic: 'Advanced Graphs & Data Structures',
        url: 'https://www.geeksforgeeks.org/problems/implementing-dijkstra-set-1-adjacency-matrix/1',
        descriptionSnippet: 'Find shortest paths from source to all vertices in weighted graph.'
      },
      {
        id: 'pro-ds-2',
        title: 'Redundant Connection (Disjoint Set Union)',
        platform: 'LeetCode',
        difficulty: 'Medium',
        topic: 'Advanced Graphs & Data Structures',
        url: 'https://leetcode.com/problems/redundant-connection/',
        problemNumber: '#684',
        descriptionSnippet: 'Find an edge that can be removed so graph becomes a tree using DSU.'
      },
      {
        id: 'pro-ds-3',
        title: 'Critical Connections in a Network (Tarjan Bridge)',
        platform: 'LeetCode',
        difficulty: 'Hard',
        topic: 'Advanced Graphs & Data Structures',
        url: 'https://leetcode.com/problems/critical-connections-in-a-network/',
        problemNumber: '#1192',
        descriptionSnippet: 'Find all bridges in server network whose removal disconnects servers.'
      },
      {
        id: 'pro-ds-4',
        title: 'Minimum Spanning Tree (Kruskal / Prim)',
        platform: 'GeeksforGeeks',
        difficulty: 'Medium',
        topic: 'Advanced Graphs & Data Structures',
        url: 'https://www.geeksforgeeks.org/problems/minimum-spanning-tree/1',
        descriptionSnippet: 'Find sum of weights of edges in Minimum Spanning Tree of given graph.'
      },
      {
        id: 'pro-ds-5',
        title: 'Alien Dictionary',
        platform: 'GeeksforGeeks',
        difficulty: 'Hard',
        topic: 'Advanced Graphs & Data Structures',
        url: 'https://www.geeksforgeeks.org/problems/alien-dictionary/1',
        descriptionSnippet: 'Find unique order of characters in alien language using topological sorting.'
      },
      {
        id: 'pro-ds-6',
        title: 'Range Minimum Query (Segment Tree)',
        platform: 'GeeksforGeeks',
        difficulty: 'Hard',
        topic: 'Advanced Graphs & Data Structures',
        url: 'https://www.geeksforgeeks.org/problems/range-minimum-query/1',
        descriptionSnippet: 'Perform range minimum query on array efficiently using Segment Tree.'
      }
    ]
  }
];
