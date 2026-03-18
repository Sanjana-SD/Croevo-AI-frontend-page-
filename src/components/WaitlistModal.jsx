import React, { useState } from 'react';
import './WaitlistModal.css';

const WaitlistModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setEmail('');
      }, 2000);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        {!submitted ? (
          <>
            <h2 className="modal-title">JOIN THE REVOLUTION</h2>
            <p className="subtitle" style={{ fontSize: '14px' }}>
              Be the first to build the future of gaming.
            </p>
            <form className="waitlist-form" onSubmit={handleSubmit}>
              <input
                type="email"
                className="input-field"
                placeholder="Enter your transmission address (email)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary">
                INITIALIZE ACCESS
              </button>
            </form>
          </>
        ) : (
          <div className="success-message">
            <h3>TRANSMISSION RECEIVED</h3>
            <p>You have been added to the early access queue.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaitlistModal;
