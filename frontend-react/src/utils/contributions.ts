export const recordContribution = (userEmail: string | undefined) => {
  if (!userEmail) return;
  const today = new Date().toISOString().split('T')[0];
  const storageKey = `user_contributions_${userEmail.toLowerCase()}`;
  
  const existingStr = localStorage.getItem(storageKey);
  let contributions: Record<string, number> = {};
  if (existingStr) {
    try {
      contributions = JSON.parse(existingStr);
    } catch (e) {}
  }
  
  if (contributions[today]) {
    contributions[today] += 1;
  } else {
    contributions[today] = 1;
  }
  
  localStorage.setItem(storageKey, JSON.stringify(contributions));
};
