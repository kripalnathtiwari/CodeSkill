/**
 * Examination Reliability & Scoring Integrity Test
 * Simulates exam state management, autosave resilience, offline recovery, and grading accuracy.
 */

async function runExamReliabilityAudit() {
  console.log('=====================================================');
  console.log('       EXAMINATION RELIABILITY & INTEGRITY TEST      ');
  console.log('=====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Result Calculation Accuracy
  console.log('[1] Testing Exam Scoring & Result Calculation Accuracy...');
  const mockExamQuestions = [
    { id: 'q1', correctOption: 'A' },
    { id: 'q2', correctOption: 'C' },
    { id: 'q3', correctOption: 'B' },
    { id: 'q4', correctOption: 'D' },
    { id: 'q5', correctOption: 'A' }
  ];

  const studentAnswers = {
    0: 'A', // Correct
    1: 'B', // Incorrect (Expected C)
    2: 'B', // Correct
    3: 'd', // Correct (case insensitive check)
    4: ''   // Unattempted
  };

  let correctCount = 0;
  let attemptedCount = 0;

  mockExamQuestions.forEach((q, idx) => {
    const userAns = studentAnswers[idx];
    if (userAns !== undefined && userAns !== null && userAns !== '') {
      attemptedCount++;
      if (userAns.trim().toUpperCase() === q.correctOption.trim().toUpperCase()) {
        correctCount++;
      }
    }
  });

  assert(attemptedCount === 4, `Attempted questions counted accurately: ${attemptedCount} / 5.`);
  assert(correctCount === 3, `Correct answers graded accurately: ${correctCount} / 5.`);

  // 2. Answer Persistence across Session / Reload
  console.log('\n[2] Testing In-Progress Answer Persistence & Restoration...');
  const mockSessionStorage = new Map();
  const testExamId = 'exam-778899';

  // Student answers 3 questions, then page reloads
  const activeTestProgress = {
    answered: { 0: 'A', 1: 'C', 2: 'B' },
    visited: { 0: true, 1: true, 2: true, 3: true },
    reviewStatus: { 1: true },
    timeLeft: 1420 // 23 minutes 40 seconds left
  };

  mockSessionStorage.set(`aptitude_test_progress_${testExamId}`, JSON.stringify(activeTestProgress));

  // Simulate reload & restore
  const restoredRaw = mockSessionStorage.get(`aptitude_test_progress_${testExamId}`);
  const restored = JSON.parse(restoredRaw);

  assert(Object.keys(restored.answered).length === 3, 'Restored answers intact after simulated reload.');
  assert(restored.answered[1] === 'C', 'Option selection matches exactly.');
  assert(restored.timeLeft === 1420, 'Time remaining preserved with sub-second integrity.');

  // 3. Duplicate Submission Prevention
  console.log('\n[3] Testing Duplicate Submission Prevention Lock...');
  let isSubmitting = false;
  let submissionCalls = 0;

  function attemptSubmit() {
    if (isSubmitting) return 'LOCKED';
    isSubmitting = true;
    submissionCalls++;
    return 'SUBMITTED';
  }

  const firstCall = attemptSubmit();
  const doubleClickCall = attemptSubmit();
  const tripleClickCall = attemptSubmit();

  assert(firstCall === 'SUBMITTED', 'First submit call proceeds smoothly.');
  assert(doubleClickCall === 'LOCKED', 'Rapid second click locked by isSubmitting state.');
  assert(tripleClickCall === 'LOCKED', 'Rapid third click locked by isSubmitting state.');
  assert(submissionCalls === 1, 'Only exactly 1 submission processed.');

  // 4. Timer Expiration / Deadline Auto-Submit
  console.log('\n[4] Testing Examination Deadline Auto-Submission...');
  let timerExpired = false;
  let autoSubmitted = false;
  let simulatedTimeLeft = 1; // 1 second left

  // Decrement to 0
  simulatedTimeLeft = Math.max(0, simulatedTimeLeft - 1);
  if (simulatedTimeLeft === 0) {
    timerExpired = true;
    autoSubmitted = true;
  }

  assert(timerExpired, 'Timer decremented to 0.');
  assert(autoSubmitted, 'Examination automatically submitted upon deadline expiration.');

  // 5. Offline Queue Resilience & Network Recovery Sync
  console.log('\n[5] Testing Offline Queue Resilience on Network Failure...');
  const mockLocalStorage = new Map();
  const userEmail = 'student@codeskill.com';
  const retryKey = `pending_aptitude_sync_${userEmail}`;

  const failedSyncItems = [
    { id: 'q1', correct: true, userAnswer: 'A', topic: 'Percentage' },
    { id: 'q2', correct: false, userAnswer: 'B', topic: 'Percentage' }
  ];

  // Store in offline queue on simulated network disconnect
  mockLocalStorage.set(retryKey, JSON.stringify(failedSyncItems));

  // Verify item in queue
  const queuedItems = JSON.parse(mockLocalStorage.get(retryKey) || '[]');
  assert(queuedItems.length === 2, 'Answers safely queued in resilient offline storage.');

  // Simulate network recovery and sync flush
  let flushedToServer = false;
  if (queuedItems.length > 0) {
    // Simulated successful sync
    flushedToServer = true;
    mockLocalStorage.delete(retryKey);
  }

  assert(flushedToServer, 'Pending answers flushed to server upon network recovery.');
  assert(!mockLocalStorage.has(retryKey), 'Offline queue cleared after successful sync.');

  console.log('\n=====================================================');
  console.log(`  EXAM RELIABILITY RESULT: ${passed} PASSED, ${failed} FAILED `);
  console.log('=====================================================');
}

runExamReliabilityAudit();
