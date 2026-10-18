const CloseButton = ({ onClick }) => (
  <button type="button" className="message-close" aria-label="Close" onClick={onClick}>
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  </button>
);

export default CloseButton;
