// ============= Initial page setup and Listeners ===============

getNotesJSON().then(displayList)

query('#new-note').addEventListener('click', (e) => createForm(e, '', '', 'create'))

query('#display-container').addEventListener('click', controlButtons)

// ================= Requests ====================

function getNotesJSON() {
    return fetch("http://localhost:3000/notes/", { "method": "GET" })
        .then(results => results.json())
}

function postNote(noteObj) {
    return fetch("http://localhost:3000/notes/", {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(noteObj)
    })
        .then(response => { console.log(`Posted note responded with status: ${response.status}`) })
}

function patchNote(noteObj) {
    return fetch(`http://localhost:3000/notes/${noteObj.id}`, {
        method: "PATCH",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(noteObj)
    })
        .then(response => { console.log(`Patched note responded with status: ${response.status}`) })
}

// id should the id assigned to the note on the server
function deleteRequest(id) {
    id = String(id)
    return fetch(`http://localhost:3000/notes/${id}`, { method: "DELETE" })
        .then(response => { console.log(`DELETE request responded with status: ${response.status}`) })
}

// ====================== Functions ============================
function displayList(noteJSON) {
    let listContainer = query('#note-list')
    noteJSON.reverse().map((obj => listContainer.appendChild(createListElem(obj))))
}

function query(selector) {
    return document.querySelector(selector)
}

function createElement(type, classList) {
    let element = document.createElement(type)
    element.classList.add(...classList)
    return element
}

function createTextElem(type, text, classList) {
    let elem = createElement(type, classList)
    elem.innerHTML = text
    return elem
}

function createListElem(noteObj) {
    let container = createElement('div', ['note-list'])
    container.id = 'note' + String(noteObj.id)
    container.setAttribute('data-id', noteObj.id)
    container.setAttribute('data-title', noteObj.title)
    container.setAttribute('data-body', noteObj.body)
    container.setAttribute('data-pinned', noteObj.pinned)
    container.setAttribute('data-date', noteObj.date)
    let titleElem = createTextElem('p', noteObj.title, ['title'])
    container.appendChild(titleElem)
    let dateElem = createTextElem('p', `Last edited: ${moment(noteObj.date).format('MMM Do, YYYY, h:mm a')}`, ['date'])
    container.appendChild(dateElem)

    container.addEventListener('click', function (event) {
        let noteListTile = event.target.closest('.note-list')
        if (noteListTile.matches('.selected')) {
            let note = query(`#display${noteListTile.dataset.id}`)
            closeNote(note)
        }
        else (
            displayNote(event)
        )
    })
    return container
}

function displayNote(event) {
    let note = event.target.closest('.note-list')
    note.classList.add('selected')
    let noteObj = {}
    noteObj.id = note.dataset.id
    noteObj.title = note.dataset.title
    noteObj.body = note.dataset.body
    noteObj.pinned = note.dataset.pinned
    noteObj.date = note.dataset.date
    query('#display-container').appendChild(createNoteElem(noteObj))
}


function createNoteElem(noteObj) {
    let container = createElement('div', ['note', 'shadow'])
    container.id = 'display' + String(noteObj.id)
    container.setAttribute('data-id', noteObj.id)
    container.setAttribute('data-title', noteObj.title)
    container.setAttribute('data-body', noteObj.body)
    container.setAttribute('data-date', noteObj.date)
    container.setAttribute('data-pinned', noteObj.pinned)
    let titleContainer = createElement('div', ['title-div'])
    let titleElem = createTextElem('p', noteObj.title, ['title'])
    titleContainer.appendChild(titleElem)
    titleContainer.appendChild(createNoteControlElems())
    container.appendChild(titleContainer)
    let noteBodySplit = noteObj.body.split('\n')
    let elements = noteBodySplit.map(par => createTextElem('p', par, ['note-par']))
    for (elem of elements) {
        container.appendChild(elem)
    }
    let dateElem = createTextElem('p', `Last edited: ${moment(noteObj.date).format('MMM Do, YYYY, h:mm a')}`, ['date'])
    container.appendChild(dateElem)
    return container
}

