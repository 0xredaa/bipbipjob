import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback: ReactNode;
  onError?: (error: Error) => void;
}

interface State {
  hasError: boolean;
}

/**
 * Catches errors thrown while mounting/rendering the WebGL <Canvas> (most
 * commonly "Error creating WebGL context" on machines without hardware
 * acceleration). Without this, such an error unmounts the whole page tree and
 * leaves a black screen. With it, we render a graceful 2D fallback and the
 * surrounding overlay UI keeps working.
 */
export class CanvasErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    // eslint-disable-next-line no-console
    console.error('[3D] WebGL scene failed to render:', error);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) return <>{this.props.fallback}</>;
    return this.props.children;
  }
}
