import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useLayoutEffect, useMemo} from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {ErrorState} from '../../../components/ErrorState';
import type {MainStackParamList} from '../../../app/navigation/types';
import {getErrorMessage} from '../../../utils/getErrorMessage';
import {ReminderFormView} from '../components/ReminderFormView';
import {useReminder} from '../hooks/useReminder';
import {
  useCreateReminder,
  useDeleteReminder,
  useUpdateReminder,
} from '../hooks/useReminderMutations';
import {ReminderForm} from '../reminderSchema';

type Props = NativeStackScreenProps<MainStackParamList, 'ReminderForm'>;
type Navigation = NativeStackNavigationProp<MainStackParamList, 'ReminderForm'>;

/**
 * One route for both create and edit (the form itself is shared — see
 * ReminderFormView). Delegates to a mode-specific subcomponent so each owns its
 * own hooks without conditional-hook pitfalls.
 */
export function ReminderFormScreen({navigation, route}: Props) {
  const reminderId = route.params?.reminderId;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: reminderId ? 'Edit reminder' : 'New reminder',
    });
  }, [navigation, reminderId]);

  return reminderId ? (
    <EditReminder id={reminderId} navigation={navigation} />
  ) : (
    <CreateReminder navigation={navigation} />
  );
}

function CreateReminder({navigation}: {navigation: Navigation}) {
  const create = useCreateReminder();

  const defaultValues = useMemo<ReminderForm>(() => {
    const remindAt = new Date();
    remindAt.setSeconds(0, 0);
    remindAt.setHours(remindAt.getHours() + 1);
    return {title: '', notes: '', remindAt, repeat: 'none'};
  }, []);

  const onSubmit = (values: ReminderForm) =>
    create.mutate(values, {
      onSuccess: () => navigation.goBack(),
      onError: error =>
        Alert.alert('Could not create reminder', getErrorMessage(error)),
    });

  return (
    <ReminderFormView
      defaultValues={defaultValues}
      submitLabel="Create"
      onSubmit={onSubmit}
      isSubmitting={create.isPending}
    />
  );
}

function EditReminder({id, navigation}: {id: string; navigation: Navigation}) {
  const {data, isLoading, isError, refetch} = useReminder(id);
  const update = useUpdateReminder(id);
  const remove = useDeleteReminder();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError || !data) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  const defaultValues: ReminderForm = {
    title: data.title,
    notes: data.notes,
    remindAt: new Date(data.remindAt),
    repeat: data.repeat,
  };

  const onSubmit = (values: ReminderForm) =>
    update.mutate(values, {
      onSuccess: () => navigation.goBack(),
      onError: error =>
        Alert.alert('Could not save changes', getErrorMessage(error)),
    });

  const confirmDelete = () =>
    Alert.alert('Delete reminder', 'This can’t be undone.', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          remove.mutate(id, {
            onSuccess: () => navigation.goBack(),
            onError: error =>
              Alert.alert('Could not delete reminder', getErrorMessage(error)),
          }),
      },
    ]);

  return (
    <ReminderFormView
      defaultValues={defaultValues}
      submitLabel="Save"
      onSubmit={onSubmit}
      isSubmitting={update.isPending}
      footer={
        <Pressable
          accessibilityRole="button"
          disabled={remove.isPending}
          onPress={confirmDelete}
          style={styles.delete}>
          <Text style={styles.deleteText}>Delete reminder</Text>
        </Pressable>
      }
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  delete: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  deleteText: {color: '#dc2626', fontSize: 16, fontWeight: '600'},
});
