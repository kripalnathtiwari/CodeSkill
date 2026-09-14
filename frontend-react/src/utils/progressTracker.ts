export interface DailyProgress {
  questionsSolved: number;
  pointsEarned: number;
}

export const recordDailyProgress = (userEmail: string | undefined | null, questionsDelta: number, pointsDelta: number) => {
  if (!userEmail) return;

  const key = `daily_progress_${userEmail.toLowerCase()}`;
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  let currentProgress: Record<string, DailyProgress> = {};
  
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      currentProgress = JSON.parse(saved);
    }
  } catch (e) {
    console.error("Error reading daily progress from local storage", e);
  }

  if (!currentProgress[today]) {
    currentProgress[today] = { questionsSolved: 0, pointsEarned: 0 };
  }

  currentProgress[today].questionsSolved += questionsDelta;
  currentProgress[today].pointsEarned += pointsDelta;

  localStorage.setItem(key, JSON.stringify(currentProgress));
};

export const getWeeklyProgress = (userEmail: string | undefined | null) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const data = [];
  const today = new Date();
  
  let currentProgress: Record<string, DailyProgress> = {};
  
  if (userEmail) {
    const key = `daily_progress_${userEmail.toLowerCase()}`;
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        currentProgress = JSON.parse(saved);
      }
    } catch (e) {
      console.error("Error reading daily progress from local storage", e);
    }
  }

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().split('T')[0];
    
    const dayStats = currentProgress[dateKey] || { questionsSolved: 0, pointsEarned: 0 };

    data.push({
      name: days[d.getDay()],
      questionsSolved: dayStats.questionsSolved,
      pointsEarned: dayStats.pointsEarned,
      fullDate: dateKey
    });
  }

  return data;
};
