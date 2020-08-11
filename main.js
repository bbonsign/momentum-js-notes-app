// ============= Initial page setup and Listeners ===============

getNotesJSON().then(displayList)

query('#new-note').addEventListener('click', (e) => createForm(e, '', '', 'create'))

query('#display-container').addEventListener('click', controlButtons)

// ================= Requests ====================

async function getNotesJSON() {
  let results = await fetch('http://localhost:3000/notes/', {method: 'GET'})
  return results.json()
}

async function postNote(noteObj) {
  let response = await fetch('http://localhost:3000/notes/', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify(noteObj)
  })
  console.log(`Posted note responded with status: ${response.status}`)
}

async function patchNote(noteObj) {
  let response = await fetch(`http://localhost:3000/notes/${noteObj.id}`, {
    method: 'PATCH',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify(noteObj)
  })
  console.log(`Patched note responded with status: ${response.status}`)
}

// id should the id assigned to the note on the server
async function deleteRequest(id) {
  id = String(id)
  let response = await fetch(`http://localhost:3000/notes/${id}`, {method: 'DELETE'})
  console.log(`DELETE request responded with status: ${response.status}`)
}

// ====================== Functions ============================
function displayList(noteJSON) {
  const listContainer = query('#note-list')
  noteJSON.reverse().map(obj => listContainer.appendChild(createListElem(obj)))
}

function query(selector) {
  return document.querySelector(selector)
}

function createElement(type, classList) {
  const element = document.createElement(type)
  element.classList.add(...classList)
  return element
}

function createTextElem(type, text, classList) {
  const elem = createElement(type, classList)
  elem.textContent = text
  return elem
}

function setNoteDataAttr(element, noteObj) {
  element.setAttribute('data-id', noteObj.id)
  element.setAttribute('data-title', noteObj.title)
  element.setAttribute('data-body', noteObj.body)
  element.setAttribute('data-pinned', noteObj.pinned)
  element.setAttribute('data-date', noteObj.date)
  return element
}

function createListElem(noteObj) {
  const container = createElement('div', ['note-list'])
  container.id = 'note' + String(noteObj.id)
  setNoteDataAttr(container, noteObj)
  const titleElem = createTextElem('p', noteObj.title, ['title'])
  container.appendChild(titleElem)
  const dateElem = createTextElem('p', `Last edited: ${moment(noteObj.date).format('MMM Do, YYYY, h:mm a')}`, ['date'])
  container.appendChild(dateElem)

  container.addEventListener('click', function (event) {
    const noteListTile = event.target.closest('.note-list')
    if (noteListTile.matches('.selected')) {
      const note = query(`#display${noteListTile.dataset.id}`)
      closeNote(note)
    } else {
      (
        displayNote(event)
      )
    }
  })
  return container
}

function createNoteElem(noteObj) {
  const container = createElement('div', ['note', 'shadow'])
  container.id = 'display' + String(noteObj.id)
  setNoteDataAttr(container, noteObj)
  const titleContainer = createElement('div', ['title-div'])
  titleContainer.appendChild(createTextElem('p', noteObj.title, ['title']))
  titleContainer.appendChild(createNoteControlElems())
  container.appendChild(titleContainer)
  const elements = noteObj.body.split('\n').map(par => createTextElem('p', par, ['note-par']))
  elements.map(elem => {container.appendChild(elem)})
  container.appendChild(createTextElem('p', `Last edited: ${moment(noteObj.date).format('MMM Do, YYYY, h:mm a')}`, ['date']))
  return container
}
'Last edit: ' + moment().format()
function createNoteControlElems() {
  const container = createElement('div', ['controls'])
  const pinButton = createElement('button', ['pin', 'to-top', 'button-sm'])
  const editButton = createElement('button', ['edit', 'edt', 'button-sm'])
  const trashButton = createElement('button', ['trash', 'delete', 'button-sm'])
  const closeButton = createElement('button', ['close', 'cls', 'button-sm'])
  pinButton.innerHTML = "<i class='material-icons md-18 to-top'>arrow_upward</i>"
  editButton.innerHTML = "<i class='material-icons md-18 edt'>edit</i>"
  trashButton.innerHTML = "<i class='material-icons md-18 delete'>delete</i>"
  closeButton.innerHTML = "<i class='material-icons cls'>close</i>"
  pinButton.title = 'Pin to top'
  editButton.title = 'Edit note'
  trashButton.title = 'Delete note'
  closeButton.title = 'Close note'
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
  } else {
    pinned = true
    noteElem.classList.add('pinned')
  }
  return fetch(`http://localhost:3000/notes/${noteElem.dataset.id}`,
    {
      method: 'PATCH',
      headers: {'Content-type': 'application/json'},
      body: JSON.stringify({pinned: pinned})
    })
    .then(response => {console.log(`PATCH request responded with status: ${response.status}`)})
}

function pinNote(event) {
  // ----------------- todo -----------------------
}

function populateNoteObj(id, title, body, pinned, date) {
  return noteObj = {id, title, body, pinned, date}
}

function displayNote(event) {
  const note = event.target.closest('.note-list')
  if (note.matches('.selected')) {
    return
  }
  note.classList.add('selected')
  const noteObj = populateNoteObj(note.dataset.id, note.dataset.title, note.dataset.body, note.dataset.pinned, note.dataset.date)
  query('#note-display').insertAdjacentElement('afterbegin', createNoteElem(noteObj))
}

function closeNote(noteElem) {
  const id = noteElem.dataset.id
  query(`#note${id}`).classList.remove('selected')
  noteElem.remove()
}

function deleteNote(noteElem) {
  const yn = prompt('Delete (y) or cancel (n)?')
  if (yn === 'y') {
    deleteRequest(noteElem.dataset.id)
    noteElem.remove()
    const id = noteElem.dataset.id
    query(`#note${id}`).remove()
  }
}

function editNote(note) {
  const body = note.dataset.body
  const title = note.dataset.title
  createForm(note.dataset.id, title, body, 'edit')
}

function controlButtons(event) {
  if (event.target.closest('.note')) {
    note = event.target.closest('.note')
    id = note.id
  }
  if (event.target.matches('.delete')) {
    deleteNote(note)
  } else if (event.target.matches('.to-top')) {
    pinNote(event)
  } else if (event.target.matches('.edt')) {
    editNote(note)
  } else if (event.target.matches('.cls')) {
    closeNote(note)
  }
}

// use = "create" or "edit" to indicate whether to POST or PATCH
function createForm(id, titleParam = '', bodyParam = '', use) {
  const displayContainer = query('#display-container')
  for (const child of displayContainer.children) {
    if (child.id == 'take-note-form') {
      child.remove()
    }
  }

  const formHTML = `<form id='take-note-form'>
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
    const noteObj = {}
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
        .then(param => {query('#note-display').innerHTML = ''})
    }
  })
}

function removeForm() {
  query('#take-note-form').remove()
}
