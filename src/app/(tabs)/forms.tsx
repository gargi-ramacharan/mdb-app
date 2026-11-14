import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DevDataToggle } from '@/components/dev-data-toggle';
import { EmptyFormsCard } from '@/components/empty-forms-card';
import { FormRow } from '@/components/form-row';
import { StateMessage } from '@/components/state-message';
import { TitleBar } from '@/components/title-bar';
import { Chip } from '@/components/ui/chip';
import { MaxContentWidth, Palette, Spacing } from '@/constants/theme';
import { useForms } from '@/hooks/use-forms';
import type { DataSource } from '@/lib/api';
import { FORM_FILTERS, filterForms, formatFileCount, type FormFilterLabel } from '@/utils/forms';

export default function FormsScreen() {
  const [source, setSource] = useState<DataSource>('live');
  // `null` = no chip selected = show every form. Tapping the selected chip again clears it.
  const [filter, setFilter] = useState<FormFilterLabel | null>(null);
  const { state, retry } = useForms(source);

  const forms = state.status === 'ready' ? state.forms : [];
  const visible = filterForms(forms, filter);

  return (
    <View style={styles.screen}>
      <TitleBar title="Forms" trailing={state.status === 'ready' ? formatFileCount(forms.length) : undefined} />

      {state.status === 'loading' && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Palette.purple600} accessibilityLabel="Loading forms" />
        </View>
      )}

      {state.status === 'error' && (
        <StateMessage
          tone="error"
          title="Couldn’t load your forms"
          message="Check your connection and try again."
          action={{ label: 'Try again', onPress: retry }}
        />
      )}

      {state.status === 'ready' && (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {forms.length === 0 ? (
            <EmptyFormsCard />
          ) : (
            <>
              {/* Bleeds past the page padding so the chips can scroll edge to edge. */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipScroll}
                contentContainerStyle={styles.chips}>
                {FORM_FILTERS.map(({ label }) => (
                  <Chip
                    key={label}
                    label={label}
                    selected={filter === label}
                    onPress={() => setFilter(filter === label ? null : label)}
                  />
                ))}
              </ScrollView>

              {visible.length === 0 ? (
                <Text style={styles.noMatches}>No forms match this filter</Text>
              ) : (
                <View style={styles.list}>
                  {visible.map((form) => (
                    <FormRow key={form.id} form={form} />
                  ))}
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}

      {/* Outside the scroll view so it stays reachable in the loading and error states. */}
      <View style={styles.dev}>
        <DevDataToggle value={source} onChange={setSource} />
      </View>
    </View>
  );
}

const PAGE_PADDING = 20;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.screenBackground,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 25, // Figma: title bar bottom to the first card (empty) / 17 to the chips
    paddingBottom: Spacing.four,
    gap: 22, // chips to the first row
  },
  // Cancels the page padding for the chips, and pulls them 8px closer: the title bar to chips
  // gap is 17 in Figma versus 25 for the empty card.
  chipScroll: {
    flexGrow: 0,
    marginHorizontal: -PAGE_PADDING,
    marginTop: -8,
  },
  chips: {
    paddingHorizontal: PAGE_PADDING + 2,
    gap: 6,
  },
  list: {
    gap: 12,
  },
  noMatches: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    color: Palette.sectionText,
    paddingVertical: 24,
  },
  dev: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: PAGE_PADDING,
    paddingBottom: 12,
  },
});
