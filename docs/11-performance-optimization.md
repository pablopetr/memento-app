# 11. Performance Optimization

## Task

Keep the app fast and responsive: efficient lists, minimal re-renders, smart
caching, lazy-loaded screens, and a lean bundle. This doc lists concrete
techniques and where each applies in Memento.

## Dependencies / tools

- `@tanstack/react-query` — caching, dedup, background refetch.
- `@tanstack/query-async-storage-persister` — offline cache persistence.
- `react-native-mmkv` (optional) — faster storage than AsyncStorage.
- `react-devtools` / Flipper / Hermes profiler — measurement.
- `@react-native-community/eslint-plugin` and bundle analyzers.

## 1. List rendering (dashboard is the hot path)

- Use `FlatList` (already virtualized) — never `.map()` a long list into a
  `ScrollView`.
- Memoize row components: `const ReminderCard = React.memo(...)`.
- Stable `keyExtractor` and stable callback references (`useCallback`) so rows
  don't re-render on every parent render.
- Provide `getItemLayout` when row height is fixed to skip measurement.
- Tune `initialNumToRender`, `maxToRenderPerBatch`, `windowSize`, and set
  `removeClippedSubviews` on Android.

```tsx
<FlatList
  data={reminders}
  keyExtractor={keyExtractor}          // stable
  renderItem={renderItem}              // useCallback
  getItemLayout={getItemLayout}        // fixed height
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={7}
  removeClippedSubviews
/>
```

> For very large or complex lists, consider `@shopify/flash-list` as a drop-in
> higher-performance replacement.

## 2. Minimize re-renders

- Keep component state local; don't lift state higher than needed.
- Split context so unrelated consumers don't re-render (e.g. auth vs. theme).
- Memoize derived data with `useMemo` (e.g. flattening paginated pages).
- Use React Query selectors to subscribe to just the slice a component needs.

## 3. Caching strategy (React Query)

- `staleTime` (e.g. 30s) avoids redundant refetches when navigating back to the
  dashboard.
- Persist the query cache so the dashboard shows instantly on cold start while
  revalidating in the background:

```ts
persistQueryClient({
  queryClient,
  persister: createAsyncStoragePersister({ storage: AsyncStorage }),
  maxAge: 1000 * 60 * 60 * 24, // 24h
});
```

- Optimistic updates for delete/edit make the UI feel instant (see
  [04-reminder-screens.md](./04-reminder-screens.md)).

## 4. Lazy loading

- Lazy-load non-critical screens with `React.lazy` + `Suspense` so they aren't in
  the initial bundle/render path:

```tsx
const SettingsScreen = React.lazy(() => import('../features/settings/SettingsScreen'));
```

- Defer heavy work (analytics, non-critical listeners) until after first paint
  with `InteractionManager.runAfterInteractions`.
- Load images lazily and at the right resolution; cache remote images
  (`react-native-fast-image`).

## 5. Bundle size

- **Enable Hermes** (default on RN 0.70+) — faster startup, lower memory.
- **Enable ProGuard/R8** (Android) and app thinning (iOS) for release builds.
- Enable **RAM bundles / inline requires** so modules load on first use.
- Import selectively: `import debounce from 'lodash/debounce'`, not the whole
  library. Prefer `date-fns` (tree-shakeable) over moment.
- Audit dependencies periodically; drop unused packages. Analyze with
  `react-native-bundle-visualizer`.

## 6. Startup time

- Keep `App.tsx` provider tree lean; avoid synchronous heavy work at module load.
- Do token bootstrap and FCM init asynchronously after the first frame.
- Show a lightweight splash while `AuthProvider` resolves the stored token.

## 7. JS thread & animations

- Run animations on the native driver: `useNativeDriver: true`, or use
  `react-native-reanimated` for gesture/scroll-driven animations off the JS
  thread.
- Debounce expensive handlers (search, text change).

## 8. Measure, don't guess

- Profile with the Hermes profiler / Flipper before optimizing.
- Track: cold start time, dashboard time-to-interactive, list scroll FPS, JS
  frame drops.
- Add these to a lightweight performance checklist in CI where feasible.

## Definition of done

- Dashboard scrolls at ~60 FPS with a large list; no dropped-frame jank.
- Cold start shows cached reminders quickly, then revalidates.
- Release bundle uses Hermes + minification; no obviously unused heavy deps.
- Non-critical screens are code-split out of the initial bundle.
