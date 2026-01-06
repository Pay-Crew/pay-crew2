以下のような、特定のグループで発生する、まとめ払いによる借金の管理を行うアプリケーションを作成しようと考えている。このアプリでは、ユーザ2人の関係にしか着目しないので、グループを越えて、何円返すべきか (または、何円返してもらうべきか) を表示したいと考えている。
(例)
- user
    - α
    - β
    - γ
- group
    - A
    - B

groupAにおいて
α -100円借りる-> β
β -200円借りる-> γ

groupBにおいて
β -100円借りる-> α
β -200円借りる-> γ

αの表示
- β: 0円
- γ: 0円

βの表示
- α: 0円
- γ: -400円

γの表示
- α: 0円
- β: +400円

要件は以下の通りです。
1. ユーザは複数のグループに所属できる。
2. 各グループ内での借金情報を記録できる。
3. ユーザ同士の借金情報をグループを越えて集計できる。
4. 各ユーザの画面で、他のユーザに対する借金情報を表示できる。
5. グループ内での借金情報の追加、編集、削除ができる。
6. グループ内での借金情報の削除は論理削除で、削除した人、削除日時も記録する。
7. better authを利用するため、better authのUser TableがこのアプリのUser Tableとして機能する。
8. データベースはPostgreSQL、ORMはdrizzleを使用する。
9. フロントエンドは Vite + React + @tanstack/react-query、バックエンドはhonoで実装する。
10. APIはRESTfulに設計する。
11. 各APIの型は、openapi.jsonを共有することで達成している。特にフロントエンドは、opeanapi-react-queryで生成したコードを利用する。

現状の実証状況と、このレポジトリ内の各READMEにある設計指針を確認した上で、適切なDB構造は作成済みである。ここから、適切なAPIとフロントエンドを設計していきたい。
なお、フロントエンドでのfetchは、backendの定義を元に生成されたopenapi.jsonを読んでreact-queryのフックを自動生成するopenapi-react-queryを使っている。具体的なコードの書き方は、Rootページを参考にされたい。

想定しているフロントエンドのUIは、以下の通り (従って、以下のパスはフロントエンドのページのルーティングである。)
- /login
google IdPでのログイン
discord IdPでのログイン

- /signup
google IdPでのログイン
discord IdPでのログイン

- /
user_profile の display name (未設定の場合は、user tableのname)
user_profile の avator_url
user_profile の bio

user_profileの設定ページへのリンク
group生成のページへのリンク

userが参加しているグループ一覧

userが貸しているユーザ情報 (自分 -> あるユーザ の集計結果の一覧を表示)
userが借りているユーザ情報 (あるユーザ -> 自分の集計結果の一覧を表示)
※ 双方向に貸し借りがある場合は、相殺した結果を返すものとする

- /profile
user_profileの更新フォーム
    user_profileのdisplay_nameの入力欄
    user_profileのavator_urlの入力欄
    user_profileのbioの入力欄
user情報の更新ボタン

- /group
groupの作成フォーム
    groupのnameの入力欄
groupの作成ボタン
↓ (遷移)
招待URLのコピーボタン (これは、どう作ればいいのかよくわからない)
作成したグループのページへのリンク

- /group/{groupId}
groupのname
groupのcreated_by (created_byのuser_idからuserのname or user_profileのname)
groupのメンバー
トップ (/ のページ) に戻るボタン
貸し借りの入力フォーム
    借りたメンバー (select tag)
    貸したメンバー (セect tag)
貸し借りの登録ボタン
{groupId}の履歴一覧
※各履歴には、削除ボタンを付ける (削除すると、削除したメンバーがその項目に表示されると共に、その項目の文字列に訂正線が引かれる。「削除されました」の文字も追加する)
