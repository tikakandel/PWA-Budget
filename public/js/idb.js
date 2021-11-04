let db;
// establish a connection to IndexedDB database called 'budget_tracker' and set it to version 1

const indexedDB =
    window.indexedDB ||
    window.mozIndexedDB ||
    window.webkitIndexedDB ||
    window.msIndexedDB ||
    window.shimIndexedDB;

const request = indexedDB.open("budget", 1);
// this event will emit if the database version changes
request.onupgradeneeded = function (event) {
  // create object store called "pending" and set autoIncrement to true
  const db = event.target.result;

      // create an object store (table) called `pending`, set it to have an auto incrementing primary key of sorts
  db.createObjectStore("pending", { autoIncrement: true });
};
// upon a successful
request.onsuccess = function (event) {
   // when db is successfully created with its object store or simply established a connection, save reference to db in global variable
  db = event.target.result;

  // check if app is online before reading from db
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (event) {
  console.log("Woops! " + event.target.errorCode);
};
// This function will be executed if we attempt to submit a new transaction and there's no internet connection
function saveRecord(record) {
  // create a transaction on the pending db with readwrite access
  const transaction = db.transaction(["pending"], "readwrite");

  // access your pending object store
  const store = transaction.objectStore("pending");

  // add record to your store with add method.
  store.add(record);
}

function checkDatabase() {
  // open a transaction on your pending db
  const transaction = db.transaction(["pending"], "readwrite");
  // access your pending object store
  const store = transaction.objectStore("pending");
  // get all records from store and set to a variable
  const getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
        .then(response => response.json())
        .then(() => {
          // if successful, open a transaction on your pending db
          const transaction = db.transaction(["pending"], "readwrite");

          // access your pending object store
          const store = transaction.objectStore("pending");

          // clear all items in your store
          store.clear();
        });
    }
  };
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);
