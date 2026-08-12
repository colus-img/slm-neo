# Slm-neo

Slm-neoは、JavaScript(Node.js/Deno)用のモダンなテンプレート言語です。Rubyの[Slim](http://slim-lang.com/)をJSに移植したもので、さらにスリム化されています :)

[**🚀 オンライン・プレイグラウンドで試す！**](https://colus-img.github.io/slm-neo/)

## 特徴

- **Async/Awaitサポート**: テンプレート内で`await`をネイティブにサポート。
- **モダンJavaScript**: ESMファースト、ES6+準拠。
- **クロスプラットフォーム**: Node.jsとDenoの両方でシームレスに動作。
- **エレガントな構文**: Ruby Slim由来のインデントによる入れ子構造を採用し、閉じタグのない簡潔な構文。
- **ヘルパーパイプライン構文**: ヘルパー関数をslm-neo独自のパイプライン記法で手軽に適用できます。
- **安全性**: デフォルトで自動HTMLエスケープ。
- **パフォーマンス**: 依存関係を最小限に抑えた高速なレンダリング。

## 使い方

直接GitHubからインストールできます:

```bash
npm install colus-img/slm-neo
```

Denoの場合:

```javascript
import slm from "https://raw.githubusercontent.com/colus-img/slm-neo/main/lib/slm.js";
```

### slmコードをレンダリングする

`renderAsync`か`compileAsync`を使用した場合、テンプレート内で`async/await`が利用可能です。テンプレート内で非同期関数を使用しない場合は、同期的な`render`と`compile`メソッドも利用可能です。

```javascript
import slm from 'slm-neo';

const src = 'p = await fetchData()'; //レンダリングするslmコード
const model = {
	fetchData: async () => 'Async Content'
};

// renderAsyncを使用
const html = await slm.renderAsync(src, model, options);

console.log(html); // <p>Async Content</p>

// compileAsyncを使用（テンプレートを再利用する場合）
const template = await slm.compileAsync(src, options);
const html2 = await template(model);

console.log(html2); // <p>Async Content</p>
```

#### model

`renderAsync`/`render`の引数として、テンプレート内で使用するデータを渡します。
データには直接その名前でアクセスできます。また、helpers関数をoptionの`helpersName`で指定したオブジェクトに登録すると、それらの関数にも直接その名前でアクセスできます。

modelの使用例: 

```javascript
const model = {
	page: {
		title: "hello"
	},
	helpers: {
		upper: (v) => v.toUpperCase()
	}
};
const html = await slm.renderAsync(src, model, options);
```
```slim
p = upper(page.title)
/ → <p>HELLO</p>
```

#### options

`renderAsync`/`render`の引数として、オプションオブジェクトを渡すことができます。

| オプション | 説明 |
| :--- | :--- |
| **`filename`** | テンプレートのファイル名。エラー報告や相対パスの解決（`partial`や`extend`）に使用されます。 |
| **`basePath`** | テンプレート解決のルートディレクトリ。`partial`や`extend`を使用する場合は指定を強く推奨します。 |
| **`useCache`** | コンパイル済みのキャッシュを無効にする場合は`false`を設定。（デフォルト: `true`） |
| **`attrDelims`** | 属性のデリミタをカスタマイズ。デフォルト: `{ '(': ')', '[': ']' }` |
| **`mergeAttrs`** | 属性の結合方法を定義。デフォルト: `{ class: ' ' }` |
| **`format`** | 出力形式:`xhtml`(デフォルト)または`html`。`html`モードでは空要素が`/`で閉じられません。 |
| **`autoDestructuring`** | データの分割代入を自動で行い、`this.`を省略して変数にアクセスできるようにします。（デフォルト: `true`） |
| **`destructuringExclude`** | 自動分割代入から除外する識別子名の配列。 |
| **`helpersName`** | model内のhelpers関数群の名前を登録します。デフォルトは`helpers`で、自動分割代入により`this.helpers.myFilter`が`this.helpers.`を省略して`myFilter`でアクセス可能になります。 |
| **`contentName`** | model内のcontentプロパティの名前を登録します。デフォルトは`content`で、slm-neoのレイアウト機能（`extend()`）を使用しない場合、`content()`でアクセス可能になります。 |
| **`require`** | テンプレート内でモジュールをロードするためのカスタム`require`関数。ESM/Deno環境で利用できます。 |

optionsの使用例: 

```javascript
const options = {
	basePath: './views',
	filename: 'index.slm',
	useCache: process.env.NODE_ENV === 'production',
	format: 'html'
};

const html = await slm.renderAsync(src, model, options);
```

カスタム`require`の使用例:

```javascript
import { createRequire } from 'node:module';
const customRequire = createRequire(import.meta.url);

const html = await slm.renderAsync(src, model, { require: customRequire });
```
.slm テンプレート内
```slim
- const os = require('node:os')
p Platform: ${os.platform()}
```

### ExpressJSとの連携

```javascript
import express from 'express';
import slm from 'slm-neo';

const app = express();

app.set('views', './views');
app.set('view engine', 'slm');
app.engine('slm', slm.__express);
```

## Ruby Slimとの違い

[Ruby Slim](http://slim-lang.com/)をすでにご存知の場合、Slm-neoとの主な違いは以下の通りです。

- **JavaScriptベースのロジック**: 制御フローや式にJavaScriptを使用します。
	- `- if items.length` (Rubyの`- if items.any?`に相当)
	- `- for item of items` (Rubyの`- for item in items`に相当)
- **ネイティブ Async/Await**: `async/await`をネイティブにサポート。
	- `p = await db.fetchData()`
	- `- if await checkPermission() ...`
- **ES6スタイルの補完**: `#{var}`ではなく`${var}`を使用します。
	- `${var}`: HTMLエスケープされた出力。
	- `${=var}`: エスケープなし（Raw）の出力。
- **パイプライン記法**: `${}`内で`|`を使って直感的にヘルパー関数を繋げられます。
	- `p Hello ${ name | upper }`
- **レイアウト機能**: `render 'name'`の代わりに`partial('name')`を、`yield`の代わりに`content()`を使用します。
- **HTML整形機能非搭載**: Slm-neoはレンダリング速度とコアエンジンの「スリムさ」を重視しています。HTML整形機能は含まれていません。整形が必要な場合は[Prettier](https://prettier.io/)等のツールを併用してください。

## 構文リファレンス

Slm-neoは、インデントによる入れ子、タグのショートカット（`#`, `.`）、行インジケーター（`|`, `-`, `=`, `==`）など、[Slim](http://slim-lang.com/)のコア構文を継承しています。

### JavaScript式

すべてのロジックと式はJavaScriptで記述します。また、slm独自の記法でより簡潔に記述することもできます。

#### 自動分割代入

デフォルトでは、slm-neoはレンダリング関数の開始時に`this`のトップレベルプロパティを自動的に分割代入します。これにより、`this.`プレフィックスなしでプロパティにアクセスできます。

> **注意点**: 自動分割代入はレンダリング関数の開始時に`this`直下のプロパティを評価します。動的なゲッターやレンダリング途中で値が変わるプロパティについては、第二階層以下にネストするか、`this`の省略を使用せず、明示的に`this.dynamicValue`のように記述してください。

#### 制御フロー

ブロックはインデントで定義します。JavaScript構文がそのまま使えます。また、`if`, `else if`, `for`, `while`, `switch`, `catch` の直後の`()`は省略可能です。

```slim
- if isAdmin
	p Welcome, Admin!
- else if user
	p Welcome, ${user.name}
- else
	p Please log in.

- for item of items
	li = item.name
```

#### 出力と補完

`=`・`==`：JavaScriptによる出力行

- `p = user.name`: エスケープされた出力。
- `p == raw`: エスケープなしの出力。

`${}`：テキスト中の補完出力

- `${title}`: エスケープされた補間出力。
- `${=rawHtml}`: エスケープなしの補間出力。

#### 属性値

- `a href=target.url`: シンプルなJS式。
- `a(href=url)`: pugのように属性を括弧で囲むことも可能。
- `div class=(active ? "on" : "off")`: スペースを含む式には括弧が必要。
- `div class="${active ? 'on' : 'off'}"`: 補完出力を使用することも可能。
- `input type="checkbox" checked=true`: 真偽値による論理（`true`/`false`/`null`/`undefined`をサポート）。
- `a class=["btn", "btn-primary"]`: 配列は自動的にスペースで結合されます。

#### ヘルパーパイプライン記法

`${ 引数 | ヘルパー名 }`の形式でヘルパーのパイプライン記法をサポートしています。

**自動非同期サポート**: `renderAsync`使用時、パイプライン記法では非同期ヘルパー関数が自動的に処理されます。個々のステップに`await`を書く必要はありません。

```slim
p ${title | upper}
/ → <p>upper(title)</p>

p class="${ size, 'btn-' | prefix }"
/ → <p class="prefix(size, 'btn-')"></p>

${ message | upper | getPostTitle("x", "y") }
/ → await getPostTitle(upper(message), "x", "y")
/ `getPostTitle`が非同期関数でも`await`の記述なしでも正しく動作します。
```

### レイアウト

レイアウト機能により、サイト共通の構造とページ固有のコンテンツを分離できます。
- `- extend('layout')`: レイアウトファイルを指定します。
- `== content()`: レイアウトファイル内でメインテンプレートの内容を出力します。
- `- content('sidebar')`: 名前付きブロックを定義します。
- `== content('sidebar')`: 名前付きブロックを出力します。

layout.slm
```slim
doctype html
html
	body
		header: h1 My Site
		main
			/ メインコンテンツ
			== content()
		aside
			/ サイドバー（名前付きブロック）
			== content('sidebar')
```

index.slm
```slim
- extend('layout')
 
/ メインコンテンツの定義
h2 Welcome to the page!
p この内容はレイアウトのcontent()ブロックに挿入されます。

/ 名前付きブロック 'sidebar' の定義
- content('sidebar')
	nav
		ul
			li: a href="/" Home
			li: a href="/about" About
```

#### パーシャル

`partial`を使って外部のサブテンプレートをレンダリングします。

##### 基本的な使い方

```slim
/ ./header.slmを現在のコンテキストでレンダリング
== partial('header')

/ ./item.slmをカスタムモデルを指定してレンダリング
== partial('item', {name: 'Apple', price: 100})
```

##### ブロック付きパーシャル

パーシャルにブロックを渡すことができ、渡された内容は`content()`で出力可能です。

```slim
== partial('container')
	p この内容はcontainer内にネストされます。
```

container.slm
```slim
.wrapper
	== content()
```

##### Mixins(再利用可能なブロック)

同一テンプレート内でブロックを再利用するために使用します。

```slim
/ Mixinの定義
= mixin('userCard', 'user')
	.card
		/ ミクシンの引数には `this.` をつけてアクセスします
		h3 = this.user.name
		p = this.user.email
		/ ミクシン内でもコンテキスト変数には `this` なしでアクセスできます
		/ slm.render(src, {systemStatus: 'OK'}, options) でのレンダリング時
		p System Status: ${systemStatus}

/ テンプレート内で複数回使用
= mixin('userCard', currentUser)
- for (let friend of friends)
	= mixin('userCard', friend)
```

> **注意点**: ミクシン引数（例: `this.user`）にアクセスする際は、常に `this.` プレフィックスが必要です。一方でミクシン外のコンテキスト変数（例: `systemStatus`）には `this` なしでそのままアクセスできます。

##### カスタムブロックヘルパー(Shortcodes)

インデントされたボディを持つ出力ブロックを使用すると、Slm-neoは内部的に引数の最後にコールバック関数を追加します。
slm-neoはこのコールバック関数を同期・非同期にかかわらず解決する`yieldBlock`関数を提供しています。この関数を実行すると、インデントブロックのレンダリング結果（HTML文字列）が返されます。

```slim
= mySection(title)
	p ネストされたブロックの内容
```

ヘルパー関数の定義(外部ファイル)

```javascript
import slm from 'slm-neo';

export const mySection = function(title, cb) {
  // yieldBlock関数
  // 第1引数: コンテキスト (通常は this)
  // 第2引数: テンプレートから渡されたブロック (コールバック)
  // 第3引数: ブロックの結果を受け取って最終的な出力を返す関数
  return slm.yieldBlock(this, cb, (content) => {
    // content にはレンダリング済みのHTML文字列が入ります。
    // 同期・非同期の解決はyieldBlock内部で行われるため、ここでは文字列操作に集中できます。
    const html = `
      <section class="custom-section">
        <h2>${slm.escape(title)}</h2>
        <div class="content">${content}</div>
      </section>
    `;
    // HTMLとして出力するため slm.safe でラップします
    return slm.safe(html);
  });
};

```

## ブラウザでの利用

Slm-neoはブラウザ向けに2種類のビルドを`dist/`ディレクトリに提供しています。

### ソースからのビルド

DenoまたはNode.jsを使用して、ブラウザ用バンドルを自分でビルドできます。

Denoを使用する場合（推奨）
```bash
denotask build
```

Node.jsを使用する場合
```bash
npm install
node build.js
```

### `slm-browser.js`(フルバージョン)
**コンパイラ**と**ランタイム**の両方を含みます。ブラウザ上で直接Slm文字列をコンパイルする場合に使用します。

```html
<script src="dist/slm-browser.js"></script>
<script>
	const html = Slm.render('h1 Hello ${name}', {name: 'World'});
</script>
```

### `slm-vm-browser.js`(ランタイムのみ)
**ランタイム(VM)**のみを含みます。大幅に軽量・高速で、セキュリティも向上します（`eval`を使用しません）が、テンプレートをコンパイルすることはできません。プロダクション環境ではこちらが推奨されます。

#### テンプレートの事前コンパイル
サーバー側またはビルド時に`slm.template.src()`を使ってテンプレートをJavaScriptコードに変換しておきます。

```javascript
// ビルドスクリプト(Node.js/Deno)
const compiledSrc = slm.template.src('h1 Hello ${name}');
// この文字列をファイルに保存します（例: templates.js）
```

#### 事前コンパイル済みテンプレートのブラウザでの利用例

```html
<script src="dist/slm-vm-browser.js"></script>
<!-- templates.jsにwindow.myTemplate = [function(vm){...}]が定義されていると想定 -->
<script src="dist/templates.js"></script>
<script>
	const vm = new SlmVM();
	const templateFn = vm.runInContext(window.myTemplate);
	const html = templateFn({name: 'World'}, vm);
</script>
```

## ライセンス

Slm-neoは[MITライセンス](http://www.opensource.org/licenses/MIT)の下で公開されています。

## 謝辞

このプロジェクトは、[slm-lang](https://github.com/slm-lang)チームによるオリジナルの[slm](https://github.com/slm-lang/slm)を現代化したフォークです。このエレガントなテンプレートエンジンの基礎を築いてくださった彼らの活動に深く感謝します。

### スペシャルサンクス

- **Yury Korolev** (https://github.com/yury), オリジナルの[slm](https://github.com/slm-lang/slm)作成者
- **AnjLab** (http://anjlab.com), 素晴らしいオリジナルの[slm-lang](https://github.com/slm-lang)チーム
- **ngsctt** (https://github.com/ngsctt), [slm-mod](https://github.com/ngsctt/slm-mod)の作成者。Slmエンジンの近代化に多くのインスピレーションをいただきました
- **Andrew Stone** (https://github.com/stonean), [Slim](https://github.com/slim-template/slim)作成者
- **Magnus Holm** (https://github.com/judofyr), [Temple](https://github.com/judofyr/temple)作成者
- **Daniel Mendler** (https://github.com/minad), 両プロジェクトのメンテナ
- **John Firebaugh** (https://github.com/jfirebaugh), [Skim](https://github.com/jfirebaugh/skim)作成者
