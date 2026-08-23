import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          color: '#fff',
          padding: '35px 25px',
          background: 'var(--color-bg-card, #121214)',
          border: '1px solid rgba(212, 166, 74, 0.4)',
          margin: '40px auto',
          maxWidth: '600px',
          borderRadius: '16px',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
        }}>
          <h3 style={{ color: 'var(--color-gold, #d4a64a)', marginBottom: '12px', fontSize: '1.4rem' }}>
            ST Dance Studio — გვერდის განახლება
          </h3>
          <p style={{ color: '#b0ab9f', fontSize: '0.95rem', marginBottom: '22px', lineHeight: '1.6' }}>
            საიტზე განხორციელდა ახალი განახლება. გთხოვთ დააჭიროთ ქვემოთ მოცემულ ღილაკს გვერდის განახლებისთვის.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'var(--color-gold, #d4a64a)',
              color: '#000',
              border: 'none',
              padding: '12px 28px',
              borderRadius: '8px',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '0.95rem'
            }}
          >
            გვერდის განახლება ➔
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
