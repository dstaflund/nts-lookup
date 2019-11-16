const CANADA_LAT_CENTER = 62.30;
const CANADA_LNG_CENTER = -97.00;

const SEARCH_SERVICE_URL = 'https://search-dot-nts-lookup-257217.appspot.com';

NTSOverlay.prototype = new google.maps.OverlayView();

let map;

// noinspection JSUnusedGlobalSymbols
/**
 * Called when map control is first rendered.
 *
 * At this point we need to display Canada in the viewport and wire up various handlers, etc.
 */
function initMap () {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: CANADA_LAT_CENTER, lng: CANADA_LNG_CENTER },
        zoom: (getViewportSize()[0] <= 1000 ? 3 : 4)
    });
    map.addListener('bounds_changed', boundsChanged(map));
}

/**
 * Called when the viewport has changed.
 *
 * When this happens we need to fetch and display NTS maps in the viewport.
 */
const boundsChanged = (map) => {
    fetch(SEARCH_SERVICE_URL + '/type/series')
        .then(response => response.json())
        .then(ntsMaps => ntsMaps.forEach(ntsMap => drawMapBoundary(ntsMap, map)))
        .then(() => map.removeListener('bounds_changed'))
        .catch(error => console.log(error));
};

/**
 * Called when a map is clicked.
 *
 * @param map
 */
const mapClicked = (ntsMap) => {
    fetch(SEARCH_SERVICE_URL + '/parent/' + ntsMap.name)
        .then(response => response.json())
        .then(childMaps => childMaps.forEach(childMap => drawMapBoundary(childMap, map)))
        .catch(error => console.log(error));
};

/**
 * Draws NTS Map boundaries on the Google map.
 *
 * @param ntsMap   NTS map to draw
 */
const drawMapBoundary = (ntsMap, map) => {
    new NTSOverlay(ntsMap, map);
};

/**
 * Returns an array containing the X and Y size of the viewport.
 *
 * @returns {[number, number]}  X and Y size of the viewport
 */
// See https://stackoverflow.com/questions/3437786/get-the-size-of-the-screen-current-web-page-and-browser-window
const getViewportSize = () => {
    let win = window;
    let doc = document;
    let docElem = doc.documentElement;
    let body = doc.getElementsByTagName('body')[0];
    let x = win.innerWidth || docElem.clientWidth || body.clientWidth;
    let y = win.innerHeight|| docElem.clientHeight|| body.clientHeight;
    return [x, y];
};

function NTSOverlay(ntsMap, map){
    this._ntsMap = ntsMap;
    this._map = map;

    this.setMap(this._map);
}

NTSOverlay.prototype.onAdd = function(){

    // Add a solid border to the div
    const div = document.createElement('div');
    div.style.color = '#F00';
    div.style.borderColor = '#F00';
    div.style.borderStyle = 'solid';
    div.style.borderWidth = '1px';
    div.style.position = 'absolute';
    div.style.margin = '0';
    div.style.padding = '0';
    div.style.textAlign = 'center';
    div.textContent = this._ntsMap.name;
//    div.setAttribute('map-data', JSON.stringify(this._ntsMap));
    div.addEventListener('mouseover', (e) => {
        div.style.borderColor = '#00F';
        div.style.borderWidth = '4px';
    });
    div.addEventListener('mouseout', (e) => {
        div.style.borderColor = '#F00';
        div.style.borderWidth = '1px';
    });
    div.addEventListener('click', () => {
        mapClicked(this._ntsMap);
    });
    this._div = div;

    // Add div to Google Map's 'overlayLayer' pane
    this.getPanes().overlayMouseTarget.appendChild(div);
};

NTSOverlay.prototype.draw = function(){
    const projection = this.getProjection();

    // Convert overlay coordinates to pixel coordinates
    const sw = projection.fromLatLngToDivPixel(new google.maps.LatLng(this._ntsMap.south, this._ntsMap.west));
    const ne = projection.fromLatLngToDivPixel(new google.maps.LatLng(this._ntsMap.north, this._ntsMap.east));

    // Resize div to fix overlay dimensions
    const div = this._div;
    div.style.left = sw.x + 'px';
    div.style.top = ne.y + 'px';
    div.style.width = (ne.x - sw.x) + 'px';
    div.style.height = (sw.y - ne.y) + 'px';
    div.style.lineHeight = (sw.y - ne.y) + 'px';
};

NTSOverlay.prototype.onRemove = function(){
    this._div.parentNode.removeChild(this._div);
    this._div = null;
};

google.maps.event.addDomListener(window, 'load', initMap);1