import { useEffect, useState } from "react";

interface HeaderProps {
  onLogout: () => void;
}

const Header = ({ onLogout }: HeaderProps) => {
  const [time, setTime] = useState(new Date());
  const username = localStorage.getItem("ram_username") ?? "OPERATOR";

  useEffect(() => {
    const timer = window.setInterval(() => setTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <header className="ram-header">
      <div className="ram-header-topline" />
      <div className="ram-header-content">
        <div className="ram-header-left">
          <svg viewBox="0 0 64 32" className="header-crest" aria-hidden="true">
            <circle cx="16" cy="16" r="8" />
            <path d="M16 9l2.4 5h5.6l-4.6 3.3 1.7 5.4-5.1-3.7-5.1 3.7 1.7-5.4L8 14h5.6z" />
            <path d="M0 16c4-4 7-5 11-5M0 20c4-2 7-2 11-1" />
            <path d="M32 16c-4-4-7-5-11-5M32 20c-4-2-7-2-11-1" />
          </svg>
          <strong className="header-brand">ROYAL AIR MAROC</strong>
          <span className="header-divider" />
          <span className="header-sub">OPERATIONS CENTER</span>
        </div>
        <div className="ram-header-right">
          <span className="header-time">
            {time.toISOString().slice(11, 19)} UTC
          </span>
          <span className="header-user">{username}</span>
          <button type="button" className="header-logout" onClick={onLogout}>
            LOGOUT
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
