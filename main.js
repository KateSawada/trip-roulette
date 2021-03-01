//参考 https://qiita.com/TakeshiNickOsanai/items/783caa9f31bcf762da16
let map = L.map('mapid', {
    center: [35.185649, 136.96741],
    zoom: 5,
}); 

// OpenStreetMap から地図画像を読み込む
var tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: '© <a href="http://osm.org/copyright">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
});
tileLayer.addTo(map);

var centerLat;
var centerLng;
var radius;
var centerMarker;
var destinationMarker;
var indicator;

function setCenterMarker(text) {
    //既存のマーカーの削除
    if(centerMarker){
        map.removeLayer(centerMarker);
        
    }
        centerMarker = L.marker([centerLng, centerLat]).addTo(map);
        centerMarker.bindPopup(`<b>中心</b><br>` + text);
}

/*
//円を書く
L.circle([35.185649, 136.96741], {
    color: 'red',
    fillOpacity: 0.1    ,
    radius: 100000
}).addTo(map);
*/

async function searchCoodinateFromCity(prefecture, city){
/*
     * 県名or都市名から緯度経度を返す
     * 両方空列ならばfalse, 見つからなければfalse, 見つかれば緯度経度を返す
     */
    let result;
    axios.get(`https://geoapi.heartrails.com/api/json?method=getTowns&prefecture=${encodeURI(prefecture)}&city=${encodeURI(city)}`)
      .then(res => {
            console.log(res)
            if(res.data.response.error){
                alert("見つかりませんでした");
                return false;
            }
            map.flyTo([res.data.response.location[0].y, res.data.response.location[0].x], 8);
            result = {"lat": res.data.response.location[0].x, "lng": res.data.response.location[0].y};
            centerLat = result.lat;
            centerLng = result.lng;
            setCenterMarker(res.data.response.location[0].prefecture + res.data.response.location[0].city + res.data.response.location[0].town)
        });
    return result;
    /*
    fetch(`http://geoapi.heartrails.com/api/json?method=getTowns&prefecture=${encodeURI(prefecture)}&city=${encodeURI(city)}`,{
        "Access-Control-Allow-Origin": "*"
    })
    .then(response => response.json()
    .then(data => {
        //見つからなかった時
        if(data.response.error){
            alert("見つかりませんでした");
            return false;
        }
        //見つかった時
        console.log(data.response.location[0]);
        map.flyTo([data.response.location[0].y, data.response.location[0].x], 8);
        return {"lat": data.response.location[0].x, "lng": data.response.location[0].y};
    }));
    */
}

async function searchCityFromCoodinate(lat, lng){
    /**
     * 緯度経度から都市名を返す
     * 見つからなかったら(海の中とか)false，見つかったら，県名，都市名，郵便番号を返す
     */
    //lat: 135, lng: 35 くらい
    let result;
    axios.get(`https://geoapi.heartrails.com/api/json?method=searchByGeoLocation&x=${lat}&y=${lng}`)
        //[ユーザー名]はQiitaマイページの@で始まる名前です
        //私の場合sukeo-sukeoと記述します
      .then(res => {
            //thenの中に取得に成功したときの処理を記述していきます
            console.log(res)
            if(res.data.response.error){
                alert("エラーが発生しました．もう一度お試しください");
                return false;
            }
            result = {
                "prefecture": res.data.response.location[0].prefecture, 
                "city": res.data.response.location[0].city,
                "town": res.data.response.location[0].town,
                "postal": res.data.response.location[0].postal
            };
            if(destinationMarker){
                map.removeLayer(destinationMarker);
            }
            map.flyTo([lng, lat], 10);
            destinationMarker = L.marker([lng, lat]).addTo(map);
            destinationMarker.bindPopup(`<b>目的地</b><br>〒${result.postal.substr(0,3)}-${result.postal.substr(3)}<br>${result.prefecture}${result.city}${result.town}付近`).openPopup();
        })
    return result;
      /*
    await fetch(`http://geoapi.heartrails.com/api/json?method=searchByGeoLocation&x=${lat}&y=${lng}`,{
        "Access-Control-Allow-Origin": "*"
    })
    .then(response => response.json()
    .then(data => {
        //見つからなかった時
        if(data.response.error){
            return false;
        }
        //見つかった時
        console.log(data.response.location[0]);

        //その場しのぎ
        
        result = {
            "prefecture": data.response.location[0].prefecture, 
            "city": data.response.location[0].city,
            "postal": data.response.location[0].postal
        };
    }));
    return result;
    */
}

function getgeo() {
    /**
     * 現在の位置をマップの中心に
     */
    /*
    map.on('locationerror', onLocationError);
    map.locate({
        setView: "true",
        maxZoom: 8
    });
    centerLat = map.getCenter().lat;
    centerLng = map.getCenter().lng;
    setCenterMarker("<b>中心</b><br>現在地");
    return {"lat": map.getCenter().lat, "lng": map.getCenter().lng};
    */
   navigator.geolocation.getCurrentPosition(position => {
       centerLng = position.coords.latitude; //何かがおかしい気がするけど動いてる
       centerLat = position.coords.longitude;
       map.flyTo([centerLng, centerLat], 8);
       setCenterMarker("<b>中心</b><br>現在地");
   });
}

