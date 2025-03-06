// DOM Elements
const loginContainer = document.getElementById('login-container');
const appContainer = document.getElementById('app-container');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const addTaskBtn = document.getElementById('add-task-btn');
const taskModal = document.getElementById('task-modal');
const closeModal = document.querySelector('.close-modal');
const taskForm = document.getElementById('task-form');
const cancelTaskBtn = document.getElementById('cancel-task-btn');
const tasksContainer = document.getElementById('tasks-container');
const categoryList = document.getElementById('category-list');
const addCategoryBtn = document.getElementById('add-category-btn');
const newCategoryInput = document.getElementById('new-category');
const priorityFilter = document.getElementById('priority-filter');
const statusFilter = document.getElementById('status-filter');
const taskCategorySelect = document.getElementById('task-category');
const pendingCountEl = document.getElementById('pending-count');
const completedCountEl = document.getElementById('completed-count');
const totalCountEl = document.getElementById('total-count');

// State
let tasks = JSON.parse(localStorage.getItem('tasks')) || [
  {
    id: '1',
    title: 'Complete project proposal',
    description: 'Finish the draft and send it to the team for review',
    category: 'work',
    priority: 'high',
    dueDate: '2025-06-15',
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Buy groceries',
    description: 'Milk, eggs, bread, and vegetables',
    category: 'personal',
    priority: 'medium',
    dueDate: '2025-06-10',
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Schedule dentist appointment',
    description: 'Call Dr. Smith for a check-up',
    category: 'health',
    priority: 'low',
    dueDate: '2025-06-20',
    completed: true,
    createdAt: new Date().toISOString()
  }
];

let categories = JSON.parse(localStorage.getItem('categories')) || ['work', 'personal', 'health', 'education'];
let currentFilter = {
  category: 'all',
  priority: 'all',
  status: 'all'
};
let editingTaskId = null;

// Initialize App
function init() {
  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  
  if (isLoggedIn) {
    showApp();
  } else {
    showLogin();
  }
  
  // Update categories in task form
  updateCategoryOptions();
  
  // Render tasks
  renderTasks();
  
  // Update task counts
  updateTaskCounts();
}

// Event Listeners
loginForm.addEventListener('submit', handleLogin);
logoutBtn.addEventListener('click', handleLogout);
addTaskBtn.addEventListener('click', openAddTaskModal);
closeModal.addEventListener('click', closeTaskModal);
cancelTaskBtn.addEventListener('click', closeTaskModal);
taskForm.addEventListener('submit', handleTaskFormSubmit);
addCategoryBtn.addEventListener('click', handleAddCategory);

// Category filter
categoryList.addEventListener('click', (e) => {
  if (e.target.tagName === 'LI') {
    const category = e.target.dataset.category;
    setActiveCategory(category);
    currentFilter.category = category;
    renderTasks();
  }
});

// Priority filter
priorityFilter.addEventListener('change', (e) => {
  currentFilter.priority = e.target.value;
  renderTasks();
});

// Status filter
statusFilter.addEventListener('change', (e) => {
  currentFilter.status = e.target.value;
  renderTasks();
});

// Functions
function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const remember = document.getElementById('remember').checked;
  
  // Simple validation - in a real app, you would check against a database
  if (username && password) {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('username', username);
    showApp();
  }
}

function handleLogout() {
  localStorage.removeItem('isLoggedIn');
  showLogin();
}

function showLogin() {
  loginContainer.style.display = 'flex';
  appContainer.style.display = 'none';
}

function showApp() {
  loginContainer.style.display = 'none';
  appContainer.style.display = 'block';
}

function openAddTaskModal() {
  editingTaskId = null;
  document.getElementById('modal-title').textContent = 'Add New Task';
  document.getElementById('task-id').value = '';
  taskForm.reset();
  
  // Set default due date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById('task-due-date').value = formatDateForInput(tomorrow);
  
  taskModal.style.display = 'flex';
}

function openEditTaskModal(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;
  
  editingTaskId = taskId;
  document.getElementById('modal-title').textContent = 'Edit Task';
  document.getElementById('task-id').value = task.id;
  document.getElementById('task-title').value = task.title;
  document.getElementById('task-description').value = task.description;
  document.getElementById('task-category').value = task.category;
  document.getElementById('task-priority').value = task.priority;
  document.getElementById('task-due-date').value = formatDateForInput(new Date(task.dueDate));
  
  taskModal.style.display = 'flex';
}

function closeTaskModal() {
  taskModal.style.display = 'none';
  taskForm.reset();
  editingTaskId = null;
}

function handleTaskFormSubmit(e) {
  e.preventDefault();
  
  const taskData = {
    title: document.getElementById('task-title').value,
    description: document.getElementById('task-description').value,
    category: document.getElementById('task-category').value,
    priority: document.getElementById('task-priority').value,
    dueDate: document.getElementById('task-due-date').value,
    completed: false
  };
  
  if (editingTaskId) {
    // Update existing task
    updateTask(editingTaskId, taskData);
  } else {
    // Add new task
    addTask(taskData);
  }
  
  closeTaskModal();
  renderTasks();
  updateTaskCounts();
}

