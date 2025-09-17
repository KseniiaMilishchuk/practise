
const MAX_TODOS = 50;

const input = document.querySelector('#our-input');
const submitBtn = document.querySelector('#our-button');
const todoList = document.querySelector('.todo-list');
const clearBtn = document.querySelector('.clear-button');

let todos = [];

const todosLocalStorageController = {
    keyName: 'todos',

    prepareTodoToSave(todos) {
        return todos.map(todo => typeof todo === 'string' ? todo : todo.title || todo);
    },

    get todos() {
        const stringifiedTodos = localStorage.getItem(this.keyName);
        return stringifiedTodos ? JSON.parse(stringifiedTodos) : [];
    },

    set todos(todos) {
        localStorage.setItem(this.keyName, JSON.stringify(this.prepareTodoToSave(todos)));
    }
};

// створення li з кнопками
function createToDo (todo, index) {
    const li = document.createElement('li');
    li.classList.add('list-todo');
    li.textContent = todo.title || todo;

// кнопка видалення
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete-btn');
    deleteBtn.dataset.index = index;

    const deleteBtnImage = document.createElement('img');
    deleteBtnImage.classList.add('delete-btn-image');
    deleteBtnImage.src = './delete_icon.svg';
    deleteBtnImage.alt = 'Delete';

    deleteBtn.appendChild(deleteBtnImage);

// кнопка редагування
    const editBtn = document.createElement('button');
    editBtn.classList.add('edit-btn');
    editBtn.dataset.index = index;

    const editBtnImage = document.createElement('img');
    editBtnImage.classList.add('edit-btn-image');
    editBtnImage.src = './edit.svg';
    editBtnImage.alt = 'Edit';

    editBtn.appendChild(editBtnImage);
   
// контейнер для кнопок
    const todoIcons = document.createElement('div');
    todoIcons.classList.add('todo-icons');
    todoIcons.append(editBtn, deleteBtn);

    li.appendChild(todoIcons);
    return li;
}
// Рендер тудушок у DOM
function renderToDos (todos) { 

    todoList.innerHTML = '';
    const todosToRender = todos.map((todo, index) => createToDo(todo, index));
    todoList.append(...todosToRender);
}
    
// Отримання тудушок з API (тільки повертає масив рядків)
async function getTodos() {
    try {
        const response = await fetch ('https://mate.academy/students-api/todos');
        if (!response.ok) {
           throw new Error(`Error fetching tasks: ${response.status}`);
        }
        const responseTodos = await response.json();
        return responseTodos.map(todo => todo.title).slice(0, MAX_TODOS);
    
    } catch (error) {
        console.error('Error fetching tasks. Please try again later.', error);
        return []; // Повертаємо порожній масив у разі помилки
    } 
}

// Ініціалізація
async function init() {
    const fetchedTodos = await getTodos();
    //Це деструктуризація об’єкта.
    //todosLocalStorageController — об’єкт, який зберігає тудушки з localStorage
    const {todos: savedTodos } = todosLocalStorageController;
    
    todos = [...fetchedTodos, ...savedTodos].slice(0, MAX_TODOS);
    todosLocalStorageController.todos = todos;
    
    renderToDos(todos);
    
    // один делегований слухач на батьківському елементі <ul
    todoList.addEventListener('click', (event) => {
    
        const deleteBtn = event.target.closest('.delete-btn');
        if (deleteBtn) {
            const index = Number(deleteBtn.dataset.index); //data-index = '23' => 23
            todos.splice(index, 1);
            todosLocalStorageController.todos = todos;
            renderToDos(todos);
            return; // щоб не йшов далі
        }
    
        const editBtn = event.target.closest('.edit-btn');
        if (editBtn) {
            const index = Number(editBtn.dataset.index);
            const newText = prompt('Enter edit text', todos[index]);
            if (newText && newText.trim() !== '') {
                todos[index] = newText.trim();
                todosLocalStorageController.todos = todos;
                renderToDos(todos);
            }
        }
    });

    // Очистка всього списку через кнопку Clear Items
    clearBtn.addEventListener('click', () => {
        todos.length = 0;
        todosLocalStorageController.todos = todos;
        todoList.innerHTML = '';
    });
       
    
    submitBtn.addEventListener('click', () => {
        const newToDo = input.value.trim();
        if (newToDo === '') return;
    /* unshift додає новий туду на початок списку (push – в кінець масиву) */
        todos.unshift(newToDo);
        input.value = '';
        console.log('ToDo list: ', todos);
        todosLocalStorageController.todos = todos; //// зберігаємо зміни
        renderToDos(todos);
    });
}
init();