document.addEventListener('DOMContentLoaded', () => {
  // Define Global Variables
  const form = document.getElementById('registrar');
  const input = form.querySelector('input');
  const mainDiv = document.querySelector('.main');
  const ul = document.getElementById('invitedList');
  const div = document.createElement('div');
  const filterLabel = document.createElement('label');
  const filterCheckbox = document.createElement('input');

  // ---------------
  // Filter Checkbox
  filterLabel.textContent = "Hide those who haven't responded";
  filterCheckbox.type = 'checkbox';
  filterCheckbox.className = 'filter';
  div.appendChild(filterLabel);
  div.appendChild(filterCheckbox);
  mainDiv.insertBefore(div, ul);
  
  // If checkbox is changed (checked)
  filterCheckbox.addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    const lis = ul.children;
    if (isChecked) {
      // If checked, hide all invitees without the 'responded' class
      for (let i = 0; i < lis.length; i++) {
        let li = lis[i];
        if (li.className === 'responded') {
          li.style.display = '';
          li.querySelector('label').style.display = 'none';
        } else {
          li.style.display = 'none';
        }
      }
    } else {
      // If unchecked, show all invitees
      for (let i = 0; i < lis.length; i++) {
        let li = lis[i];
        li.style.display = '';
        li.querySelector('label').style.display = '';
      }
    }
    saveList();
  });

  // -------------------------------------------
  // Load Saved List/Variables from LocalStorage
  function loadList() {
    const savedList = localStorage.getItem('inviteeList');
    const filter = localStorage.getItem('filter');
    if (savedList) {
      const checkboxArray = JSON.parse(localStorage.getItem('checkboxes'));
      const textAreaArray = JSON.parse(localStorage.getItem('textAreaMessages'));
      ul.innerHTML = savedList;
      document.querySelector('.filter').checked = JSON.parse(filter);
      for (let i = 0; i < ul.children.length; i++) {
        const li = ul.children[i];
        if (checkboxArray) {
          const checkboxStatus = li.querySelector('input[type="checkbox"]');
          checkboxStatus.checked = checkboxArray[i];
        }
        if (textAreaArray){
          const textAreaMessage = li.querySelector('textarea');
          textAreaMessage.value = textAreaArray[i];
        }
      }
    }
  }
  loadList();

  // -----------------------------------
  // Save List/Variables to LocalStorage
  function saveList() {
    // Save Entire List & its HTML
    localStorage.setItem('inviteeList', ul.innerHTML);
    // Save whether filter has been checked
    localStorage.setItem('filter', document.querySelector('.filter').checked);
    let checkboxArray = [];
    let textAreaArray = [];
    for (let i = 0; i < ul.children.length; i++) {
      const li = ul.children[i];
      // Save the Status of each individual Checkbox
      // Checkbox state is not saved in the List HTML
      const checkboxStatus = li.querySelector('input[type="checkbox"]');
      checkboxArray.push(checkboxStatus.checked);
      localStorage.setItem('checkboxes', JSON.stringify(checkboxArray));
      // Save contents of Text Area
      // Text area contents are not saved in the List HTML
      const textAreaMessage = li.querySelector('textarea');
      textAreaArray.push(textAreaMessage.value);
      localStorage.setItem('textAreaMessages', JSON.stringify(textAreaArray));
    }
  }
  
  // --------------
  // "Invitee Card" (list object)
  function createLI(text) {
    // Create a new element with the provided parameters
    function createElement(elementName, property, value) {
      const element = document.createElement(elementName);
      element[property] = value;
      return element;
    }
    // Append new element to the invitee card (list object)
    function appendToLI(elementName, property, value) {
      const element = createElement(elementName, property, value);
      li.appendChild(element);
      return element;
    }
    // Create the Invitee Card's main List Element
    const li = document.createElement('li');
    // Create the Invitee Card's details
    appendToLI('span', 'textContent', text);
    appendToLI('label', 'textContent', 'Confirm')
      .appendChild(createElement('input', 'type', 'checkbox'));
    appendToLI('textarea', 'placeholder', 'Notes...');
    appendToLI('button', 'textContent', 'edit');
    appendToLI('button', 'textContent', 'remove');

    return li;
  }

  // ----------------------
  // Duplicate Text & Alert
  // Check if the given text is duplicated among the invitee list
  function checkForDuplicate(text) {
    const listNames = ul.children;
    let nameDuplicate = false;
    // Loop through all invitee lists
    for (let i = 0; i < listNames.length; i++) {
      let listName = listNames[i].firstChild;
      // Avoid checking any INPUT fields by filtering SPAN elements only
      if (listName.tagName === 'SPAN') {
        if ( listName.textContent.toLowerCase() === text.toLowerCase()) {
          nameDuplicate = true;
          alert("Duplicate name detected");
        }
      }
    }
    return nameDuplicate;
  }

  // -------------------
  // Blank field & Alert
  function fieldIsBlank(text) {
    if (text === '') {
      alert("Field cannot be blank");
      return true;
    } else {
      return false;
    }
  }

  // -----------
  // Form Submit
  form.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent page from reloading on submission
    const text = input.value;
    if (!fieldIsBlank(text)) {
      input.value = '';
      if (!checkForDuplicate(text)) {
        const li = createLI(text);
        ul.appendChild(li);
      }
    }
    saveList();
  });
  
  // ---------------------
  // Confirmation Checkbox
  ul.addEventListener('change', (e) => {
    const checkbox = e.target;
    const checked = checkbox.checked;
    const listItem = checkbox.parentNode.parentNode;
    const label = checkbox.parentNode;
    
    if (checked) {
      listItem.className = 'responded'; 
      label.childNodes[0].nodeValue = 'Confirmed';
    } else {
      listItem.className = '';
      label.childNodes[0].nodeValue = 'Confirm';
    }
    saveList();
  });

  // --------------------
  // Invitee Card Buttons
  // Button click listener for EDITING, SAVING & REMOVING Invitees
  ul.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      const button = e.target;
      const li = button.parentNode;
      const ul = li.parentNode;
      const action = button.textContent;
      const nameActions = {
        // REMOVE Invitee Card Completely
        remove: () => {
          ul.removeChild(li); 
        },
        // EDIT Invitee Name
        edit: () => {
          const span = li.firstElementChild;
          const input = document.createElement('input');
          input.type = 'text';
          input.value = span.textContent;
          li.insertBefore(input, span);
          li.removeChild(span);
          button.textContent = 'save';
        },
        // SAVE Changes to Invitee Name
        save: () => {
          const input = li.firstElementChild;
          if (!checkForDuplicate(input.value)) {
            const span = document.createElement('span');
            span.textContent = input.value;
            li.insertBefore(span, input);
            li.removeChild(input);
            button.textContent = 'edit';
          }
        } 
      };
      // select and run action in button's name
      nameActions[action]();
      saveList();
    }
  });
});