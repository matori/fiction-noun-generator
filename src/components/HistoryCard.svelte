<script lang="ts">
  // 生成履歴。同じ設定の履歴をグループにまとめて表示する（SPEC §6.5）
  import { SvelteSet } from 'svelte/reactivity';
  import type { AppState } from '../app-state.svelte';
  import { copyText } from '../lib/clipboard';
  import { convert } from '../lib/core';
  import { groupHistory, HISTORY_LIMIT, settingsKey, type HistoryEntry, type HistoryGroup } from '../lib/settings/history';
  import type { Settings } from '../lib/settings/settings';
  import { formatHistoryGroup, formatPair } from '../lib/settings/output-format';
  import { formatSummary, summarizeSettings } from '../lib/settings/summary';
  import Button from '../lib/ui/Button.svelte';
  import Card from '../lib/ui/Card.svelte';
  import { showToast } from '../lib/ui/toast-state.svelte';
  import StageText from './StageText.svelte';

  let { app }: { app: AppState } = $props();

  const groups = $derived(groupHistory(app.history));

  /** 開いているグループの詳細（settingsKey）と、開いている行の途中経過（id） */
  const openGroups = new SvelteSet<string>();
  const openEntries = new SvelteSet<string>();

  function toggle(set: SvelteSet<string>, key: string) {
    if (set.has(key)) set.delete(key);
    else set.add(key);
  }

  function restore(settings: Settings) {
    app.applySettings(settings);
    showToast('設定を復元しました（入力はそのままです）');
  }

  function copyGroup(group: HistoryGroup) {
    const text = formatHistoryGroup(group.entries, group.settings, app.outputFormat, location.href);
    copyText(text, `${group.entries.length} 件をコピーしました`);
  }

  function removeEntry(entry: HistoryEntry) {
    app.history = app.history.filter((e) => e.id !== entry.id);
    openEntries.delete(entry.id);
  }

  function removeGroup(group: HistoryGroup) {
    if (!confirm(`この設定の履歴 ${group.entries.length} 件を削除しますか？`)) return;
    app.history = app.history.filter((e) => settingsKey(e.settings) !== group.key);
  }

  function clearAll() {
    if (!confirm('履歴をすべて削除しますか？')) return;
    app.history = [];
    openGroups.clear();
    openEntries.clear();
  }

  const dateFormat = new Intl.DateTimeFormat('ja-JP', { dateStyle: 'short', timeStyle: 'short' });
</script>

<Card
  title="生成履歴"
  description="コピー・Enter・「履歴に追加」で、そのときの設定と一緒に残ります（最新 {HISTORY_LIMIT} 件）。同じ設定の履歴はまとめて表示します。"
