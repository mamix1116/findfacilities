
var interest, mymap, facilities;
window.addEventListener("load", function () {
    if(navigator.geolocation){
      //位置情報を取得
      navigator.geolocation.getCurrentPosition(onSuccess, onError,{
        maximumAge:60*1000,
        timeout:5*60*1000,
        enableHighAccuracy:true
      });
    }
    else {
      document.getElementById("result").innerHTML = "Your browser does not support html5 geolocation"
    }
});

function onSuccess(position){
  var lat = position.coords.latitude;
  var long = position.coords.longitude;

  //地図タイル
  var pale = L.tileLayer('http://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png',
            {
              id: 'palemap',
              minZoom: 5,
              maxZoom: 18,
              attribution: "<a href='http://portal.cyberjapan.jp/help/termsofuse.html' target='_blank'>国土地理院</a>"
            });
  var blank = L.tileLayer('http://cyberjapandata.gsi.go.jp/xyz/blank/{z}/{x}/{y}.png',
            {
              id: 'blankmap',
              minZoom: 5,
              maxZoom: 14,
              attribution: "<a href='http://portal.cyberjapan.jp/help/termsofuse.html' target='_blank'>国土地理院</a>"
            });
  var osm = L.tileLayer('http://tile.openstreetmap.jp/{z}/{x}/{y}.png',
            {
              id: 'osmmap',
              minZoom: 5,
              maxZoom: 18,
              attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            });

  //地図オブジェクトを生成
  mymap = L.map('mapid', {
    center:[lat,long],
    zoom: 14,
    layers: [osm]
  });

  var baseMaps = {
        "淡色地図" : pale,
        "白地図"   : blank,
        "OSM japan"  : osm
    };

  // 地図オブジェクトに地図画像を追加
  L.control.layers(baseMaps, null, {collapsed: false}).addTo(mymap);

  //マーカー
  var mapMarker = L.marker([lat, long]);
  mapMarker.bindPopup("I'm here!");
  mapMarker.addTo(mymap);
  mapMarker.openPopup();

  addMarkers();

}

function getLocations(){
  mymap.removeLayer(facilities);
  addMarkers();
}

function addMarkers(){
  interest = document.getElementById("interest").value;

  var starIcon = L.AwesomeMarkers.icon({
    prefix: 'fa',
    markerColor: 'red',
    icon: 'star'
  });



  $.getJSON("facilities.geojson", function(data) {


    facilities = L.geoJson(data, {
      filter: function(feature, layer) {
        return feature.properties.facilityType == interest;
      },
      pointToLayer: function(feature, latlng) {
        return L.marker(latlng, {
          icon: starIcon
        }).on('mouseover', function(){
          this.bindPopup(feature.properties.name).openPopup();
        });
      }
    });
    //facilities.addTo(mymap);
    mymap.addLayer(facilities);

  });


}

function onError(error){
  switch(error.code){
    case PERMISSION_DENIED:
      alert("User denied permission");
      break;
    case TIMEOUT:
      alert("geolocation timed out");
      break;
    case POSITION_UNAVAILABLE:
      alert("geolocation information is not available");
      break;
    default:
      alert("Unknown error");
      break
  }
}
