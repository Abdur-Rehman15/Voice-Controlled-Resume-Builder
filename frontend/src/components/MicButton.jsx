import React from 'react';

const MicButton = ({ onClick, listening, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      background: disabled ? '#ccc' : (listening ? '#e53935' : '#43a047'),
      color: '#fff',
      border: 'none',
      borderRadius: '50%',
      width: 50,
      height: 50,
      fontSize: 24,
      cursor: disabled ? 'not-allowed' : 'pointer',
      outline: 'none',
      marginRight: 10,
      opacity: disabled ? 0.6 : 1
    }}
    aria-label="مائیکروفون"
  >
    {listening ? '🎤...' : '🎤'}
  </button>
);

export default MicButton;
