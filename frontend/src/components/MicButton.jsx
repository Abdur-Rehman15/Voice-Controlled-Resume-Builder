import React from 'react';

const MicButton = ({ onClick, listening }) => (
  <button
    onClick={onClick}
    style={{
      background: listening ? '#e53935' : '#43a047',
      color: '#fff',
      border: 'none',
      borderRadius: '50%',
      width: 50,
      height: 50,
      fontSize: 24,
      cursor: 'pointer',
      outline: 'none',
      marginRight: 10
    }}
    aria-label="مائیکروفون"
  >
    {listening ? '🎤...' : '🎤'}
  </button>
);

export default MicButton;
