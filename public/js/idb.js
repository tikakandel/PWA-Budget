let db;
const budgetVersion=1;
const dbName = 'BudgetStore';
// Create a new db request for a "BudgetDB" database and version .
const request = indexedDB.open(dbName, budgetVersion);

request.onupgradeneeded = function (e) {
 
  db = e.target.result;

  if (db.objectStoreNames.length === 0) {
    db.createObjectStore(dbName, { autoIncrement: true });
  }
};
request.onerror = function (e) {
  console.log(`Woops! ${e.target.errorCode}`);
};


function checkDatabase() {
  console.log('check db invoked');

  // Open a transaction on your BudgetStore db
  const transaction = db.transaction([dbName], 'readwrite');

  // access your BudgetStore object
  const store = transaction.objectStore(dbName);

  // Get all records from store and set to a variable
  const getAll = store.getAll();
  // Get all records from store and set to a variable
	getAll.onsuccess = async (event) => {
    const result = event.target.result;

    if (result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
      .then((response) => response.json())
        .then((res) => {
          if (res.length !== 0) {
            // Open another transaction to BudgetStore with the ability to read and write
            const currentTransaction = db.transaction([dbName], 'readwrite');

            // Assign the current store to a variable
            const currentStore = currentTransaction.objectStore(dbName);

            // Clear existing entries because our bulk add was successful
            currentStore.clear();
            console.log('Clearing store....');
          }
          })
      }
  }
}
request.onsuccess = function (e) {
  console.log('success');
  db = e.target.result;

  // Check if app is online before reading from db
  if (navigator.onLine) {
    console.log('Backend online! 🗄️');
    checkDatabase();
  }
};

const saveRecord = (record) => {
  console.log('Save record invoked');
  // Create a transaction on the BudgetStore db with readwrite access
  const transaction = db.transaction([dbName], 'readwrite');

  // Access your BudgetStore object store
  const store = transaction.objectStore(dbName);

  // Add record to your store with add method.
  store.add(record);
};

// Listen for app coming back online
window.addEventListener('online', checkDatabase);