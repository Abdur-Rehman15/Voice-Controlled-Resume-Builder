import React from 'react';

const MicButton = ({ onClick, listening, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`mic-button ${listening ? 'listening' : ''} ${disabled ? 'disabled' : ''}`}
    aria-label="مائیکروفون"
  >
    <div className="mic-icon">
      {listening ? '🎤' : '🎤'}
    </div>
    {listening && (
      <div className="pulse-ring"></div>
    )}
    <style jsx>{`
      .mic-button {
        position: relative;
        width: 70px;
        height: 70px;
        border: none;
        border-radius: 50%;
        background: ${disabled ? 
          'linear-gradient(45deg, #ccc, #999)' : 
          listening ? 
            'linear-gradient(45deg, #ff4444, #ff6666)' : 
            'linear-gradient(45deg, #4CAF50, #81C784)'
        };
        color: white;
        cursor: ${disabled ? 'not-allowed' : 'pointer'};
        outline: none;
        margin-right: 15px;
        opacity: ${disabled ? 0.6 : 1};
        transition: all 0.3s ease;
        box-shadow: ${disabled ? 
          'none' : 
          listening ? 
            '0 8px 25px rgba(255, 68, 68, 0.4)' : 
            '0 8px 25px rgba(76, 175, 80, 0.4)'
        };
        overflow: hidden;
      }
      
      .mic-button:not(.disabled):hover {
        transform: translateY(-3px);
        box-shadow: ${listening ? 
          '0 12px 35px rgba(255, 68, 68, 0.6)' : 
          '0 12px 35px rgba(76, 175, 80, 0.6)'
        };
      }
      
      .mic-button:not(.disabled):active {
        transform: translateY(-1px);
      }
      
      .mic-icon {
        font-size: 28px;
        z-index: 2;
        position: relative;
        animation: ${listening ? 'bounce 1s ease-in-out infinite' : 'none'};
      }
      
      .pulse-ring {
        position: absolute;
        top: -10px;
        left: -10px;
        right: -10px;
        bottom: -10px;
        border: 3px solid rgba(255, 68, 68, 0.6);
        border-radius: 50%;
        animation: pulse-ring 2s ease-in-out infinite;
      }
      
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-3px); }
      }
      
      @keyframes pulse-ring {
        0% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.2);
          opacity: 0.7;
        }
        100% {
          transform: scale(1.4);
          opacity: 0;
        }
      }
      
      .mic-button.listening {
        animation: listening-glow 2s ease-in-out infinite;
      }
      
      @keyframes listening-glow {
        0%, 100% {
          box-shadow: 0 8px 25px rgba(255, 68, 68, 0.4);
        }
        50% {
          box-shadow: 0 8px 35px rgba(255, 68, 68, 0.8);
        }
      }
    `}</style>
  </button>
);

export default MicButton;
