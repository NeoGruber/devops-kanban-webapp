const API_URL = "http://193.31.28.29:3000/json-db/"

document.addEventListener('DOMContentLoaded', laodWebPage);

var columnAmount = 0;

async function laodWebPage() {
  await buildColumns();
}

async function buildColumns() {
  const collumnDataList = await fetch(API_URL)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Network response was not ok.');
    })
    .then(data => {return data})
    .catch(error => console.error('There was a problem with the fetch operation:', error));

    columnAmount = collumnDataList.length;

  console.log(collumnDataList);

  for (let i = 0; i < collumnDataList.length; i++) {
    collumnDataList.forEach(columnData => {
      if (parseInt(columnData.data.order) === i) 
      {
        buildColumn(columnData);
        buildCards(columnData);
      }
    });
  }
}

function buildCards(columnData) {
  columnData.data.tasks.forEach(task => {
    var column = document.getElementById(columnData.id);
    buildCard(column, columnData.id, task)
  });
}

async function createNewColumn()
{
  const newColumnName = prompt("Enter name for the new column:");
  const columnOrder = columnAmount
  columnAmount++;
  const newColumnBase = {
    name: newColumnName,
    order: columnOrder,
    tasks: ["fill in tasks!"]
  }

  const newColumnData = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newColumnBase)
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Network response was not ok.');
    })
    .then(data => {return data})
    .catch(error => console.error('There was a problem with the fetch operation:', error));

    buildColumn(newColumnData)
    buildCards(newColumnData)
}

function buildColumn(element) {
  let newColumnName = element.data.name;
  let newColumnId = element.id;
  var container = document.querySelector(".container");
  var newColumn = document.createElement("div");
  newColumn.className = "column";
  newColumn.id = newColumnId; 
  newColumn.setAttribute("ondrop", "drop(event, '" + newColumnId + "')");
  newColumn.setAttribute("ondragover", "allowDrop(event)");
  newColumn.innerHTML = '<h2 contenteditable="true" onblur="renameColumn(this, ' + newColumnId + ')">' + newColumnName + '</h2><button onclick="createNewCard(\'' + newColumnId + '\')" class="add-card-btn">Add New Card</button><button onclick="deleteColumn(\'' + newColumnId + '\')" class="delete-column-btn">X</button>';
  container.appendChild(newColumn)
}

function buildCard(column, columnId, cardName) {
  console.log("buildCard")
  var newCard = document.createElement("div");
  newCard.className = "card card-" + columnId;
  newCard.draggable = true;
  newCard.id = buildCardString(columnId, cardName);
  newCard.setAttribute("ondragstart", "drag(event)");
  newCard.innerHTML = '<span class="card-content">' + cardName + '</span><button class="delete-task-btn" onclick="deleteCard(\''+ columnId +'\',\''+ cardName +'\')">&#128465;</button>';
  column.insertBefore(newCard, column.lastChild);
}

function buildCardString(columnId, cardName) {
  return "task-" + columnId + "-" + cardName
}

async function createNewCard(columnId) {
  var column = document.getElementById(columnId);
  var newCardName = prompt("Enter name for the new card:");
  if (newCardName !== null && newCardName.trim() !== "") {
    buildCard(column, columnId, newCardName)

    const columnData = await getColumnDataByID(columnId);
    columnData.data.tasks.push(newCardName);

    updateColumnDataById(columnId, columnData);
  }
}

async function getColumnDataByID(columnId) {
  const columnData = await fetch(API_URL + columnId)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Network response was not ok.');
    })
    .then(data => {return data})
    .catch(error => console.error('There was a problem with the fetch operation:', error));

  return columnData
}

async function updateColumnDataById(columnId, columnData) {
  const updatedColumnData = await fetch(API_URL + columnId, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(columnData.data)
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Network response was not ok.');
    })
    .then(data => {return data})
    .catch(error => console.error('There was a problem with the fetch operation:', error));
}

async function deleteColumn(columnId) {
  const deleteResponse = await fetch(API_URL + columnId, {
    method: 'DELETE',
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Network response was not ok.');
    })
    .then(data => {return data})
    .catch(error => console.error('There was a problem with the fetch operation:', error));
  var column = document.getElementById(columnId);
  column.remove();
}

async function renameColumn(column, columnId) {
  var newName = column.innerText.trim();
  if (newName !== "") {
    const columnData = await getColumnDataByID(columnId.id);
    columnData.data.name = newName;
    await updateColumnDataById(columnId.id, columnData)
  }
}

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

async function drop(ev, targetColumn) {
  ev.preventDefault();
  var data = ev.dataTransfer.getData("text");

  var draggedElement = document.getElementById(data);
  await deleteOldCard(draggedElement)

  var targetColumnElement = document.getElementById(targetColumn);
  
  const newColumnId = targetColumnElement
  addCardToNewCollumn(draggedElement, newColumnId)
  targetColumnElement.appendChild(draggedElement);
  draggedElement.classList.remove("card-todo", "card-inProgress", "card-done");
  draggedElement.classList.add("card-" + targetColumn);
}

async function addCardToNewCollumn(draggedElement, newColumnId) {
  const parts = draggedElement.id.split('-');
  const cardName = parts[2];

  const columnData = await getColumnDataByID(newColumnId.id);
  columnData.data.tasks.push(cardName);

  updateColumnDataById(newColumnId.id, columnData);
}

async function deleteOldCard(draggedElement) {
  const parts = draggedElement.id.split('-');
  const oldCollumnId = parts[1];
  const cardName = parts[2];
  await deleteCard(oldCollumnId, cardName);
}

async function deleteCard(columnId, cardName) {
  const columnData = await getColumnDataByID(columnId)
  const index = columnData.data.tasks.findIndex((element) => element === cardName);
  columnData.data.tasks.splice(index, 1);
  
  const updatedColumnData = await fetch(API_URL + columnId, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(columnData.data)
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Network response was not ok.');
    })
    .then(data => {return data})
    .catch(error => console.error('There was a problem with the fetch operation:', error));

  const cardId = buildCardString(columnId, cardName);
  const card = document.getElementById(cardId); 
  card.remove();
}

function deleteTask(taskId) {
  var task = document.getElementById(taskId);
  task.remove();
}