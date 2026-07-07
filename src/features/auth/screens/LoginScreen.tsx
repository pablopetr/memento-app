import {zodResolver} from '@hookform/resolvers/zod';
import React, {useRef} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {StyleSheet, Text, TextInput, View} from 'react-native';

import {Button} from '../../../components/Button';
import {ScreenContainer} from '../../../components/ScreenContainer';
import {TextField} from '../../../components/TextField';
import {getErrorMessage} from '../../../utils/getErrorMessage';
import {useLogin} from '../hooks/useLogin';
import {LoginForm, loginSchema} from '../loginSchema';

/**
 * Presentational login screen. Validation is declared by `loginSchema`;
 * networking lives in `useLogin`. On success the auth context swaps the
 * navigator to the main stack, so there is no imperative navigation here.
 */
export function LoginScreen() {
  const passwordRef = useRef<TextInput>(null);
  const login = useLogin();

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {email: '', password: ''},
  });

  const onSubmit = handleSubmit(values => login.mutate(values));

  return (
    <ScreenContainer centered>
      <Text style={styles.title}>Memento</Text>

      <Controller
        control={control}
        name="email"
        render={({field: {onChange, onBlur, value}}) => (
          <TextField
            label="Email"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.email?.message}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            editable={!login.isPending}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({field: {onChange, onBlur, value}}) => (
          <TextField
            ref={passwordRef}
            label="Password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password?.message}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            returnKeyType="done"
            onSubmitEditing={onSubmit}
            editable={!login.isPending}
          />
        )}
      />

      {login.isError ? (
        <View style={styles.serverError}>
          <Text style={styles.serverErrorText}>
            {getErrorMessage(login.error)}
          </Text>
        </View>
      ) : null}

      <Button
        title="Log in"
        onPress={onSubmit}
        loading={login.isPending}
        style={styles.submit}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 32,
    color: '#111827',
  },
  serverError: {marginBottom: 12},
  serverErrorText: {color: '#dc2626', fontSize: 14, textAlign: 'center'},
  submit: {marginTop: 8},
});
