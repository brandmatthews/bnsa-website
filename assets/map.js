// Bend Night Sky Alliance — interactive map
document.addEventListener('DOMContentLoaded', function () {
  var mapEl = document.getElementById('bnsa-map');
  if (!mapEl) return;

  // Bounding box around the survey area, with a little breathing room
  var SOUTH = 43.965, WEST = -121.42, NORTH = 44.145, EAST = -121.20;
  var maxBounds = [[SOUTH, WEST], [NORTH, EAST]];

  var map = L.map('bnsa-map', {
    center: [44.055, -121.310],
    zoom: 12,
    minZoom: 11,
    maxZoom: 18,
    maxBounds: maxBounds,
    maxBoundsViscosity: 1.0
  });

  // Esri World Dark Gray basemap — no key required, attribution required
  L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 16,
    attribution: 'Tiles &copy; Esri — Esri, DeLorme, NAVTEQ'
  }).addTo(map);

  // Reference labels layer (place names, roads) sits above the base canvas
  L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 16
  }).addTo(map);

  var redColor = '#c06767'; //Phase 1 corridor
  var goldColor = '#ddb868'; //Phase 2 corridor
  var mutedColor = '#858b99'; //Light inventory
  var flagColor = '#7f39cf'; //Submitted
  var fixedColor = '#db9437'; //Fixed

  // ---------- Roads ----------
  function roadStyle(color, dashed) {
    return { color: color, weight: 3, opacity: 0.85, dashArray: dashed ? '6 5' : null };
  }

  var roadsLayerGroup = L.layerGroup().addTo(map);

  fetch('assets/data/roads_phase1.geojson')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      L.geoJSON(data, {
        style: roadStyle(redColor, false),
        onEachFeature: function (f, layer) {
          layer.bindPopup('<strong>Phase 1</strong><br>Status: ' + (f.properties.status || 'Unknown'));
        }
      }).addTo(roadsLayerGroup);
    });

  fetch('assets/data/roads_phase2.geojson')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      L.geoJSON(data, {
        style: roadStyle(goldColor, true),
        onEachFeature: function (f, layer) {
          layer.bindPopup('<strong>Phase 2</strong><br>Status: ' + (f.properties.status || 'Unknown'));
        }
      }).addTo(roadsLayerGroup);
    });

  // ---------- Streetlights ----------
  var baseLightsGroup = L.layerGroup().addTo(map);
  var flaggedLightsGroup = L.layerGroup().addTo(map);

  function popupHTML(p) {
    var rows = [];
    if (p.cross_streets) rows.push(['Cross streets', p.cross_streets]);
    if (p.corner) rows.push(['Corner', p.corner]);
    rows.push(['Owner', p.owner || 'Unknown']);
    if (p.wattage) rows.push(['Wattage', p.wattage + 'W']);
    rows.push(['Shielded', p.shielded === 'Yes' ? 'Yes' : 'Unverified']);
    if (p.status) rows.push(['Status', p.status]);
    if (p.verified_date) rows.push(['Verified', p.verified_date]);
    if (p.notes) rows.push(['Notes', p.notes]);
    var html = '<div class="bnsa-popup"><strong>' + (p.facility_id || 'Streetlight') + '</strong><br>';
    rows.forEach(function (r) { html += '<span class="pk">' + r[0] + ':</span> ' + r[1] + '<br>'; });
    html += '</div>';
    return html;
  }

  fetch('assets/data/lights.geojson')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      data.features.forEach(function (f) {
        var p = f.properties;
        var coords = f.geometry.coordinates;
        var latlng = [coords[1], coords[0]];
        var flagged = p.status === 'Submitted' || p.status === 'Fixed';

        if (flagged) {
          var isFixed = p.status === 'Fixed';
          var marker = L.circleMarker(latlng, {
            radius: 7,
            color: isFixed ? fixedColor : flagColor,
            weight: 2,
            fillColor: isFixed ? fixedColor : flagColor,
            fillOpacity: 0.9
          });
          marker.bindPopup(popupHTML(p));
          marker.addTo(flaggedLightsGroup);
        } else {
          var dot = L.circleMarker(latlng, {
            radius: 2.5,
            color: mutedColor,
            weight: 0,
            fillColor: mutedColor,
            fillOpacity: 0.55
          });
          dot.bindPopup(popupHTML(p));
          dot.addTo(baseLightsGroup);
        }
      });
    });

  // ---------- Layer control ----------
  var overlays = {
    'Flagged lights (Submitted / Fixed)': flaggedLightsGroup,
    'Full streetlight inventory': baseLightsGroup,
    'Phase 1 & 2 corridors': roadsLayerGroup
  };
  L.control.layers(null, overlays, { collapsed: false }).addTo(map);
});
