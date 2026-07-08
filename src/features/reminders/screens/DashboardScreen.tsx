import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useLayoutEffect} from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {ErrorState} from '../../../components/ErrorState';
import {Fab} from '../../../components/Fab';
import type {MainStackParamList} from '../../../app/navigation/types';
import {useAuth} from '../../auth/AuthContext';
import {Reminder} from '../../../types/reminder';
import {EmptyReminders} from '../components/EmptyReminders';
import {ReminderCard} from '../components/ReminderCard';
import {ReminderListSkeleton} from '../components/ReminderListSkeleton';
import {useReminders} from '../hooks/useReminders';

type Props = NativeStackScreenProps<MainStackParamList, 'Dashboard'>;

const keyExtractor = (reminder: Reminder) => reminder.id;
const CARD_HEIGHT = 88; // padding + title + time + gap + margin (px)

const getItemLayout = (
  _: ArrayLike<Reminder> | null | undefined,
  index: number,
) => ({
  length: CARD_HEIGHT,
  offset: CARD_HEIGHT * index,
  index,
});

/** Header action; self-contained so it stays a stable component reference. */
function HeaderLogoutButton() {
  const {signOut} = useAuth();
  return (
    <Pressable accessibilityRole="button" hitSlop={8} onPress={() => signOut()}>
      <Text style={styles.logout}>Log out</Text>
    </Pressable>
  );
}

/**
 * Home dashboard. Presentational: all paging/caching lives in `useReminders`.
 * Renders loading / error / empty / loaded states and lets the user create a
 * reminder (FAB) or edit one (card tap). The header exposes logout.
 */
export function DashboardScreen({navigation}: Props) {
  const insets = useSafeAreaInsets();
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useReminders();

  // Logout lives in the native header (top-right). headerRight is a render
  // callback (not a nested component), so the rule is a false positive here.
  useLayoutEffect(() => {
    navigation.setOptions({
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => <HeaderLogoutButton />,
    });
  }, [navigation]);

  const openReminder = useCallback(
    (reminderId: string) => navigation.navigate('ReminderForm', {reminderId}),
    [navigation],
  );

  const renderItem = useCallback(
    ({item}: ListRenderItemInfo<Reminder>) => (
      <ReminderCard reminder={item} onPress={openReminder} />
    ),
    [openReminder],
  );

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ReminderListSkeleton />
      </View>
    );
  }

  if (isError) {
    return <ErrorState message={error?.message} onRetry={() => refetch()} />;
  }

  const reminders = data?.pages.flatMap(page => page.items) ?? [];

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.list}
        data={reminders}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews
        contentContainerStyle={[
          styles.listContent,
          {paddingBottom: 96 + insets.bottom},
          reminders.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={EmptyReminders}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <Text style={styles.footer}>Loading…</Text>
          ) : null
        }
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      />
      <Fab
        accessibilityLabel="Create reminder"
        onPress={() => navigation.navigate('ReminderForm')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  list: {flex: 1},
  listContent: {paddingHorizontal: 16, paddingTop: 12},
  listContentEmpty: {flexGrow: 1},
  footer: {textAlign: 'center', color: '#6b7280', paddingVertical: 16},
  logout: {color: '#2563eb', fontSize: 16, fontWeight: '600'},
});
