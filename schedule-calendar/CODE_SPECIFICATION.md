# スケジュールカレンダーアプリ コード仕様書

## 目次
1. [概要](#概要)
2. [システム構成](#システム構成)
3. [ファイル構成](#ファイル構成)
4. [データ構造](#データ構造)
5. [グローバル変数](#グローバル変数)
6. [関数仕様](#関数仕様)
7. [イベントハンドラー](#イベントハンドラー)
8. [スタイル仕様](#スタイル仕様)
9. [HTML構造](#html構造)
10. [使用方法](#使用方法)
11. [ブラウザ互換性](#ブラウザ互換性)

---

## 概要

### アプリケーション名
スケジュールカレンダー

### バージョン
1.0.0

### 説明
ブラウザ上で動作するシンプルなスケジュール管理アプリケーション。月次カレンダー表示、スケジュールの追加・削除、LocalStorageによるデータ永続化機能を提供します。

### 技術スタック
- **HTML5**: マークアップ
- **CSS3**: スタイリング（Grid Layout、Flexbox、アニメーション）
- **JavaScript (ES6+)**: ロジック実装
- **LocalStorage API**: データ永続化

---

## システム構成

### アーキテクチャ
クライアントサイドのみで完結するSPA（Single Page Application）

```
┌─────────────────────────────────────┐
│         ブラウザ環境                │
│  ┌───────────────────────────────┐  │
│  │      index.html               │  │
│  │  (DOM構造定義)                │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │      style.css                │  │
│  │  (スタイル定義)               │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │      script.js                │  │
│  │  ・カレンダー描画             │  │
│  │  ・スケジュール管理           │  │
│  │  ・イベント処理               │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │      LocalStorage             │  │
│  │  (データ永続化)               │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## ファイル構成

```
schedule-calendar/
├── index.html          # メインHTMLファイル
├── style.css           # スタイルシート
├── script.js           # JavaScriptロジック
└── CODE_SPECIFICATION.md  # 本仕様書
```

### index.html
- **役割**: アプリケーションのDOM構造を定義
- **サイズ**: 63行
- **エンコーディング**: UTF-8
- **言語**: 日本語 (lang="ja")

### style.css
- **役割**: アプリケーションのビジュアルデザインを定義
- **サイズ**: 268行
- **主要技術**: CSS Grid, Flexbox, CSS Transitions, Media Queries

### script.js
- **役割**: アプリケーションのロジックとイベント処理
- **サイズ**: 262行
- **主要機能**: カレンダー描画、スケジュール管理、データ永続化

---

## データ構造

### スケジュールオブジェクト

```javascript
{
  id: number,           // ユニークID（タイムスタンプ）
  date: string,         // 日付（YYYY-MM-DD形式）
  time: string,         // 時刻（HH:MM形式）
  title: string,        // タイトル
  description: string   // 詳細説明（オプション）
}
```

#### プロパティ詳細

| プロパティ | 型 | 必須 | 説明 | 例 |
|-----------|-----|------|------|-----|
| `id` | number | ✓ | スケジュールの一意識別子。`Date.now()`で生成 | `1730000000000` |
| `date` | string | ✓ | スケジュールの日付。ISO 8601形式 | `"2025-10-26"` |
| `time` | string | ✓ | スケジュールの時刻。24時間形式 | `"14:30"` |
| `title` | string | ✓ | スケジュールのタイトル | `"ミーティング"` |
| `description` | string | - | スケジュールの詳細説明 | `"プロジェクトの進捗確認"` |

### LocalStorageデータ形式

```javascript
// キー: 'schedules'
// 値: JSON文字列化されたスケジュール配列
localStorage.setItem('schedules', JSON.stringify([
  {
    id: 1730000000000,
    date: "2025-10-26",
    time: "14:00",
    title: "ミーティング",
    description: "プロジェクトの進捗確認"
  },
  // ... その他のスケジュール
]));
```

---

## グローバル変数

### currentDate
```javascript
let currentDate = new Date();
```
- **型**: Date
- **説明**: 現在表示中のカレンダーの年月を管理
- **初期値**: 現在の日時
- **用途**: カレンダー描画時の基準日付として使用

### schedules
```javascript
let schedules = [];
```
- **型**: Array&lt;Object&gt;
- **説明**: 全スケジュールデータを格納する配列
- **初期値**: 空配列
- **用途**: スケジュールの追加・削除・表示処理で使用

---

## 関数仕様

### loadSchedules()

#### 概要
LocalStorageからスケジュールデータを読み込み、グローバル変数`schedules`に格納します。

#### シグネチャ
```javascript
function loadSchedules(): void
```

#### 引数
なし

#### 戻り値
- **型**: void
- **説明**: 戻り値なし

#### 処理フロー
1. LocalStorageから`'schedules'`キーでデータを取得
2. データが存在する場合、JSON.parse()でオブジェクトに変換
3. グローバル変数`schedules`に格納

#### 使用例
```javascript
// アプリケーション起動時に実行
loadSchedules();
```

#### エラーハンドリング
- LocalStorageにデータが存在しない場合: `schedules`は空配列のまま
- JSON.parse()エラー: 現状ハンドリングなし（今後の改善点）

---

### saveSchedules()

#### 概要
グローバル変数`schedules`の内容をLocalStorageに保存します。

#### シグネチャ
```javascript
function saveSchedules(): void
```

#### 引数
なし

#### 戻り値
- **型**: void
- **説明**: 戻り値なし

#### 処理フロー
1. グローバル変数`schedules`をJSON.stringify()で文字列化
2. LocalStorageの`'schedules'`キーに保存

#### 使用例
```javascript
// スケジュール追加後に実行
schedules.push(newSchedule);
saveSchedules();
```

#### 注意事項
- LocalStorageの容量制限（通常5-10MB）に注意
- プライベートブラウジングモードでは動作しない可能性あり

---

### renderCalendar()

#### 概要
`currentDate`に基づいて月次カレンダーを描画します。前月・当月・翌月の日付を適切に配置し、今日の日付をハイライト表示、スケジュールがある日付にインジケーターを表示します。

#### シグネチャ
```javascript
function renderCalendar(): void
```

#### 引数
なし

#### 戻り値
- **型**: void
- **説明**: 戻り値なし

#### 処理フロー
1. **年月情報の取得**
   - `currentDate`から年と月を取得
   - カレンダーヘッダーに「YYYY年 MM月」形式で表示

2. **日付計算**
   - 月の最初の日の曜日を取得（0=日曜日）
   - 月の最終日を取得
   - 前月の最終日を取得

3. **既存カレンダーのクリア**
   - `.calendar-grid`内の既存の`.calendar-day`要素を全削除

4. **前月の日付を表示**
   - 月の最初の日が日曜日でない場合、前月の日付で埋める
   - クラス: `calendar-day other-month`

5. **当月の日付を表示**
   - 1日から最終日までループ
   - 今日の日付の場合: `today`クラスを追加
   - スケジュールがある日付の場合: `has-schedule`クラスとインジケーターを追加
   - 日付クリック時: フォームの日付欄に自動入力

6. **翌月の日付を表示**
   - カレンダーを7列（1週間）で埋めるため、残りのセルを翌月の日付で埋める
   - クラス: `calendar-day other-month`

#### 使用例
```javascript
// 初期表示
renderCalendar();

// 月変更後
currentDate.setMonth(currentDate.getMonth() + 1);
renderCalendar();
```

#### DOM操作
- **取得**: `document.getElementById('currentMonth')`
- **取得**: `document.querySelector('.calendar-grid')`
- **作成**: `document.createElement('div')`
- **追加**: `calendarGrid.appendChild(day)`

#### CSSクラス
- `calendar-day`: 基本の日付セル
- `other-month`: 前月・翌月の日付
- `today`: 今日の日付
- `has-schedule`: スケジュールがある日付
- `schedule-indicator`: スケジュールインジケーター

---

### renderSchedules()

#### 概要
登録されているスケジュールを日時順にソートして一覧表示します。

#### シグネチャ
```javascript
function renderSchedules(): void
```

#### 引数
なし

#### 戻り値
- **型**: void
- **説明**: 戻り値なし

#### 処理フロー
1. **スケジュール数チェック**
   - スケジュールが0件の場合: 「スケジュールがありません」メッセージを表示して終了

2. **ソート処理**
   - スケジュールを日時順（昇順）にソート
   - ソートキー: `date`と`time`を結合した日時文字列

3. **既存リストのクリア**
   - `#scheduleItems`の内容を空にする

4. **スケジュールアイテムの生成**
   - 各スケジュールに対してHTMLを生成
   - 日付を「YYYY年MM月DD日(曜日) HH:MM」形式で整形
   - タイトル、日時、削除ボタンを含むカードを作成
   - 詳細説明がある場合は表示

#### 使用例
```javascript
// スケジュール追加後
addSchedule(date, time, title, description);
renderSchedules(); // 自動的に呼ばれる

// スケジュール削除後
deleteSchedule(id);
renderSchedules(); // 自動的に呼ばれる
```

#### DOM操作
- **取得**: `document.getElementById('scheduleItems')`
- **作成**: `document.createElement('div')`
- **HTML生成**: `item.innerHTML = ...`

#### 日付フォーマット
```javascript
// 入力: "2025-10-26", "14:00"
// 出力: "2025年10月26日(日) 14:00"
```

#### CSSクラス
- `schedule-item`: スケジュールカード
- `schedule-item-header`: ヘッダー部分
- `schedule-item-title`: タイトル
- `schedule-item-datetime`: 日時
- `schedule-item-description`: 詳細説明
- `delete-btn`: 削除ボタン
- `no-schedules`: スケジュールなしメッセージ

---

### deleteSchedule(id)

#### 概要
指定されたIDのスケジュールを削除します。

#### シグネチャ
```javascript
function deleteSchedule(id: number): void
```

#### 引数
| 引数名 | 型 | 必須 | 説明 |
|--------|-----|------|------|
| `id` | number | ✓ | 削除するスケジュールのID |

#### 戻り値
- **型**: void
- **説明**: 戻り値なし

#### 処理フロー
1. `schedules`配列から指定IDのスケジュールを除外（filter）
2. `saveSchedules()`を呼び出してLocalStorageに保存
3. `renderCalendar()`を呼び出してカレンダーを再描画
4. `renderSchedules()`を呼び出してスケジュール一覧を再描画

#### 使用例
```javascript
// HTMLから呼び出し
<button onclick="deleteSchedule(1730000000000)">削除</button>

// JavaScriptから呼び出し
deleteSchedule(1730000000000);
```

#### 注意事項
- 存在しないIDを指定しても、エラーは発生しない（filter処理のため）
- 削除は即座に反映され、元に戻せない

---

### addSchedule(date, time, title, description)

#### 概要
新しいスケジュールを作成し、配列に追加してLocalStorageに保存します。

#### シグネチャ
```javascript
function addSchedule(
  date: string,
  time: string,
  title: string,
  description: string
): void
```

#### 引数
| 引数名 | 型 | 必須 | 説明 | 例 |
|--------|-----|------|------|-----|
| `date` | string | ✓ | スケジュールの日付（YYYY-MM-DD形式） | `"2025-10-26"` |
| `time` | string | ✓ | スケジュールの時刻（HH:MM形式） | `"14:30"` |
| `title` | string | ✓ | スケジュールのタイトル | `"ミーティング"` |
| `description` | string | - | スケジュールの詳細説明 | `"プロジェクトの進捗確認"` |

#### 戻り値
- **型**: void
- **説明**: 戻り値なし

#### 処理フロー
1. **スケジュールオブジェクトの作成**
   - IDは`Date.now()`で生成（現在時刻のタイムスタンプ）
   - 引数をプロパティに設定

2. **配列への追加**
   - `schedules`配列に新しいスケジュールをpush

3. **保存と再描画**
   - `saveSchedules()`でLocalStorageに保存
   - `renderCalendar()`でカレンダーを再描画
   - `renderSchedules()`でスケジュール一覧を再描画

#### 使用例
```javascript
// フォーム送信時
addSchedule(
  "2025-10-26",
  "14:30",
  "ミーティング",
  "プロジェクトの進捗確認"
);
```

#### バリデーション
- 現状、関数内でのバリデーションは実装されていない
- フォーム側で`required`属性により必須チェックを実施

#### ID生成の注意点
- `Date.now()`を使用しているため、同一ミリ秒内に複数のスケジュールを追加するとIDが重複する可能性がある
- 実用上は問題ないが、厳密にはUUID等の使用が望ましい

---

## イベントハンドラー

### 前月ボタンクリック

#### トリガー
`#prevMonth`ボタンのクリック

#### 処理内容
```javascript
document.getElementById('prevMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});
```

1. `currentDate`の月を1ヶ月前に設定
2. `renderCalendar()`を呼び出してカレンダーを再描画

#### 動作例
- 2025年10月表示中 → 2025年9月に移動
- 2025年1月表示中 → 2024年12月に移動（年をまたぐ）

---

### 次月ボタンクリック

#### トリガー
`#nextMonth`ボタンのクリック

#### 処理内容
```javascript
document.getElementById('nextMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});
```

1. `currentDate`の月を1ヶ月後に設定
2. `renderCalendar()`を呼び出してカレンダーを再描画

#### 動作例
- 2025年10月表示中 → 2025年11月に移動
- 2025年12月表示中 → 2026年1月に移動（年をまたぐ）

---

### スケジュール追加フォーム送信

#### トリガー
`#scheduleForm`フォームの送信

#### 処理内容
```javascript
document.getElementById('scheduleForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const date = document.getElementById('scheduleDate').value;
    const time = document.getElementById('scheduleTime').value;
    const title = document.getElementById('scheduleTitle').value;
    const description = document.getElementById('scheduleDescription').value;
    
    if (date && time && title) {
        addSchedule(date, time, title, description);
        document.getElementById('scheduleForm').reset();
        alert('スケジュールを追加しました！');
    }
});
```

#### 処理フロー
1. デフォルトのフォーム送信を防止（`e.preventDefault()`）
2. フォームの各入力値を取得
3. 必須項目（日付、時刻、タイトル）が入力されているかチェック
4. `addSchedule()`を呼び出してスケジュールを追加
5. フォームをリセット
6. 追加完了のアラートを表示

#### バリデーション
- HTML5の`required`属性により、ブラウザ側でバリデーション実施
- JavaScript側でも`if (date && time && title)`で二重チェック

---

### 日付セルクリック

#### トリガー
カレンダーの日付セル（`.calendar-day`）のクリック

#### 処理内容
```javascript
day.addEventListener('click', () => {
    document.getElementById('scheduleDate').value = dateString;
});
```

1. クリックされた日付を取得
2. スケジュール追加フォームの日付欄に自動入力

#### 動作例
- カレンダーの「26」をクリック → フォームの日付欄に「2025-10-26」が入力される

---

## スタイル仕様

### カラーパレット

| 用途 | カラーコード | 説明 |
|------|-------------|------|
| プライマリ | `#667eea` | メインカラー（ボタン、ヘッダー等） |
| セカンダリ | `#764ba2` | アクセントカラー |
| 背景グラデーション | `#667eea` → `#764ba2` | ページ背景 |
| 今日の日付 | `#667eea` | 青色ハイライト |
| スケジュールあり | `#fff3cd` / `#ffc107` | 黄色系 |
| 削除ボタン | `#dc3545` | 赤色 |
| テキスト | `#333` | ダークグレー |
| 薄いテキスト | `#666` / `#999` | グレー |

### レイアウト

#### コンテナ
```css
.container {
    max-width: 1200px;
    margin: 0 auto;
    background: white;
    border-radius: 20px;
    padding: 30px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}
```

#### カレンダーグリッド
```css
.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 10px;
}
```
- 7列のグリッドレイアウト（日曜日〜土曜日）
- 各セルは正方形（`aspect-ratio: 1`）

### アニメーション・トランジション

#### ホバーエフェクト
- **ボタン**: 上に2px移動、影を追加
- **日付セル**: 拡大（scale: 1.05）、枠線色変更
- **スケジュールカード**: 右に5px移動、影を強調

#### トランジション時間
- 標準: `0.3s ease`

### レスポンシブデザイン

#### ブレークポイント
```css
@media (max-width: 768px) {
    /* スマートフォン向けスタイル */
}
```

#### モバイル対応
- コンテナのパディング削減
- フォントサイズ調整
- カレンダーセルのサイズ調整

---

## HTML構造

### 全体構造
```html
<body>
  <div class="container">
    <header>
      <h1>スケジュールカレンダー</h1>
    </header>
    
    <!-- カレンダーコントロール -->
    <div class="calendar-controls">
      <button id="prevMonth">前月</button>
      <h2 id="currentMonth"></h2>
      <button id="nextMonth">次月</button>
    </div>
    
    <!-- カレンダーグリッド -->
    <div class="calendar-grid">
      <!-- 曜日ヘッダー -->
      <div class="calendar-header">日</div>
      <!-- ... 月〜土 ... -->
      
      <!-- 日付セル（JavaScriptで動的生成） -->
    </div>
    
    <!-- スケジュール追加フォーム -->
    <div class="schedule-section">
      <h3>スケジュール追加</h3>
      <form id="scheduleForm">
        <!-- フォームフィールド -->
      </form>
    </div>
    
    <!-- スケジュール一覧 -->
    <div class="schedule-list">
      <h3>スケジュール一覧</h3>
      <div id="scheduleItems">
        <!-- スケジュールアイテム（JavaScriptで動的生成） -->
      </div>
    </div>
  </div>
  
  <script src="script.js"></script>
</body>
```

### 主要なID・クラス

#### ID
| ID | 要素 | 用途 |
|----|------|------|
| `prevMonth` | button | 前月ボタン |
| `nextMonth` | button | 次月ボタン |
| `currentMonth` | h2 | 現在の年月表示 |
| `scheduleForm` | form | スケジュール追加フォーム |
| `scheduleDate` | input | 日付入力 |
| `scheduleTime` | input | 時刻入力 |
| `scheduleTitle` | input | タイトル入力 |
| `scheduleDescription` | textarea | 詳細入力 |
| `scheduleItems` | div | スケジュール一覧コンテナ |

#### クラス
| クラス | 用途 |
|--------|------|
| `container` | メインコンテナ |
| `calendar-controls` | カレンダーコントロール |
| `calendar-grid` | カレンダーグリッド |
| `calendar-header` | 曜日ヘッダー |
| `calendar-day` | 日付セル |
| `other-month` | 前月・翌月の日付 |
| `today` | 今日の日付 |
| `has-schedule` | スケジュールがある日付 |
| `schedule-indicator` | スケジュールインジケーター |
| `schedule-section` | スケジュール追加セクション |
| `schedule-list` | スケジュール一覧セクション |
| `schedule-item` | スケジュールカード |
| `btn` | ボタン基本スタイル |
| `btn-primary` | プライマリボタン |
| `delete-btn` | 削除ボタン |

---

## 使用方法

### 基本的な使い方

#### 1. アプリケーションの起動
```bash
# ローカルサーバーを起動（例）
python3 -m http.server 8080

# ブラウザでアクセス
http://localhost:8080/schedule-calendar/index.html
```

または、`index.html`をブラウザで直接開く。

#### 2. カレンダーの操作
- **前月表示**: 「前月」ボタンをクリック
- **次月表示**: 「次月」ボタンをクリック
- **日付選択**: カレンダーの日付をクリック（フォームに自動入力）

#### 3. スケジュールの追加
1. 日付を選択（カレンダークリックまたは手動入力）
2. 時刻を入力
3. タイトルを入力
4. 詳細を入力（オプション）
5. 「追加」ボタンをクリック

#### 4. スケジュールの削除
- スケジュール一覧の各アイテムの「削除」ボタンをクリック

### データの永続化

#### データの保存場所
- **ブラウザのLocalStorage**
- **キー**: `'schedules'`
- **形式**: JSON文字列

#### データの確認方法（開発者ツール）
```javascript
// コンソールで実行
localStorage.getItem('schedules');

// または
JSON.parse(localStorage.getItem('schedules'));
```

#### データのクリア方法
```javascript
// コンソールで実行
localStorage.removeItem('schedules');

// または全データクリア
localStorage.clear();
```

### カスタマイズ

#### カラーテーマの変更
`style.css`の以下の部分を編集：
```css
/* プライマリカラー */
.btn {
    background: #667eea; /* ここを変更 */
}

/* 背景グラデーション */
body {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    /* ここを変更 */
}
```

#### 曜日の開始日変更
現在は日曜日始まり。月曜日始まりに変更する場合は、`script.js`の`renderCalendar()`関数内の曜日計算ロジックを調整する必要があります。

---

## ブラウザ互換性

### 対応ブラウザ

| ブラウザ | バージョン | 対応状況 |
|---------|-----------|---------|
| Chrome | 90+ | ✓ 完全対応 |
| Firefox | 88+ | ✓ 完全対応 |
| Safari | 14+ | ✓ 完全対応 |
| Edge | 90+ | ✓ 完全対応 |
| Opera | 76+ | ✓ 完全対応 |

### 必要な機能
- **JavaScript ES6+**: アロー関数、テンプレートリテラル、const/let
- **CSS Grid**: カレンダーレイアウト
- **CSS Flexbox**: 各種レイアウト
- **LocalStorage API**: データ永続化
- **HTML5 Form Elements**: date, time, textarea

### 非対応環境
- Internet Explorer（全バージョン）
- 古いモバイルブラウザ（Android 4.x以前、iOS 10以前）

---

## パフォーマンス

### 最適化ポイント
1. **DOM操作の最小化**: カレンダー再描画時に既存要素を削除してから新規作成
2. **イベント委譲**: 日付セルのクリックイベントは個別に設定（改善の余地あり）
3. **データ量**: LocalStorageの容量制限内で動作

### 推奨事項
- スケジュール数が1000件を超える場合、パフォーマンスが低下する可能性
- 大量データの場合、ページネーションや仮想スクロールの実装を推奨

---

## セキュリティ

### XSS対策
- **現状**: `innerHTML`を使用しているため、XSSのリスクあり
- **対策**: ユーザー入力をエスケープ処理する必要あり

```javascript
// 改善例
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
```

### データの保護
- LocalStorageは暗号化されていないため、機密情報の保存は非推奨
- 現在のアプリでは個人のスケジュール情報のみを扱うため、一般的な用途では問題なし

---

## 今後の改善案

### 機能追加
1. **スケジュールの編集機能**
2. **カテゴリー・タグ機能**
3. **検索・フィルター機能**
4. **リマインダー通知**
5. **データのエクスポート/インポート**
6. **週表示・日表示の追加**
7. **繰り返しスケジュール**

### 技術的改善
1. **TypeScriptへの移行**
2. **フレームワークの導入（React, Vue等）**
3. **バックエンドAPI連携**
4. **ユニットテストの追加**
5. **PWA対応**
6. **アクセシビリティ改善（ARIA属性等）**

---

## トラブルシューティング

### スケジュールが保存されない
- **原因**: ブラウザのプライベートモード、LocalStorageが無効
- **対処**: 通常モードで開く、ブラウザ設定を確認

### カレンダーが表示されない
- **原因**: JavaScriptエラー、ファイルパスの誤り
- **対処**: ブラウザの開発者ツールでコンソールエラーを確認

### スタイルが適用されない
- **原因**: CSSファイルのパスが間違っている
- **対処**: `index.html`の`<link>`タグのパスを確認

---

## ライセンス

本アプリケーションは教育・学習目的で作成されたものです。

---

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-10-26 | 初版リリース |

---

## 作成者

- **プロジェクト**: スケジュールカレンダー
- **作成日**: 2025年10月
- **言語**: 日本語

---

**以上、スケジュールカレンダーアプリのコード仕様書**
