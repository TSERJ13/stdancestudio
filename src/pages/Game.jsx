import React from 'react';

export default function Game() {
  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: '#05060a',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: '70px',
      paddingBottom: '20px'
    }}>
      <iframe
        src="/game.html"
        title="Dancing Bricks Original Game"
        style={{
          width: '100%',
          maxWidth: '460px',
          height: 'calc(100vh - 90px)',
          minHeight: '620px',
          border: 'none',
          borderRadius: '16px',
          boxShadow: '0 0 30px rgba(212, 165, 90, 0.25)'
        }}
      />
    </div>
  );
}
