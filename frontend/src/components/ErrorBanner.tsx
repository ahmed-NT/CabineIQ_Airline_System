import { useEffect } from "react";

interface ErrorBannerProps {
  error: string | null;
  onClose: () => void;
}

const ErrorBanner = ({ error, onClose }: ErrorBannerProps) => {
  useEffect(() => {
    if (!error) return;
    const timeout = window.setTimeout(onClose, 5000);
    return () => window.clearTimeout(timeout);
  }, [error, onClose]);

  if (!error) return null;

  return (
    <div className="error-banner">
      <span>{error}</span>
      <button type="button" onClick={onClose} className="error-banner-close">
        x
      </button>
    </div>
  );
};

export default ErrorBanner;
