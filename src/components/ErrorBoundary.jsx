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
        <div style={{ color: 'white', padding: '20px', background: 'red', margin: '20px', borderRadius: '8px' }}>
          <h3>Game UI Crashed!</h3>
          <p style={{ fontFamily: 'monospace', fontSize: '12px' }}>
            {this.state.error && this.state.error.toString()}
          </p>
          <pre style={{ fontSize: '10px', overflowX: 'auto' }}>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
