import React, {ReactNode} from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches unhandled errors in the component tree and prevents white-screen crashes.
 * Shows a user-friendly message with a reset button to return to the app.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {hasError: false, error: null};
  }

  static getDerivedStateFromError(error: Error): State {
    return {hasError: true, error};
  }

  componentDidCatch(error: Error) {
    // Log to your error tracking service here if available.
    console.error('ErrorBoundary caught:', error);
  }

  resetError = () => {
    this.setState({hasError: false, error: null});
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>
              The app encountered an unexpected error. Try restarting it.
            </Text>
            {__DEV__ && this.state.error && (
              <Text style={styles.debug}>{this.state.error.message}</Text>
            )}
            <Button
              title="Try again"
              onPress={this.resetError}
              color="#3b82f6"
            />
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  content: {paddingHorizontal: 24, alignItems: 'center'},
  title: {fontSize: 20, fontWeight: '600', marginBottom: 12, color: '#1e293b'},
  message: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 24,
    textAlign: 'center',
  },
  debug: {
    fontSize: 12,
    color: '#dc2626',
    marginBottom: 16,
    fontFamily: 'Courier New',
    maxWidth: 280,
  },
});
