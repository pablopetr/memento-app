import {zodResolver} from '@hookform/resolvers/zod';
import React from 'react';
import {Controller, useForm} from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';

import {Button} from '../../../components/Button';
import {TextField} from '../../../components/TextField';
import {ReminderForm, reminderSchema} from '../reminderSchema';
import {DateTimeField} from './DateTimeField';
import {RepeatPicker} from './RepeatPicker';

interface ReminderFormViewProps {
  defaultValues: ReminderForm;
  submitLabel: string;
  onSubmit: (values: ReminderForm) => void;
  isSubmitting: boolean;
  /** Extra actions rendered below the submit button (e.g. delete in edit mode). */
  footer?: React.ReactNode;
}

/**
 * The single form shared by create and edit (DRY): the two screens differ only
 * in `defaultValues`, `submitLabel`, `onSubmit` and the optional `footer`.
 * Validation is declared once by `reminderSchema`.
 */
export function ReminderFormView({
  defaultValues,
  submitLabel,
  onSubmit,
  isSubmitting,
  footer,
}: ReminderFormViewProps) {
  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<ReminderForm>({
    resolver: zodResolver(reminderSchema),
    defaultValues,
  });

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <Controller
          control={control}
          name="title"
          render={({field: {onChange, onBlur, value}}) => (
            <TextField
              label="Title"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.title?.message}
              placeholder="Take medication"
              editable={!isSubmitting}
            />
          )}
        />

        <Controller
          control={control}
          name="notes"
          render={({field: {onChange, onBlur, value}}) => (
            <TextField
              label="Notes"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.notes?.message}
              placeholder="Optional details"
              multiline
              editable={!isSubmitting}
            />
          )}
        />

        <Controller
          control={control}
          name="remindAt"
          render={({field: {onChange, value}}) => (
            <DateTimeField
              label="Remind me at"
              value={value}
              onChange={onChange}
              error={errors.remindAt?.message}
              disabled={isSubmitting}
            />
          )}
        />

        <Controller
          control={control}
          name="repeat"
          render={({field: {onChange, value}}) => (
            <RepeatPicker label="Repeat" value={value} onChange={onChange} />
          )}
        />

        <Button
          title={submitLabel}
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          style={styles.submit}
        />
        {footer}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1, backgroundColor: '#fff'},
  content: {padding: 24},
  submit: {marginTop: 8},
});
