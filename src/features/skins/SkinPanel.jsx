import styles from '../../styles/SkinPanel.module.scss';

const availableSkins = [
  {
    id: 'neon',
    name: 'Neon',
    buttonColor: '#39ff14',
    backgroundColor: 'linear-gradient(135deg, #0f0f0f, #1a1a1a, #8000ff)',
    price: 1000,
    className: 'theme-neon'
  },
  {
    id: 'gold',
    name: 'Gold',
    buttonColor: '#FFD700',
    backgroundColor: 'linear-gradient(135deg, #1a1200, #3b2f00, #FFD700)',
    price: 2500,
    className: 'theme-gold'
  },
  {
    id: 'ocean',
    name: 'Ocean',
    buttonColor: '#00bfff',
    backgroundColor: 'linear-gradient(135deg, #001f3f, #004080, #00bfff)',
    price: 4000,
    className: 'theme-ocean'
  },
  {
    id: 'inferno',
    name: 'Inferno',
    buttonColor: '#ff4500',
    backgroundColor: 'linear-gradient(135deg, #2b0000, #5a0000, #ff4500)',
    price: 6000,
    className: 'theme-inferno'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    buttonColor: '#ff00ff',
    backgroundColor: 'linear-gradient(135deg, #0a0a23, #2e003e, #ff00ff)',
    price: 8000,
    className: 'theme-cyberpunk'
  },
  {
    id: 'galaxy',
    name: 'Galaxy',
    buttonColor: '#8a2be2',
    backgroundColor: 'linear-gradient(135deg, #000018, #1b003b, #8a2be2)',
    price: 10000,
    className: 'theme-galaxy'
  }
];

export default function SkinPanel({ gameState, setGameState }) {
  const {
    credits,
    skins = { unlocked: [], active: null }
  } = gameState;

  const handleBuyOrActivate = (skin) => {
    if (skins.unlocked.includes(skin.id)) {
      setGameState(prev => ({
        ...prev,
        skins: { ...skins, active: skin.id }
      }));
    } else if (credits >= skin.price) {
      setGameState(prev => ({
        ...prev,
        credits: prev.credits - skin.price,
        skins: {
          unlocked: [...skins.unlocked, skin.id],
          active: skin.id
        }
      }));
    }
  };

  return (
    <div className={styles.skinGrid}>
      {availableSkins.map(skin => (
        <div
          key={skin.id}
          className={`${styles.skinCard} ${skins.active === skin.id ? styles.active : ''}`}
        >
          <h3>{skin.name}</h3>

          {}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
            <div
              title="Button"
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '4px',
                backgroundColor: skin.buttonColor,
                border: '1px solid white'
              }}
            />
            <div
              title="Background"
              style={{
                width: '48px',
                height: '24px',
                borderRadius: '4px',
                background: skin.backgroundColor,
                border: '1px solid white'
              }}
            />
          </div>

          <p>💰 ₴{skin.price}</p>
          <button
            onClick={() => handleBuyOrActivate(skin)}
            disabled={skin.price > credits && !skins.unlocked.includes(skin.id)}
          >
            {skins.unlocked.includes(skin.id)
              ? (skins.active === skin.id ? 'Activated' : 'Activate')
              : 'Buy'}
          </button>
        </div>
      ))}
    </div>
  );
}