function addTask(taskData) {
  const newTask = {
    ...taskData,
    id: Date.now().toString(),
    completed: false,
    createdAt: new Date().toISOString()
  };
  
  tasks.unshift(newTask);
  saveTasks();
}

function updateTask(taskId, updatedData) {
  tasks = tasks.map(task => 
    task.id === taskId ? { ...task, ...updatedData } : task
  );
  saveTasks();
}

function deleteTask(taskId) {
  if (confirm('Are you sure you want to delete this task?')) {
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasks();
    renderTasks();
    updateTaskCounts();
  }
}

function toggleTaskCompletion(taskId) {
  tasks = tasks.map(task => 
    task.id === taskId ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks();
  updateTaskCounts();
}

function handleAddCategory() {
  const categoryName = newCategoryInput.value.trim().toLowerCase();
  
  if (categoryName && !categories.includes(categoryName)) {
    categories.push(categoryName);
    saveCategories();
    renderCategories();
    updateCategoryOptions();
    newCategoryInput.value = '';
  }
}

function renderTasks() {
  const filteredTasks = tasks.filter(task => {
    const categoryMatch = currentFilter.category === 'all' || task.category === currentFilter.category;
    const priorityMatch = currentFilter.priority === 'all' || task.priority === currentFilter.priority;
    const statusMatch = currentFilter.status === 'all' || 
      (currentFilter.status === 'completed' && task.completed) || 
      (currentFilter.status === 'pending' && !task.completed);
    
    return categoryMatch && priorityMatch && statusMatch;
  });
  
  tasksContainer.innerHTML = '';
  
  if (filteredTasks.length === 0) {
    tasksContainer.innerHTML = `
      <div class="empty-state">
        <p>No tasks found. Add a new task to get started!</p>
      </div>
    `;
    return;
  }
  
  filteredTasks.forEach(task => {
    const taskCard = document.createElement('div');
    taskCard.className = `task-card ${task.priority} ${task.completed ? 'completed' : ''}`;
    
    taskCard.innerHTML = `
      <div class="task-content">
        <div class="task-header">
          <label class="task-checkbox">
            <input type="checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
            <span class="checkmark"></span>
          </label>
          <h3 class="task-title">${task.title}</h3>
          <span class="task-category">${task.category}</span>
        </div>
        <p class="task-description">${task.description}</p>
        <div class="task-meta">
          <div class="task-due-date">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            ${formatDate(new Date(task.dueDate))}
          </div>
          <div class="task-priority ${task.priority}">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </div>
        </div>
      </div>
      <div class="task-actions">
        <button class="task-action-btn edit" data-id="${task.id}">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        </button>
        <button class="task-action-btn delete" data-id="${task.id}">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        </button>
      </div>
    `;
    
    tasksContainer.appendChild(taskCard);
    
    // Add event listeners to the task card
    const checkbox = taskCard.querySelector('.task-checkbox input');
    checkbox.addEventListener('change', () => {
      toggleTaskCompletion(task.id);
    });
    
    const editBtn = taskCard.querySelector('.task-action-btn.edit');
    editBtn.addEventListener('click', () => {
      openEditTaskModal(task.id);
    });
    
    const deleteBtn = taskCard.querySelector('.task-action-btn.delete');
    deleteBtn.addEventListener('click', () => {
      deleteTask(task.id);
    });
  });
}

function renderCategories() {
  categoryList.innerHTML = `<li data-category="all" class="${currentFilter.category === 'all' ? 'active' : ''}">All Tasks</li>`;
  
  categories.forEach(category => {
    const li = document.createElement('li');
    li.textContent = category.charAt(0).toUpperCase() + category.slice(1);
    li.dataset.category = category;
    if (currentFilter.category === category) {
      li.classList.add('active');
    }
    categoryList.appendChild(li);
  });
}

function updateCategoryOptions() {
  taskCategorySelect.innerHTML = '';
  
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
    taskCategorySelect.appendChild(option);
  });
}

function setActiveCategory(category) {
  const items = categoryList.querySelectorAll('li');
  items.forEach(item => {
    if (item.dataset.category === category) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

function updateTaskCounts() {
  const pendingCount = tasks.filter(task => !task.completed).length;
  const completedCount = tasks.filter(task => task.completed).length;
  const totalCount = tasks.length;
  
  pendingCountEl.textContent = pendingCount;
  completedCountEl.textContent = completedCount;
  totalCountEl.textContent = totalCount;
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function saveCategories() {
  localStorage.setItem('categories', JSON.stringify(categories));
}

function formatDate(date) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

function formatDateForInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  init();
  renderCategories();
});