function createNoteControlElems() {
    let container = createElement('div', ['controls'])
    let pinButton = createElement('button', ['pin', 'to-top', 'button-sm'])
    let editButton = createElement('button', ['edit', 'edt', 'button-sm'])
    let trashButton = createElement('button', ['trash', 'delete', 'button-sm'])
    let closeButton = createElement('button', ['close', 'cls', 'button-sm'])
    pinButton.innerHTML = "<i class='material-icons md-18 to-top'>arrow_upward</i>"
    editButton.innerHTML = "<i class='material-icons md-18 edt'>edit</i>"
    trashButton.innerHTML = "<i class='material-icons md-18 delete'>delete</i>"
    closeButton.innerHTML = "<i class='material-icons cls'>close</i>"
    pinButton.title = "Pin to top"
    editButton.title = "Edit note"
    trashButton.title = "Delete note"
    closeButton.title = "Close note"
    container.appendChild(pinButton)
    container.appendChild(editButton)
    container.appendChild(trashButton)
    container.appendChild(closeButton)
    return container
}

function togglePinnedNoteObect(noteElem) {
    let pinned
    if (noteElem.matches('.pinned')) {
        pinned = false
        noteElem.classList.remove('pinned')
    }
    else {
        pinned = true
        noteElem.classList.add('pinned')
    }

    return fetch(`http://localhost:3000/notes/${noteElem.id}`,
        {
            method: "PATCH",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({ "pinned": pinned })
        })
        .then(response => { console.log(`PATCH request responded with status: ${response.status}`) })
}


function pinNote(event) {
    // ----------------- todo -----------------------
}

function displayNote(event) {
    let note = event.target.closest('.note-list')
    if (note.matches('.selected')) {
        return
    }
    note.classList.add('selected')
    let noteObj = {}
    noteObj.id = note.dataset.id
    noteObj.title = note.dataset.title
    noteObj.body = note.dataset.body
    noteObj.pinned = note.dataset.pinned
    noteObj.date = note.dataset.date
    query('#note-display').insertAdjacentElement('afterbegin', createNoteElem(noteObj))
}

function closeNote(noteElem) {
    let id = noteElem.dataset.id
    query(`#note${id}`).classList.remove('selected')
    noteElem.remove()
}

function deleteNote(noteElem) {
    let yn = prompt("Delete (y) or cancel (n)?")
    if (yn === 'y') {
        deleteRequest(noteElem.dataset.id)
        noteElem.remove()
        let id = noteElem.dataset.id
        query(`#note${id}`).remove()
    }
}

function editNote(note) {
    let body = note.dataset.body
    let title = note.dataset.title
    createForm(note.dataset.id, title, body, 'edit')
}

function controlButtons(event) {
    let note, id
    if (event.target.closest('.note')) {
        note = event.target.closest('.note')
        id = note.id
    }
    if (event.target.matches('.delete')) {
        deleteNote(note)
    }
    else if (event.target.matches('.to-top')) {
        pinNote(event)
    }
    else if (event.target.matches('.edt')) {
        editNote(note)
    }
    else if (event.target.matches('.cls')) {
        closeNote(note)
    }
}



// use = "create" or "edit"
function createForm(id, titleParam = '', bodyParam = '', use) {
    const displayContainer = query('#display-container')
    for (let child of displayContainer.children) {
        if (child.id == 'take-note-form') {
            child.remove()
        }
    }

    let formHTML = `<form id='take-note-form'>
            <div class='flex-container'>
            <label for='title-input'>Note title:</label>
            <input id='title-input' type='text' class='input shadow' placeholder="Note title">
            </div>
            <div class='flex-container'>
            <label for='body-input'>Note body:</label>
            <textarea id='body-input' class='input shadow' rows='5' cols='33' placeholder='Take a note . . .'></textarea>
            <div id='submit-container'>
                <button id='cancel-note' class='button-danger button-block shadow'>Discard</button>
                <button id='add-note-${use}' type="submit" class='button-success button-block shadow'>Submit note</button>
            </div>
            </div>
        </form>`

    displayContainer.insertAdjacentHTML('afterbegin', formHTML)

    query('#title-input').value = titleParam
    query('#body-input').value = bodyParam

    query('#cancel-note').addEventListener('click', removeForm)

    query(`#add-note-${use}`).addEventListener('click', function (event) {
        event.preventDefault()
        let noteObj = {}
        noteObj.body = query('#body-input').value.trim()
        noteObj.title = query('#title-input').value
        noteObj.date = moment().format()
        noteObj.pinned = false
        query('#note-list').innerHTML = ''
        removeForm()

        if (use == 'create') {
            postNote(noteObj)
                .then(getNotesJSON)
                .then(displayList)
        }
        if (use == 'edit') {
            noteObj.id = id
            patchNote(noteObj)
                .then(getNotesJSON)
                .then(displayList)
                .then(param => {query('#note-display').innerHTML=''})
        }
    })
}

function removeForm() {
    query('#take-note-form').remove()
}

