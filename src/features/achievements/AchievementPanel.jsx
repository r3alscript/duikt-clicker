import { useEffect, useState } from 'react';
import styles from '../../styles/Achievement.module.scss';

export default function AchievementPanel({ gameState }) {
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    if (!gameState || !gameState.stats) return;

    const {
      totalCreditsEarned = 0,
      totalClicks = 0,
      totalUpgrades = 0,
      totalCasesOpened = 0
    } = gameState.stats;

    const skinsUnlocked = gameState.skins?.unlocked?.length || 0;
    const robocoins = gameState.prestige?.robocoins || 0;

    const newAchievements = [
      {
        id: 'credits_million',
        name: '💰 Collect 1,000,000 credits',
        progress: totalCreditsEarned,
        goal: 1_000_000
      },
      {
        id: 'clicks_100k',
        name: '🖱️ Make 100,000 clicks',
        progress: totalClicks,
        goal: 100_000
      },
      {
        id: 'open_cases',
        name: '🎁 Open 500 cases',
        progress: totalCasesOpened,
        goal: 500
      },
      {
        id: 'upgrades_master',
        name: '🛠️ Make 200 upgrades',
        progress: totalUpgrades,
        goal: 200
      },
      {
        id: 'skin_collector',
        name: '🎨 Unlock 6 skins',
        progress: skinsUnlocked,
        goal: 6
      },
      {
        id: 'prestige_1',
        name: '👑 Use prestige 1 time',
        progress: robocoins,
        goal: 1
      }
    ];

    setAchievements(newAchievements);
  }, [gameState]);

  if (!achievements.length) {
    return <p>🔁 Loading achievements...</p>;
  }

  return (
    <div className={styles.achievementGrid}>
      {achievements.map(a => {
        const percent = Math.min((a.progress / a.goal) * 100, 100).toFixed(1);
        return (
          <div key={a.id} className={styles.achievementCard}>
            <h3>{a.name}</h3>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${percent}%` }}
              />
            </div>
            <p>{Math.floor(a.progress)} / {a.goal}</p>
          </div>
        );
      })}
    </div>
  );
}
