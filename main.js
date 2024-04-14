function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev, targetColumn) {
  ev.preventDefault();
  var data = ev.dataTransfer.getData("text");
  var draggedElement = document.getElementById(data);
  var targetColumnElement = document.getElementById(targetColumn);
  targetColumnElement.appendChild(draggedElement);
}

function renameCard(cardId) {
  var card = document.getElementById(cardId);
  var newName = card.querySelector("span").innerText.trim();
  if (newName !== "") {
      card.querySelector("span").innerText = newName;
  }
}

function deleteCard(cardId) {
  var card = document.getElementById(cardId);
  if (confirm("Are you sure you want to delete this card?")) {
      card.parentNode.removeChild(card);
  }
}

function createCard(columnId) {
  var column = document.getElementById(columnId);
  var newCardName = prompt("Enter name for the new card:");
  if (newCardName !== null && newCardName.trim() !== "") {
      var newCard = document.createElement("div");
      newCard.className = "card";
      newCard.draggable = true;
      var newCardId = "task" + (column.children.length - 1);
      newCard.id = newCardId;
      newCard.setAttribute("ondragstart", "drag(event)");
      newCard.innerHTML = `<span contenteditable="true" onblur="renameCard('${newCardId}')">${newCardName}</span><button class="delete-btn" onclick="deleteCard('${newCardId}')">x</button>`;
      column.insertBefore(newCard, column.lastChild);
  }
}