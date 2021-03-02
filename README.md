# trip-roulette

## About this
某ダーツの旅のように，行き先をランダムに決める旅って面白いですよね．ということで，ブラウザで簡単にそれを実現できるサイトを作りました．  
「あまり遠いとちょっと…」ということで，中心と半径を決めることで，その範囲内からランダムに地点を選ぶようになっています．  
地図の表示にはLeaflet+OpenStreetMapを使いました．
## 使い方
https://katesawada.github.io/trip-roulette/
ここで実際に動かしてみてください．多分見ればわかります．
## 不具合
 - 陸からそこそこ離れた海の中の地点が抽選されるとエラーが起きる
    - 緯度経度から地名を変換できないことが原因か．
## 仕様API等
 - 地名と緯度経度の変換: http://geoapi.heartrails.com/api.html
 - 地図データ: https://www.openstreetmap.org/#map=5/35.588/134.380