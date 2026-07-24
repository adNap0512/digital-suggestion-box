# DESIGN.md — デジタル目安箱

> 社内の困りごと・改善アイデア・相談を気軽に投稿でき、対応状況も見える業務アプリのデザイン仕様書。
> 本ファイルは [awesome-design-md-jp](https://github.com/kzhrknt/awesome-design-md-jp) の 9 セクション構成を参考に作成。
> **10X（テンエックス）のコーポレートデザインそのもの（Lexend 必須・96px 極太見出し・pill CTA 32px 等）は採用しない。**

---

## 1. Visual Theme & Atmosphere

- **デザイン方針**: 安心して投稿できる、やわらかい社内業務アプリ。単なる問い合わせフォームではなく、投稿後の対応状況が見え、社内改善のナレッジとして残る UI
- **密度**: 低〜中密度。カード 1 枚 1 投稿。余白を広めに取り、詰め込みすぎない
- **キーワード**: やさしい、清潔感、親しみやすい、カード UI、ステータス可視、心理的安全性
- **特徴**:
  - カード UI 中心。投稿・サマリー・最近の投稿をカードで整理
  - ステータスは色付きバッジでひと目で分かる
  - フォームは入力欄を広めに、注意書きは威圧的にしない
  - 匿名投稿でも心理的安全性がある表現
  - 管理者側も重くならずに対応できる UI

---

## 2. Color Palette & Roles

### Primary（ブランドカラー）

| Token | hex | 役割 |
|-------|-----|------|
| Soft Blue | `#5B8DEF` | メイン CTA、リンク、対応中ステータス |
| Deep Blue | `#2F5DA8` | ホバー・強調、見出しアクセント |

### Background

| Token | hex | 役割 |
|-------|-----|------|
| Base | `#F7F9FC` | ページ背景 |
| Card | `#FFFFFF` | カード・モーダル面 |
| Subtle Blue | `#EEF5FF` | サマリーカード・ハイライト面 |

### Accent

| Token | hex | 役割 |
|-------|-----|------|
| Soft Green | `#7BCFA6` | 対応済みステータス、成功 |
| Soft Yellow | `#F6D365` | 検討中ステータス |
| Soft Red | `#F28B82` | 注意（控えめに使用） |

### Text

| Token | hex | 役割 |
|-------|-----|------|
| Main | `#1F2937` | 本文・見出し |
| Sub | `#6B7280` | 補足テキスト |
| Muted | `#9CA3AF` | 日付・メタ情報 |

### ステータスカラー

| ステータス | 色 | 背景（バッジ） |
|-----------|-----|---------------|
| 未確認 | グレー `#9CA3AF` | `#F3F4F6` |
| 検討中 | イエロー `#D97706` | `#FEF3C7` |
| 対応中 | ブルー `#2F5DA8` | `#DBEAFE` |
| 対応済み | グリーン `#059669` | `#D1FAE5` |

### CSS 変数（実装用）

```css
:root {
  --color-primary: #5B8DEF;
  --color-primary-dark: #2F5DA8;
  --color-bg-base: #F7F9FC;
  --color-bg-card: #FFFFFF;
  --color-bg-subtle: #EEF5FF;
  --color-accent-green: #7BCFA6;
  --color-accent-yellow: #F6D365;
  --color-accent-red: #F28B82;
  --color-text-main: #1F2937;
  --color-text-sub: #6B7280;
  --color-text-muted: #9CA3AF;
}
```

---

## 3. Typography Rules

### 3.1 和文フォント

- **ゴシック体（メイン）**: システム UI フォント + 日本語フォールバック
- **明朝体**: 使用しない

### 3.2 欧文フォント

- システム UI フォントに統一（Lexend 等の特殊フォントは不使用）

### 3.3 font-family 指定

```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
  "Hiragino Sans", "Yu Gothic", sans-serif;
```

### 3.4 文字サイズ・ウェイト階層

| Role | Size | Weight | Line Height | 用途 |
|------|------|--------|-------------|------|
| Page Title | 28px | 700 | 1.4 | ページタイトル |
| Section Heading | 20px | 700 | 1.5 | セクション見出し |
| Card Title | 16px | 600 | 1.5 | 投稿タイトル |
| Body | 15px | 400 | 1.7 | 本文 |
| Caption | 13px | 400 | 1.6 | 補足・日付 |
| Badge | 12px | 600 | 1.0 | ステータス・カテゴリ |

### 3.5 行間・字間

- **本文 line-height**: `1.7`（日本語長文の可読性優先）
- **見出し line-height**: `1.4〜1.5`
- **letter-spacing**: 見出し `0.02em`、本文 `normal`

### 3.6 禁則処理・改行ルール

```css
word-break: break-word;
overflow-wrap: break-word;
line-break: strict;
```

### 3.7 OpenType 機能

```css
font-feature-settings: normal;
```

### 3.8 縦書き

- 該当なし。横書きのみ

---

## 4. Component Stylings

### Buttons

**Primary CTA**
- Background: `#5B8DEF`
- Text: `#FFFFFF`
- Padding: `12px 24px`
- Border Radius: `12px`
- Font Size: 15px / Weight 600

**Secondary**
- Background: `transparent`
- Text: `#2F5DA8`
- Border: `1px solid #5B8DEF`
- Border Radius: `12px`

**Empathy Button（共感）**
- Background: `#EEF5FF`
- Text: `#2F5DA8`
- Border Radius: `20px`
- Padding: `6px 14px`
- アイコン + 数値。軽く押せるサイズ

### Inputs

- Background: `#FFFFFF`
- Border: `1px solid #D1D5DB`
- Border (focus): `2px solid #5B8DEF`
- Border Radius: `12px`
- Padding: `12px 16px`
- Font Size: 15px
- textarea: 最小高さ `160px`

### Cards（SuggestionCard）

- Background: `#FFFFFF`
- Border: `1px solid #E5E7EB`
- Border Radius: `16px`
- Padding: `20px 24px`
- Shadow: Level 1（下記参照）
- 必須表示: カテゴリ、ステータス、共感数、回答有無

### StatusBadge

- Border Radius: `999px`（pill）
- Padding: `4px 12px`
- Font Size: 12px / Weight 600
- ステータスカラー表に従う

### SummaryCard

- Background: `#EEF5FF`
- Border Radius: `16px`
- Padding: `20px`
- 数値は大きく（24px / weight 700）

### 匿名 / 記名ラジオ

- カード型ラジオボタン。選択時は `#EEF5FF` 背景 + `#5B8DEF` ボーダー

---

## 5. Layout Principles

### Spacing Scale（8px グリッド）

| Token | Value | 用途 |
|-------|-------|------|
| XS | 4px | バッジ内 |
| S | 8px | 要素間 |
| M | 16px | カード内要素間 |
| L | 24px | カード間 |
| XL | 32px | セクション間 |
| XXL | 48px | ページ上下余白 |

### Container

- Max Width: `960px`（フォーム・詳細）
- Max Width: `1200px`（一覧グリッド）
- Padding (horizontal): mobile `16px` / desktop `24px`

### Grid

- サマリー: 3 列（desktop）→ 1 列（mobile）
- 投稿一覧: 2〜3 列（desktop）→ 1 列（mobile）
- Gutter: `24px`

### Border Radius Scale

| Token | Value | 用途 |
|-------|-------|------|
| MD | 12px | ボタン・入力 |
| LG | 16px | カード |
| Pill | 999px | バッジ |

---

## 6. Depth & Elevation

| Level | Shadow | 用途 |
|-------|--------|------|
| 0 | `none` | フラット要素 |
| 1 | `0 2px 8px rgba(0,0,0,0.06)` | カード（デフォルト） |
| 2 | `0 4px 16px rgba(0,0,0,0.08)` | カード hover、詳細パネル |

- 影は薄め。清潔感を保つ

---

## 7. Do's and Don'ts

### Do（推奨）

- 「投稿」「困りごと」「対応中」「対応済み」などやわらかい文言を使う
- カードにカテゴリ・ステータス・共感数・回答有無を必ず表示する
- フォームの入力欄を広めにする
- 匿名投稿の安心感を UI で伝える
- ステータスは色付きバッジで表示する
- 日本語本文の line-height は 1.7 前後を維持する

### Don't（禁止）

- 「問い合わせ」「苦情」「処理中」「完了」など硬い・監視的な表現
- 稟議フォームのような重い見た目
- 入力項目を増やしすぎる
- ステータスが分かりにくい UI
- 匿名投稿の不安が残る表現
- 監視されているような印象を与えるデザイン

---

## 8. Responsive Behavior

### Breakpoints

| Name | Width | 説明 |
|------|-------|------|
| Mobile | ≤ 767px | 1 カラム |
| Tablet | 768px〜1023px | 2 カラム |
| Desktop | ≥ 1024px | 2〜3 カラム |

### モバイル時の調整

- Page Title: 28px → 22px
- サマリーカード: 3 列 → 1 列
- 投稿一覧: 複数列 → 1 列
- フォーム: 全幅入力

### タッチターゲット

- ボタン・共感ボタン: 最小 44px × 44px

---

## AIエージェント利用時のルール

AIエージェントが画面やコンポーネントを生成・修正する場合は、必ず本 DESIGN.md を参照する。
特に以下は変更しない。

- カード UI 中心の構成
- ステータスバッジの色と文言
- 日本語本文の line-height 1.7 前後
- 「問い合わせ」ではなく「投稿」を使う文言方針
- 匿名投稿の心理的安全性を損なわない表現
- Primary color `#5B8DEF`
- カード radius `16px`
- ボタン radius `12px`

新しい画面や部品を追加する場合も、本 DESIGN.md のトーン、配色、余白、文言方針に従う。

---

## 9. Agent Prompt Guide

### クイックリファレンス

```
Primary: #5B8DEF
Primary Dark: #2F5DA8
Background: #F7F9FC
Card: #FFFFFF
Text Main: #1F2937
Font: system-ui, "Hiragino Sans", "Yu Gothic", sans-serif
Body: 15px / line-height 1.7
Card radius: 16px
Button radius: 12px
Status: 未確認=gray / 検討中=yellow / 対応中=blue / 対応済み=green
```

### プロンプト例

```
デジタル目安箱の DESIGN.md に従って、投稿一覧カードを作成してください。
- カード背景 #FFFFFF、radius 16px、shadow Level 1
- カテゴリバッジ、ステータスバッジ、共感数、回答有無を表示
- 本文 line-height 1.7、フォントは system-ui + 日本語フォールバック
- ステータス色: 未確認=グレー、検討中=イエロー、対応中=ブルー、対応済み=グリーン
- 「問い合わせ」ではなく「投稿」の文言を使う
```

---

## 付録: 主要画面仕様

### トップ画面

- タイトル・説明文
- CTA: 投稿する / みんなの投稿を見る / 自分の投稿を見る
- サマリーカード（投稿数・対応済み・検討中）
- 最近の投稿（最新 3 件）

### 投稿フォーム画面

- カテゴリ（業務改善 / 職場環境 / ツール・システム / イベント・福利厚生 / その他）
- 匿名 / 記名
- タイトル・本文・添付（UI のみ）
- 注意書き（柔らかい表現）
- 下書き保存 / 送信

### 投稿一覧・詳細画面

- 投稿カード一覧
- フィルタ（カテゴリ・ステータス・自分のみ）
- 詳細表示
- 共感ボタン
- 管理者: ステータス変更・回答入力

### UI 文言方針

| 使わない | 使う |
|----------|------|
| 問い合わせ | 投稿 |
| 苦情 | 困りごと |
| 処理中 | 対応中 |
| 完了 | 対応済み |
