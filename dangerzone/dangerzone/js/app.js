var request = self.indexedDB.open('dzonemanager', 1);

request.onupgradeneeded = function(event) {
    var db = event.target.result;
    var locationsStore = db.createObjectStore('locations', {keyPath: 'id', autoIncrement: true});
    locationsStore.createIndex('lat', 'lat', {unique: false});
    locationsStore.createIndex('lng', 'lng', {unique: false});
    locationsStore.createIndex('alertlvl', 'alertlvl', {unique: false});
};

function saveData(lat, lng) {
    var alertlvl = document.getElementById('alertlevel').value;

request.onsuccess = function(event) {
	var lat = $('lat').val();
	var lng = $('lng').val();
	var alertlvl = $('alertlvl').val();

    var locations = [
    	{lat: lat, lng: lng, alertlvl: alertlvl}
    ];

    
    var db = event.target.result;

    // create transaction from database
    var transaction = db.transaction('locations', 'readwrite');

    // add success event handleer for transaction
    // you should also add onerror, onabort event handlers
    transaction.onsuccess = function(event) {
        console.log('[Transaction] ALL DONE!');
    };

    // get store from transaction
    var locationsStore = transaction.objectStore('locations');

    // put products data in productsStore
    locations.forEach(function(location){
        var db_op_req = locationsStore.add(location);

        db_op_req.onsuccess = function(event) {
            console.log(event.target.result == location.id); // true
        }
    });
    /*
    locationsStore.count().onsuccess = function(event) {
        console.log('[Transaction - COUNT] number of products in store', event.target.result);
    };

    locationsStore.get(1).onsuccess = function(event) {
        console.log('[Transaction - GET] product with id 1', event.target.result);
    };

    locations[0].name = 'Blue Men T-shirt';
    locationsStore.put(locations[0]).onsuccess = function(event) {
        console.log('[Transaction - PUT] product with id 1', event.target.result);
    };

    locationsStore.delete(2).onsuccess = function(event) {
        console.log('[Transaction - DELETE] deleted with id 2');
    };
    */
};

request.onerror = function(event) {
    console.log('[onerror]', request.error);
	};
}