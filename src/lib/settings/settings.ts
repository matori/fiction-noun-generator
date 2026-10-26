// 設定データ（SPEC §5.1）

import {
  CONSONANTS,
  VOWELS,
  identityConsonantMap,
  identityVowelMap,
  type Consonant,
  type ConversionOptions,
  type Vowel,
} from '../core';

export interface Settings extends ConversionOptions {
  version: 1;
}

export interface Preset {
  name: string;
  settings: Settings;
  updatedAt: string;
}

export function defaultSettings(): Settings {
  return {
    version: 1,
    vowelMap: identityVowelMap(),
    consonantMap: identityConsonantMap(),
    reverse: 'none',
    moveLeadingVowel: false,
    trailingChoon: 'keep',
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const isVowel = (v: unknown): v is Vowel => VOWELS.includes(v as Vowel);
const isConsonant = (v: unknown): v is Consonant => CONSONANTS.includes(v as Consonant);

/**
 * 外から来たデータを Settings にそろえる。
 * 未知のキーは無視し、足りない・不正な値は初期値で補う（SPEC §5.4）。
 */
export function normalizeSettings(value: unknown): Settings {
  const settings = defaultSettings();
  if (!isRecord(value)) return settings;

  if (isRecord(value.vowelMap)) {
    for (const v of VOWELS) {
      const to = value.vowelMap[v];
      if (isVowel(to)) settings.vowelMap[v] = to;
    }
  }
  if (isRecord(value.consonantMap)) {
    for (const c of CONSONANTS) {
      const to = value.consonantMap[c];
      if (isConsonant(to)) settings.consonantMap[c] = to;
    }
  }
  if (value.reverse === 'none' || value.reverse === 'kana' || value.reverse === 'romaji') {
    settings.reverse = value.reverse;
  }
  if (typeof value.moveLeadingVowel === 'boolean') settings.moveLeadingVowel = value.moveLeadingVowel;
  if (value.trailingChoon === 'remove' || value.trailingChoon === 'keep') {
    settings.trailingChoon = value.trailingChoon;
  }
  return settings;
}

/** 初期値と同じマップのエントリを省く（URL 共有用） */
export function compactSettings(settings: Settings): Record<string, unknown> {
  const pickChanged = <K extends string>(map: Record<K, K>) =>
    Object.fromEntries(Object.entries(map).filter(([from, to]) => from !== to));
  return {
    ...settings,
    vowelMap: pickChanged(settings.vowelMap),
    consonantMap: pickChanged(settings.consonantMap),
  };
}
