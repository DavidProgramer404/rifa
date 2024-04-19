window.onload = function() {
    displayAllEntries();
};

document.getElementById('entryForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const number = parseInt(document.getElementById('number').value);
    
    if (number < 1 || number > 150) {
        alert('Por favor, elija un número entre 1 y 150.');
        return;
    }

    const entry = { name, email, number };

    // Guardar en la base de datos local
    saveEntry(entry);

    // Mostrar el registro en pantalla
    displayEntry(entry);

    // Mostrar mensaje de éxito
    document.getElementById('results').innerHTML = `¡${name}, te has registrado con éxito para el número ${number}!`;
});

function saveEntry(entry) {
    const request = window.indexedDB.open('rifa_database', 1);

    request.onerror = function(event) {
        console.error("Error al abrir la base de datos:", event.target.errorCode);
    };

    request.onupgradeneeded = function(event) {
        const db = event.target.result;
        const objectStore = db.createObjectStore('entries', { keyPath: 'number' });
    };

    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction(['entries'], 'readwrite');
        const objectStore = transaction.objectStore('entries');
        
        const addRequest = objectStore.add(entry);

        addRequest.onsuccess = function(event) {
            console.log('Entrada guardada exitosamente.');
        };

        addRequest.onerror = function(event) {
            console.error('Error al guardar la entrada:', event.target.error);
        };

        transaction.oncomplete = function() {
            db.close();
        };
    };
}

function displayEntry(entry) {
    const entryList = document.getElementById('entryList');
    const entryItem = document.createElement('li');
    entryItem.classList.add('list-group-item', 'col');
    entryItem.innerHTML = `
        <p><strong>Nombre:</strong> ${entry.name}</p>
        <p><strong>Correo electrónico:</strong> ${entry.email}</p>
        <p><strong>Número:</strong> ${entry.number}</p>
        <button class="btn btn-danger delete-btn" data-number="${entry.number}">Eliminar</button>
    `;
    entryList.appendChild(entryItem);

    // Agregar un evento click al botón de eliminar
    entryItem.querySelector('.delete-btn').addEventListener('click', function() {
        const number = parseInt(this.getAttribute('data-number'));
        deleteEntry(number);
        this.parentNode.remove(); // Eliminar la entrada de la lista en pantalla
    });
}

function displayAllEntries() {
    const request = window.indexedDB.open('rifa_database', 1);

    request.onerror = function(event) {
        console.error("Error al abrir la base de datos:", event.target.errorCode);
    };

    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction(['entries'], 'readonly');
        const objectStore = transaction.objectStore('entries');
        const getAllRequest = objectStore.getAll();

        getAllRequest.onsuccess = function(event) {
            const entries = event.target.result;
            entries.forEach(entry => {
                displayEntry(entry);
            });
        };

        transaction.oncomplete = function() {
            db.close();
        };
    };
}

function deleteEntry(number) {
    const request = window.indexedDB.open('rifa_database', 1);

    request.onerror = function(event) {
        console.error("Error al abrir la base de datos:", event.target.errorCode);
    };

    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction(['entries'], 'readwrite');
        const objectStore = transaction.objectStore('entries');
        
        const deleteRequest = objectStore.delete(number);

        deleteRequest.onsuccess = function(event) {
            console.log('Entrada eliminada exitosamente.');
        };

        deleteRequest.onerror = function(event) {
            console.error('Error al eliminar la entrada:', event.target.error);
        };

        transaction.oncomplete = function() {
            db.close();
        };
    };
}
