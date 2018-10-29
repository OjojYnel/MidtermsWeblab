idb = {
	request: null,
	db: null,
	version: 1,
	tables: null,
	init: function (options) {
        idb.tables = options.tables;
		request = self.indexedDB.open(options.database, options.version);

		request.onerror = function(event) {
            console.log("Error opening database.");
		};

		request.onsuccess = function(event) {
			idb.db = this.result;
		    idb.version = options.version;
		};

		request.onupgradeneeded = function (event) { // creation of object store first time on version change.
                var resultDb = event.target.result;
                idb.db = resultDb;
                var optionTables = idb.tables;


                //drop unwanted tables
                for (var i = 0; i < resultDb.objectStoreNames.length; i++) {
                    var needToDrop = true;
                    for (var j = 0; j < optionTables.length; j++) {
                        if (resultDb.objectStoreNames[i] == optionTables[j].name) {
                            needToDrop = false;
                            break;
                        }
                    }
                    if (needToDrop) {
                        idb.db.deleteObjectStore(resultDb.objectStoreNames[i]);
                    }
                }


                //create new tables
                for (var i = 0; i < optionTables.length; i++) {
                    if (!resultDb.objectStoreNames.contains(optionTables[i].name)) {
                        var objectStore = resultDb.createObjectStore(optionTables[i].name, { keyPath: optionTables[i].keyPath, autoIncrement: optionTables[i].autoIncrement });
                        console.log(optionTables[i].name + " Created.");
                        if (optionTables[i].index != null && optionTables[i].index != 'undefined') {
                            for (var idx = 0; idx < optionTables[i].index.length; idx++) {
                                objectStore.createIndex(optionTables[i].index[idx].name, optionTables[i].index[idx].name, { unique: optionTables[i].index[idx].unique });
                            }
                        }
                    }
                }
            }
		},

    insert: function (table, data, callback = null) {
        var db = idb.db;

        var isTableExists = false;
        for (var i = 0; i < idb.tables.length; i++) {
            if (idb.tables[i].name == table) {
                isTableExists = true;
                break;
            }
        }

        if (!isTableExists) {
            if (callback && typeof (callback) === "function") {
                callback(false, table + " Table not found.");
            }
        }
        else {
            var tx = db.transaction(table, "readwrite");
            var store = tx.objectStore(table);


            var dataLength = 1;
            if (data.constructor === Array) {
                dataLength = data.length;
                for (var i = 0; i < dataLength; i++) {
                    store.add(data[i]);
                }
            }
            else {
                store.add(data);
            }

            tx.oncomplete = function () {
                if (callback && typeof (callback) === "function") {
                    callback(true, "" + dataLength + " records inserted.");
                }
            };
        }
    },

    select: function (table, key, callback) {
            var db = idb.db;

            var isTableExists = false;
            for (var i = 0; i < idb.tables.length; i++) {
                if (idb.tables[i].name == table) {
                    isTableExists = true;
                    break;
                }
            }

            if (!isTableExists) {
                if (callback && typeof (callback) === "function") {
                    callback(false, table + " Table not found.");
                }
            }
            else {

                var tx = db.transaction(table, "readonly");
                var store = tx.objectStore(table);
                var request;
                var keyLength = -1;
                var data;
                if (key && typeof (key) === "function") {
                    request = store.getAll();
                }
                else if (key.constructor === Array) {
                    keyLength = key.length
                    request = store.getAll();
                }
                else if (key && typeof key === 'object' && key.constructor === Object) {
                    keyLength = 1
                    var index = store.index(key.key);
                    request = index.getAll(key.value);
                }
                else {
                    keyLength = 1;
                    request = store.get(key);
                }


                tx.oncomplete = function (event) {
                    //if all argument available
                    var result = request.result;
                    var keypath = request.source.keyPath;
                    var filteredResult = [];

                    //if need to filter key array
                    if (keyLength > 1) {
                        for (var i = 0; i < result.length; i++) {
                            for (var j = 0; j < keyLength; j++) {
                                if (result[i][keypath] == key[j]) {
                                    filteredResult.push(result[i]);
                                    break;
                                }
                            }
                        }
                        result = filteredResult;
                    }


                    if (callback && typeof (callback) === "function") {
                        callback(true, result);

                    }

                    //if only two argument available
                    if (key && typeof (key) === "function") {
                        key(true, request.result);
                    }
                }

                tx.onerror = function () {
                    if (callback && typeof (callback) === "function") {
                        callback(false, request.error);
                    }
                };
            }
        }, 
    };