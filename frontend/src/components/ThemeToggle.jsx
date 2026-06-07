import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-secondary"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
        justifyContent: 'center',
        padding: '10px 16px',
        fontSize: '0.9rem'
      }}
    >
      {theme === 'dark' ? (
        <>
          <Sun size={18} />
          <span>Light Mode</span>
        </>
      ) : (
        <>
          <Moon size={18} />
          <span>Dark Mode</span>
        </>
      )}
    </button>
  );
}
