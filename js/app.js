$(document).ready(function() {

    // choose map providers between: https://leaflet-extras.github.io/leaflet-providers/preview/
    var outdoors = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoieWFtaWxhIiwiYSI6IjUzNDE5ZDRkZjBiZjBiZDY0YTBhZjBmNmUyZGYzYTZiIn0.okLJEzGsBQ6IOgn1mhToIQ', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                     '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                     'Imagery © <a href="http://mapbox.com">Mapbox</a>',
        id: 'mapbox.outdoors'
    });

    var centerMap = [40.6390, -3.1229];

    map = L.map('map', {
        center: centerMap,
        zoom: 9,
        layers: [outdoors]
    }).on('moveend', function() {
        drawRoutes(map, routes_bboxes);
    });

    var hash = new L.Hash(map);

    var routes_bboxes = {};
    for (var id in routes_dict) {
        createGpx(routes_dict[id]).then(function(id, gpx){
            routes_bboxes[id] = gpx;
        }.bind(null, id));
    }

    drawRoutes(map, routes_bboxes);
});


function createGpx(route_dict) {
    return new Promise(function(resolve, reject) {
        var customLink = "";
        if (route_dict.link){
            customLink = "<br/><a href='" + route_dict.link + "' target='new'>Ver historia</a>";
        }

        var customIcon = route_dict.cat.icon;
        var customColor = route_dict.cat.color;

        // Route gpx
        var gpx =  new L.GPX(route_dict.source, {
            max_point_interval: 7200000,
            gpx_options: {
                parseElements: ['route', 'track']
            },
            async: true,
            marker_options: {
                startIcon: new L.AwesomeMarkers.icon({
                    icon: customIcon,
                    prefix: 'ion',
                    markerColor: customColor,
                    iconColor: 'white'
                }),
                startIconUrl: null,
                endIconUrl: null,
                shadowUrl: null
            },
            polyline_options: {
                color: customColor
            },
            customLink: customLink,
            customIcon: customIcon
        })
        .on('loaded', function(e){
            // Popup
            var link = e.target.options.customLink;
            var icon = e.target.options.customIcon;
            var name = e.target.get_name();
            var distance = (e.target.get_distance() / 1000).toFixed(2);
            var content = "<i class='icon ion-" + icon + "'></i> <strong>" + name + "</strong> (" + distance + " km)" + link;
            e.target.bindPopup(content);
            resolve(gpx);
        });
    });
}

function drawRoutes(map, routes_bboxes) {
    var bboxMap = map.getBounds();
    for (var id in routes_bboxes) {
        if (bboxMap.intersects(routes_bboxes[id].getBounds())) {
            console.log("SÍ!");
            console.log(routes_bboxes[id].get_name());
            routes_bboxes[id].addTo(map);
        } else {
            console.log("NO!");
            console.log(routes_bboxes[id].get_name());
        }
    }
}
