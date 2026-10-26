// Fluent System Icons（@fluentui/svg-icons）。使うアイコンだけをここで取り込む
// 追加するときは icons/<名前>_<16|20>_<regular|filled>.svg を足し、ICONS に登録する

import copy16 from '@fluentui/svg-icons/icons/copy_16_regular.svg?raw';
import copy20 from '@fluentui/svg-icons/icons/copy_20_regular.svg?raw';
import history16 from '@fluentui/svg-icons/icons/history_16_regular.svg?raw';
import history20 from '@fluentui/svg-icons/icons/history_20_regular.svg?raw';
import arrowLeft16 from '@fluentui/svg-icons/icons/arrow_left_16_regular.svg?raw';
import arrowLeft20 from '@fluentui/svg-icons/icons/arrow_left_20_regular.svg?raw';
import arrowRight16 from '@fluentui/svg-icons/icons/arrow_right_16_regular.svg?raw';
import arrowRight20 from '@fluentui/svg-icons/icons/arrow_right_20_regular.svg?raw';
import arrowShuffle16 from '@fluentui/svg-icons/icons/arrow_shuffle_16_regular.svg?raw';
import arrowShuffle20 from '@fluentui/svg-icons/icons/arrow_shuffle_20_regular.svg?raw';
import arrowCounterclockwise16 from '@fluentui/svg-icons/icons/arrow_counterclockwise_16_regular.svg?raw';
import arrowCounterclockwise20 from '@fluentui/svg-icons/icons/arrow_counterclockwise_20_regular.svg?raw';
import save16 from '@fluentui/svg-icons/icons/save_16_regular.svg?raw';
import save20 from '@fluentui/svg-icons/icons/save_20_regular.svg?raw';
import folderOpen16 from '@fluentui/svg-icons/icons/folder_open_16_regular.svg?raw';
import folderOpen20 from '@fluentui/svg-icons/icons/folder_open_20_regular.svg?raw';
import rename16 from '@fluentui/svg-icons/icons/rename_16_regular.svg?raw';
import rename20 from '@fluentui/svg-icons/icons/rename_20_regular.svg?raw';
import delete16 from '@fluentui/svg-icons/icons/delete_16_regular.svg?raw';
import delete20 from '@fluentui/svg-icons/icons/delete_20_regular.svg?raw';
import share16 from '@fluentui/svg-icons/icons/share_16_regular.svg?raw';
import share20 from '@fluentui/svg-icons/icons/share_20_regular.svg?raw';
import arrowDownload16 from '@fluentui/svg-icons/icons/arrow_download_16_regular.svg?raw';
import arrowDownload20 from '@fluentui/svg-icons/icons/arrow_download_20_regular.svg?raw';
import arrowUpload16 from '@fluentui/svg-icons/icons/arrow_upload_16_regular.svg?raw';
import arrowUpload20 from '@fluentui/svg-icons/icons/arrow_upload_20_regular.svg?raw';
import chevronDown16 from '@fluentui/svg-icons/icons/chevron_down_16_regular.svg?raw';
import chevronDown20 from '@fluentui/svg-icons/icons/chevron_down_20_regular.svg?raw';
import chevronUp16 from '@fluentui/svg-icons/icons/chevron_up_16_regular.svg?raw';
import chevronUp20 from '@fluentui/svg-icons/icons/chevron_up_20_regular.svg?raw';
import options16 from '@fluentui/svg-icons/icons/options_16_regular.svg?raw';
import options20 from '@fluentui/svg-icons/icons/options_20_regular.svg?raw';
import questionCircle16 from '@fluentui/svg-icons/icons/question_circle_16_regular.svg?raw';
import questionCircle20 from '@fluentui/svg-icons/icons/question_circle_20_regular.svg?raw';
import desktop16 from '@fluentui/svg-icons/icons/desktop_16_regular.svg?raw';
import desktop20 from '@fluentui/svg-icons/icons/desktop_20_regular.svg?raw';
import weatherSunny16 from '@fluentui/svg-icons/icons/weather_sunny_16_regular.svg?raw';
import weatherSunny20 from '@fluentui/svg-icons/icons/weather_sunny_20_regular.svg?raw';
import weatherMoon16 from '@fluentui/svg-icons/icons/weather_moon_16_regular.svg?raw';
import weatherMoon20 from '@fluentui/svg-icons/icons/weather_moon_20_regular.svg?raw';
import arrowUndo16 from '@fluentui/svg-icons/icons/arrow_undo_16_regular.svg?raw';
import arrowUndo20 from '@fluentui/svg-icons/icons/arrow_undo_20_regular.svg?raw';
import new16 from '@fluentui/svg-icons/icons/new_16_regular.svg?raw';
import new20 from '@fluentui/svg-icons/icons/new_20_regular.svg?raw';
import dismiss16 from '@fluentui/svg-icons/icons/dismiss_16_regular.svg?raw';
import dismiss20 from '@fluentui/svg-icons/icons/dismiss_20_regular.svg?raw';
import checkmarkCircleFilled16 from '@fluentui/svg-icons/icons/checkmark_circle_16_filled.svg?raw';
import checkmarkCircleFilled20 from '@fluentui/svg-icons/icons/checkmark_circle_20_filled.svg?raw';
import warningFilled16 from '@fluentui/svg-icons/icons/warning_16_filled.svg?raw';
import warningFilled20 from '@fluentui/svg-icons/icons/warning_20_filled.svg?raw';

export const ICONS = {
  copy: { 16: copy16, 20: copy20 },
  history: { 16: history16, 20: history20 },
  arrow_left: { 16: arrowLeft16, 20: arrowLeft20 },
  arrow_right: { 16: arrowRight16, 20: arrowRight20 },
  arrow_shuffle: { 16: arrowShuffle16, 20: arrowShuffle20 },
  arrow_counterclockwise: { 16: arrowCounterclockwise16, 20: arrowCounterclockwise20 },
  save: { 16: save16, 20: save20 },
  folder_open: { 16: folderOpen16, 20: folderOpen20 },
  rename: { 16: rename16, 20: rename20 },
  delete: { 16: delete16, 20: delete20 },
  share: { 16: share16, 20: share20 },
  arrow_download: { 16: arrowDownload16, 20: arrowDownload20 },
  arrow_upload: { 16: arrowUpload16, 20: arrowUpload20 },
  chevron_down: { 16: chevronDown16, 20: chevronDown20 },
  chevron_up: { 16: chevronUp16, 20: chevronUp20 },
  options: { 16: options16, 20: options20 },
  question_circle: { 16: questionCircle16, 20: questionCircle20 },
  desktop: { 16: desktop16, 20: desktop20 },
  weather_sunny: { 16: weatherSunny16, 20: weatherSunny20 },
  weather_moon: { 16: weatherMoon16, 20: weatherMoon20 },
  arrow_undo: { 16: arrowUndo16, 20: arrowUndo20 },
  new: { 16: new16, 20: new20 },
  dismiss: { 16: dismiss16, 20: dismiss20 },
  checkmark_circle_filled: { 16: checkmarkCircleFilled16, 20: checkmarkCircleFilled20 },
  warning_filled: { 16: warningFilled16, 20: warningFilled20 },
} as const satisfies Record<string, Record<16 | 20, string>>;

export type IconName = keyof typeof ICONS;