>
  {#snippet actions()}
    <Button size="small" appearance="subtle" icon="delete" disabled={app.history.length === 0} onclick={clearAll}>すべて削除</Button>
  {/snippet}

  {#if groups.length > 0}
    <div class="groups">
      {#each groups as group (group.key)}
        {@const groupId = group.key ?? 'none'}
        {@const detailsOpen = openGroups.has(groupId)}
        <section class="group" aria-label="設定ごとの履歴">
          <header>
            <p class="summary">
              {group.settings ? formatSummary(summarizeSettings(group.settings)) : '設定の記録なし'}
              <span class="count">{group.entries.length} 件</span>
            </p>
            <div class="group-actions">
              <Button size="small" appearance="primary" icon="copy" title="このグループの履歴を、コピー形式で設定のフッター付きでコピー" onclick={() => copyGroup(group)}>まとめてコピー</Button>
              {#if group.settings}
                <Button size="small" icon={detailsOpen ? 'chevron_up' : 'chevron_down'} aria-expanded={detailsOpen} onclick={() => toggle(openGroups, groupId)}>
                  {detailsOpen ? '詳細を閉じる' : '詳細'}
                </Button>
                <Button size="small" icon="options" onclick={() => restore(group.settings!)}>設定を復元</Button>
              {/if}
              <Button size="small" appearance="subtle" icon="delete" onclick={() => removeGroup(group)}>削除</Button>
            </div>
          </header>

          {#if detailsOpen && group.settings}
            {@render settingsDetails(group.settings)}
          {/if}

          <ul>
            {#each group.entries as entry (entry.id)}
              {@const stagesOpen = openEntries.has(entry.id)}
              <li>
                <div class="row">
                  <div class="words">
                    <span class="output">{entry.output}</span>
                    <span class="input">{entry.input}</span>
                  </div>
                  <time datetime={entry.createdAt}>{dateFormat.format(new Date(entry.createdAt))}</time>
                  <div class="row-actions">
                    <Button size="small" appearance="primary" icon="copy" onclick={() => copyText(formatPair(entry, app.outputFormat))}>コピー</Button>
                    {#if group.settings}
                      <Button size="small" appearance="subtle" icon={stagesOpen ? 'chevron_up' : 'chevron_down'} aria-expanded={stagesOpen} onclick={() => toggle(openEntries, entry.id)}>
                        途中経過
                      </Button>
                    {/if}
                    <Button size="small" appearance="subtle" icon="delete" aria-label="{entry.output} を履歴から削除" onclick={() => removeEntry(entry)}>
                      削除
                    </Button>
                  </div>
                </div>
                {#if stagesOpen && group.settings}
                  {@render stages(entry.input, group.settings)}
                {/if}
              </li>
            {/each}
          </ul>
        </section>
      {/each}
    </div>
  {:else}
    <p class="empty">まだ履歴はありません。</p>
  {/if}
</Card>

{#snippet settingsDetails(settings: Settings)}
  {@const summary = summarizeSettings(settings)}
  <dl class="details">
    <dt>オプション</dt>
    <dd>{summary.options.join('・')}</dd>
    <dt>母音</dt>
    <dd>
      {#each summary.vowelChanges as [from, to] (from)}
        <code class="change">{from}→{to}</code>
      {:else}
        <span class="none">変更なし</span>
      {/each}
    </dd>
    <dt>子音</dt>
    <dd>
      {#each summary.consonantChanges as [from, to] (from)}
        <code class="change">{from}→{to}</code>
      {:else}
        <span class="none">変更なし</span>
      {/each}
    </dd>
  </dl>
{/snippet}

{#snippet stages(input: string, settings: Settings)}
  {@const result = convert(input, settings)}
  <div class="stages">
    <span><small>ローマ字</small><StageText stage={result.romaji} /></span>
    {#if result.reversed}<span><small>反転後</small><StageText stage={result.reversed} /></span>{/if}
    <span><small>置換後</small><StageText stage={result.substituted} /></span>
  </div>
{/snippet}

<style>
  .groups {
    display: flex;
    flex-direction: column;
    gap: var(--spacingVerticalM);
  }

  .group {
    display: flex;
    flex-direction: column;
    gap: var(--spacingVerticalS);
    padding: var(--spacingVerticalS) var(--spacingHorizontalM);
    border: var(--strokeWidthThin) solid var(--colorNeutralStroke2);
    border-radius: var(--borderRadiusLarge);
  }

  header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacingVerticalXS) var(--spacingHorizontalM);
  }

  .summary {
    font-weight: var(--fontWeightSemibold);
    overflow-wrap: anywhere;
  }

  .count {
    margin-left: var(--spacingHorizontalS);
    color: var(--colorNeutralForeground3);
    font-size: var(--fontSizeBase200);
    font-weight: var(--fontWeightRegular);
  }

  .group-actions,
  .row-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacingHorizontalXS);
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    padding: var(--spacingVerticalS) 0;
    border-top: var(--strokeWidthThin) solid var(--colorNeutralStroke3);
  }

  .row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    align-items: center;
    gap: var(--spacingVerticalXS) var(--spacingHorizontalM);
  }

  .words {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0 var(--spacingHorizontalS);
    min-width: 0;
  }

  .output {
    overflow-wrap: anywhere;
    font-size: var(--fontSizeBase400);
    line-height: var(--lineHeightBase400);
    font-weight: var(--fontWeightSemibold);
  }

  .input,
  .empty,
  time,
  small,
  .none,
  dt {
    overflow-wrap: anywhere;
    color: var(--colorNeutralForeground3);
    font-size: var(--fontSizeBase200);
    line-height: var(--lineHeightBase200);
  }

  .details {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: var(--spacingVerticalS) var(--spacingHorizontalL);
    margin: 0;
    padding: var(--spacingVerticalS) var(--spacingHorizontalM);
    border-radius: var(--borderRadiusMedium);
    background: var(--colorNeutralBackground3);
  }

  dd {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--spacingVerticalXS) var(--spacingHorizontalS);
    min-width: 0;
    margin: 0;
  }

  .change {
    padding: 0 var(--spacingHorizontalXS);
    border-radius: var(--borderRadiusSmall);
    background: var(--colorBrandBackground2);
    color: var(--colorBrandForeground2);
  }

  .stages {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacingHorizontalS);
    margin-top: var(--spacingVerticalS);
  }

  .stages > span {
    display: flex;
    flex-direction: column;
    min-width: 0;
    padding: var(--spacingVerticalXS) var(--spacingHorizontalS);
    border: var(--strokeWidthThin) solid var(--colorNeutralStroke2);
    border-radius: var(--borderRadiusMedium);
  }

  @media (max-width: 600px) {
    .row {
      grid-template-columns: minmax(0, 1fr) auto;
    }

    .row-actions {
      grid-column: 1 / -1;
    }
  }
</style>
