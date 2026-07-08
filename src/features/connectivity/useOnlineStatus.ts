import {useEffect, useState} from 'react';
import NetInfo from '@react-native-community/netinfo';

/**
 * Subscribes to network state and returns whether the device is online.
 * Can be used to conditionally show an offline banner or disable mutation buttons.
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const subscription = NetInfo.addEventListener(state => {
      setIsOnline(
        state.isConnected !== false && state.isInternetReachable !== false,
      );
    });

    // Get initial state synchronously
    NetInfo.fetch().then(state => {
      setIsOnline(
        state.isConnected !== false && state.isInternetReachable !== false,
      );
    });

    return () => subscription();
  }, []);

  return isOnline;
}
