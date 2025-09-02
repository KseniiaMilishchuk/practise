
const MAX_TODOS = 50;
// отримуємо з localStorage збережений рядок. якщо це був масив то його потрібно розпарсити. 
// якщо в сховищі пусто ще нічого не зберігалося тоді створюємо новий масив.
let todos = JSON.parse(localStorage.getItem('todos')) || [];

const input = document.querySelector('#our-input');
const submitBtn = document.querySelector('#our-button');
const list = document.querySelector('.todo-list');

// функція збереження списку todos у localStorage
function saveToLocalStorage () {
    try {
        const todosToSave = todos
            .slice(0, MAX_TODOS)
            .map(todo => typeof todo === 'string' ? todo : todo.title || todo);
        localStorage.setItem('todos', JSON.stringify(todosToSave));
    } catch (error) {
        console.error('Cannot save todos, localStorage quota exceeded', error);
    }
    // якщо потрібно зберегти в сховище масив або обєкт тоді ми його 
    // перетворюємо на рядок (JSON.stringify(todos))
}
submitBtn.addEventListener('click', () => {
    const newToDo = input.value.trim();
    if (newToDo === '') return;
/* unshift додає новий туду на початок списку (push – в кінець масиву) */
    todos.unshift(newToDo);
    input.value = '';
    console.log('ToDo list: ', todos);
    saveToLocalStorage(); 
    // викликаємо функцію рядок 10. (зберігаємо після додавання)
    renderToDos(todos);
});

function createToDo (todo, index) {
    const li = document.createElement('li');
    li.classList.add('list-todo');
    li.textContent = todo.title || todo;

    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete-button');

    const deleteBtnImage = document.createElement('img');
    deleteBtnImage.classList.add('delete-btn-image');
    deleteBtnImage.src = './delete_icon.svg';
    deleteBtnImage.alt = 'Delete';
    // deleteBtnImage.style.width = '40px';

    deleteBtn.appendChild(deleteBtnImage)
    li.appendChild(deleteBtn);

    deleteBtn.addEventListener('click', () => {
        todos.splice(index, 1);
        saveToLocalStorage();
        renderToDos(todos);
    });


    const editBtn = document.createElement('button');
    editBtn.classList.add('edit-button');

    const editBtnImage = document.createElement('img');
    editBtnImage.classList.add('edit-btn-image');
    editBtnImage.src = './edit.svg';
    editBtnImage.alt = 'Edit';

    editBtn.appendChild(editBtnImage);
    li.appendChild(editBtn);


    editBtn.addEventListener('click', () => {
        const newText = prompt('Enter edit text:', todo);
        if (newText && newText.trim() !== '') {
            todos[index] = newText.trim();
            saveToLocalStorage();
            renderToDos(todos);
        }
    });

    const todo_icons = document.createElement('div');
    todo_icons.classList.add('todo-icons');
    todo_icons.append(editBtn, deleteBtn);
    li.appendChild(todo_icons);
    return li;
}
function renderToDos (todosToRender) { 
    // перед додавання в список новий пункт видаляємо весь попередній список і 
    // показується список з доданим елементом (очищуємо перед рендером)
    list.innerHTML = '';

    for (let i = 0; i < todosToRender.length; i++) {
        const todo = todosToRender[i];
        const li = createToDo(todo, i);
        list.appendChild(li);
    }
}
    // Очистка всього списку через кнопку Clear Items
    const clearBtn = document.querySelector('.clear-button');
    clearBtn.addEventListener('click', () => {
        todos.length = 0;
        list.innerHTML = '';
        saveToLocalStorage();
        // зберігаємо порожній масив
    });
    renderToDos(todos);


async function getTodos() {
    try {
        const response = await fetch ('https://mate.academy/students-api/todos');
        if (!response.ok) {
           throw new Error(`Error fetching tasks: ${response.status}`);
        }
        const responseTodos = await response.json();
        /* responseTodos – масив тудушок, який отримала з API.
        todos – масив тудушок, що вже є у localStorage.
        [...responseTodos, ...todos] створює новий масив, де спочатку стоять 
        задачі з API, а потім локальні задачі. */
        const apiTodos = responseTodos.map(todo => todo.title).slice(0, MAX_TODOS);
        todos = [...apiTodos, ...todos].slice(0, MAX_TODOS);
        saveToLocalStorage();
        renderToDos(todos);
    } catch (error) {
        console.error('Error fetching tasks. Please try again later.', error);
    } 
}
getTodos();