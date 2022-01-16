## create-react-app インストール

```
$ sudo npm i -g create-react-app
```

## aws-amplify/cli インストール

```
$ sudo npm i -g @aws-amplify/cli
```

## Amplify Configure

```
$ amplify configure
```

- リージョンを ap-northeast-1 にする

- ユーザ名、権限をデフォルトにして Amplify ユーザを作成する
- 作成したユーザの API キーとシークレットキーを入力する
- プロファイル名を default にする

## React App 作成

```
$ npx create-react-app amplify-notetaker --template typescript
```

## Amplify Init

React プロジェクトフォルダ直下で

```
$ amplify init
```

- name をデフォルト
- environment を blogapi
- editor を VSCode
- type of app を javascript
- framework を react
- Source Dir をデフォルト
- Distribution Dir をデフォルト
- 各 command をデフォルト
- authentication method を AWS profile (default)
- CFn で Amplify コンポーネントが作成される
- backend/に amplify-meta.json などのファイルが作成される

## Amplify Add API

React プロジェクトフォルダ直下で

```
$ amplify add api
```

- services を GraphQL
- API キーの有効期間は 7 日だけど、このまま続ける
- スキーマテンプレートを Single object with fields
- スキーマを今、変更する

## Amplify Push

変更を反映する

```
$ amplify push
```

## Amplify Console API

Amplify コンソール API を Web で開く

```
$ amplify console api
```

## aws-amplify, aws-amplify-react install

```
$ npm install aws-amplify aws-amplify-react
```

## Amplify Add Auth

React プロジェクトフォルダ直下で

```
$ amplify add auth
```

- Default configuration
- username
- No, I am done.

```
$ amplify push
```

## @aws-amplify/ui-react インストール

```
$ npm install @aws-amplify/ui-react
```

## Cognito ログイン画面からユーザ作成する