function onLocationError(e) {
    alert(e.message);
    return false;
}
function drawCircle(lat, lng, radius){
    /**
     * 指定した緯度経度を中心に，指定半径の円を書く．
     * 円のLayerオブジェクトを返す．
     * map.removeLayer(marker);で削除可能
     */
    return L.circle([lng, lat], {
        color: 'red',
        fillOpacity: 0.1,
        radius: radius * 1000
    }).addTo(map);
}

function definePoint(lat, lng, radius){
    lat = Number(lat);
    lng = Number(lng);
    radius = Number(radius);
    /**
     * 指定した緯度経度からの距離がradius以下である点を一様乱数により生成し，緯度経度を返す
     */
    let returnLat = (Math.random() - 0.5) * 2 * radius* 1.3 / 100 + lat;
    let returnLng = (Math.random() - 0.5) * 2 * radius* 1.3 / 100 + lng;

    while(distance(lat, lng, returnLat, returnLng) > radius){
        returnLat = (Math.random() - 0.5) * 2 * radius* 2 / 100 + lat;
        returnLng = (Math.random() - 0.5) * 2 * radius* 2 / 100 + lng;
    }
    return {"lat": returnLat, "lng": returnLng};
}
/*
 * 緯度経度と距離の関係
 * [35, 136] ~ [35, 137] =>  91287m
 * [34, 136] ~ [35, 136] => 110931m
 * 緯度のユークリッド距離 : 現実の距離 ≒ 1 : 100km
 */

//https://qiita.com/kawanet/items/a2e111b17b8eb5ac859a
//2地点の緯度経度から距離(km)を返す
function distance(lat1, lng1, lat2, lng2) {
    lat1 = Number(lat1);
    lng1 = Number(lng1);
    lat2 = Number(lat2);
    lng2 = Number(lng2);
    lat1 *= Math.PI / 180;
    lng1 *= Math.PI / 180;
    lat2 *= Math.PI / 180;
    lng2 *= Math.PI / 180;
    return 6371 * Math.acos(Math.cos(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1) + Math.sin(lat1) * Math.sin(lat2));
}

/*
 * 処理の流れ
 * 市区町村を指定or現在の位置を指定
 * 半径を指定
 * 緯度経度を取得 searchCoodinate(prefecture, city) or map.getCenter();
 * 円を書く
 * ちょっと広めの正方形を考えて，そこに一様分布から点を打つ => distance()の値が半径以下なら採用
 * 演出をいい感じにする
 */

/**
 * lat: 経度, lng: 緯度
 */


function drawIndicator(cLat, cLng, radius){
    cLat = Number(cLat);
    cLng = Number(cLng);
    radius = Number(radius);

    circles = [];
    for (let theta = 0; theta < 2 * Math.PI; theta += Math.PI / 72) {
        let tmp_radius = radius / 100;
        let lat = cLat + tmp_radius * Math.cos(theta);
        let lng = cLng + tmp_radius * Math.sin(theta);
        while(distance(lat, lng, cLat, cLng) > radius){
            tmp_radius -= 5 / 100;
            lat = cLat + tmp_radius * Math.cos(theta);
            lng = cLng + tmp_radius * Math.sin(theta);
        }
        while(distance(lat, lng, cLat, cLng) < radius){            
            tmp_radius += 1 / 300;
            lat = cLat + tmp_radius * Math.cos(theta);
            lng = cLng + tmp_radius * Math.sin(theta);
        }
        circles.push(L.circle([lng, lat], {
            color: 'red',
            fillOpacity: 0.1,
            radius: 300
        }).addTo(map))
    }
    return circles;
}

function searchCityFromCoodinateWrapper(lat, lng){
    searchCityFromCoodinate(lat, lng)
    .then(object => {
        console.log(object);
    })
}

function searchCoodinateFromCityWrapper(prefecture, city){
    searchCoodinateFromCity(prefecture, city)
    .then(object => {
        console.log(object);
        
    })
}

function setCoodinateFromCity(){
    let prefectureValue = document.getElementById("inputPrefecture").value;
    let cityValue = document.getElementById("inputCity").value;
    if(prefectureValue || cityValue){
        searchCoodinateFromCityWrapper(prefectureValue, cityValue);
    } else {
        alert("都道府県と市区町村が空です");
    }
}

function setCoodinateFromLocation(){
    getgeo();
}
function onChangeRadius(){
    radius = Number(document.getElementById("inputRadius").value);
    if(radius < 1){
        alert("半径が設定されていません")
        return;
    }
    if(!centerLat || !centerLng){
        return;
    }
    console.log(radius);
    if(indicator){
        for(let i = 0; i < indicator.length; i++){
            map.removeLayer(indicator[i]);
        }
    }
    indicator = drawIndicator(centerLat, centerLng, radius);
}

function onSubmit(){
    if(!centerLat || !centerLng || !radius){
        alert("中心または半径が正しく指定されていません");
        return;
    }
    destCoordinate = definePoint(centerLat, centerLng, radius);
    searchCityFromCoodinate(destCoordinate.lat, destCoordinate.lng);
}
/*

window.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById("inputRadius").addEventListener("change", evt => {onChangeRadius();})
});
*/