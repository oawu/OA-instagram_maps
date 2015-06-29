/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 OA Wu Design
 */

$(function () {
  var $map = $('#map');
  var $loadingData = $('.map .loading_data');
  var $loading = $('<div />').attr ('id', 'loading')
                             .append ($('<div />'))
                             .appendTo ($('.map'));
  
  var _map = null;
  var _markers = [];
  var _markerCluster = null;
  var _isGetMarkers = false;
  var _getMarkersTimer = null;

  window.ajaxError = function (result) {
    console.error (result.responseText);
  };
  Array.prototype.diff = function (a) {
    return this.filter (function (i) { return a.map (function (t) { return t.id; }).indexOf (i.id) < 0; });
  };
  function formatFloat (num, pos) {
    var size = Math.pow (10, pos);
    return Math.round (num * size) / size;
  }

  function getMarkers () {
    clearTimeout (_getMarkersTimer);

    _getMarkersTimer = setTimeout (function () {
      if (_isGetMarkers)
        return;
      
      $loadingData.addClass ('show');
      _isGetMarkers = true;

      var northEast = _map.getBounds().getNorthEast ();
      var southWest = _map.getBounds().getSouthWest ();

      $.ajax ({
        url: 'get_markers.php',
        data: { NorthEast: {latitude: northEast.lat (), longitude: northEast.lng ()},
                SouthWest: {latitude: southWest.lat (), longitude: southWest.lng ()},  },
        async: true, cache: false, dataType: 'json', type: 'POST',
        beforeSend: function () {}
      })
      .done (function (result) {

        if (result.status) {

          var markers = result.markers.map (function (t) {
            var markerWithLabel = new MarkerWithLabel ({
              position: new google.maps.LatLng (t.lat, t.lng),
              draggable: false,
              raiseOnDrag: false,
              clickable: true,
              labelContent: '<img src="' + t.url + '" />',
              labelAnchor: new google.maps.Point (50, 50),
              labelClass: "marker_label",
              icon: { path: 'M 0 0' }
            });

            google.maps.event.addListener(markerWithLabel, 'click', function () {
              $fancyBox.attr ('title', t.des).attr ('href', t.url.ori).click ();
            });

            return {
              id: t.id,
              marker: markerWithLabel
            };
          });

          var deletes = _markers.diff (markers);
          var adds = markers.diff (_markers);
          var delete_ids = deletes.map (function (t) { return t.id; });
          var add_ids = adds.map (function (t) { return t.id; });

          _markerCluster.removeMarkers (deletes.map (function (t) { return t.marker; }));
          _markerCluster.addMarkers (adds.map (function (t) { return t.marker; }));

          _markers = _markers.filter (function (t) { return $.inArray (t.id, delete_ids) == -1; }).concat (markers.filter (function (t) { return $.inArray (t.id, add_ids) != -1; }));

          $loadingData.removeClass ('show');
          _isGetMarkers = false;
        }
      })
      .fail (function (result) { ajaxError (result); })
      .complete (function (result) {});
    }, 500);
  }

  function initialize () {
    var styledMapType = new google.maps.StyledMapType ([
      { featureType: 'transit.station.bus',
        stylers: [{ visibility: 'off' }]
      }, {
        featureType: 'poi',
        stylers: [{ visibility: 'off' }]
      }, {
        featureType: 'poi.attraction',
        stylers: [{ visibility: 'on' }]
      }, {
        featureType: 'poi.school',
        stylers: [{ visibility: 'on' }]
      }
    ]);

    var option = {
        zoom: 14,
        scaleControl: true,
        navigationControl: true,
        disableDoubleClickZoom: true,
        mapTypeControl: false,
        zoomControl: true,
        scrollwheel: true,
        streetViewControl: false,
        center: new google.maps.LatLng (25.022073145389157, 121.54706954956055),
      };

    _map = new google.maps.Map ($map.get (0), option);
    _map.mapTypes.set ('map_style', styledMapType);
    _map.setMapTypeId ('map_style');
    _markerCluster = new MarkerClusterer(_map, [], {
      styles: [{
            url: 'img/map/set/1.png',
            height: 74,
            width: 75,
            textSize: 20,
            textColor: '#ffffff',
            backgroundPosition: "0 -4px"
        },
        {
            url: 'img/map/set/2.png',
            height: 74,
            width: 75,
            textSize: 20,
            textColor: '#ffffff',
            backgroundPosition: "0 -4px"
        },
        {
            url: 'img/map/set/3.png',
            height: 74,
            width: 75,
            textSize: 20,
            textColor: '#ffffff',
            backgroundPosition: "0 -4px"
        },
        {
            url: 'img/map/set/4.png',
            height: 74,
            width: 75,
            textSize: 20,
            textColor: '#ffffff',
            backgroundPosition: "0 -4px"
        },
        {
            url: 'img/map/set/5.png',
            height: 74,
            width: 75,
            textSize: 20,
            textColor: '#ffffff',
            backgroundPosition: "0 -4px"
        }]
    });

    google.maps.event.addListener(_map, 'zoom_changed', getMarkers);
    google.maps.event.addListener(_map, 'dragend', getMarkers);

    $loading.fadeOut (function () {
      $(this).hide (function () {
        $(this).remove ();
        getMarkers ();
      });
    });
  }

  google.maps.event.addDomListener (window, 'load', initialize);
});