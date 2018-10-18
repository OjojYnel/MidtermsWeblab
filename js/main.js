//id, lat, lng, description, location_status
	//Open Database
	var request = indexedDB.open('dzonemanager', 1);

	request.onupgradeneeded = function(e) {
		var db = e.target.result;

		if(!db.objectStoreNames.contains('dzone')){
			var os = db.createObjectStore('dzone', {keyPath: "id", autoIncrement:true});
			os.createIndex("lat", "lat", {unique: false});
			os.createIndex("lng", "lng", {unique:false});
			os.createIndex("description", "description", {unique: true});
			os.createIndex("status", "status", {unique: false});
			os.transaction.oncomplete = function(e) {
				var dzoneObjectStore = db.transaction("locations", "readwrite").objectStore("locations");
				locationData.forEach(function(location) {
					dzoneObjectStore.add(location);
				});
			}
		}
	}

	//Success
	request.onsuccess = function(e){
		console.log('Success: Opened Database...');
		db = e.target.result;
	}

	//Error
	request.onerror = function(e) {
		console.log('Error: Could not open Database...');
	}
