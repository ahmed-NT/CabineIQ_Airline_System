import { useState } from "react";
import type { FormEvent } from "react";
import { login } from "../lib/api";

interface LoginOverlayProps {
  onSuccess: () => void;
  onError?: (message: string) => void;
}

const LoginOverlay = ({ onSuccess, onError }: LoginOverlayProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await login(username, password);
      localStorage.setItem("ram_token", response.token);
      localStorage.setItem("ram_username", response.username);
      onSuccess();
    } catch {
      const message = "ACCESS DENIED";
      setError(message);
      onError?.(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-overlay">
      <form className="login-card fade-in" onSubmit={onSubmit}>
        <svg viewBox="0 0 120 80" className="login-crest" aria-hidden="true">
          <circle cx="60" cy="38" r="18" />
          <path d="M60 20l5 11h12l-10 7 4 12-11-8-11 8 4-12-10-7h12z" />
          <path d="M16 38c8-8 14-10 24-10M16 46c9-4 16-4 24-2" />
          <path d="M104 38c-8-8-14-10-24-10M104 46c-9-4-16-4-24-2" />
          <path d="M52 16h16M54 12h12M58 8h4" />
        </svg>
        <div className="brand-ar">الخطوط الملكية المغربية</div>
        <div className="brand-main">ROYAL AIR MAROC</div>
        <div className="brand-sub">OPERATIONS CENTER</div>
        <hr />
        <input
          className="ram-input"
          placeholder="Username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
        />
        <input
          className="ram-input"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <button type="submit" className="ram-btn" disabled={isLoading}>
          {isLoading ? "AUTHENTICATING..." : "ACCESS SYSTEM"}
        </button>
        {error ? <p className="login-error">{error}</p> : null}
      </form>
    </div>
  );
};

export default LoginOverlay;
