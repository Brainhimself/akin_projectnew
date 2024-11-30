document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        showSection('task-section');
        fetchTasks();
        document.getElementById('home').style.display = 'block';
        document.getElementById('logout').style.display = 'block';
    } else {
        showSection('login-section');
        document.getElementById('home').style.display = 'none';
        document.getElementById('logout').style.display = 'none';
    }
});

document.getElementById('show-register').addEventListener('click', () => {
    showSection('register-section');
});

document.getElementById('show-login').addEventListener('click', () => {
    showSection('login-section');
});

document.getElementById('register').addEventListener('click', async () => {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            alert('Registration successful');
            showSection('login-section');
        } else {
            const error = await response.json();
            alert(error.error);
        }
    } catch (error) {
        console.error('Error registering:', error);
    }
});

document.getElementById('login').addEventListener('click', async () => {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            alert('Login successful');
            showSection('task-section');
            fetchTasks();
            document.getElementById('home').style.display = 'block';
            document.getElementById('logout').style.display = 'block';
        } else {
            const error = await response.json();
            alert(error.error);
        }
    } catch (error) {
        console.error('Error logging in:', error);
    }
});

document.getElementById('create-task').addEventListener('click', async () => {
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const deadline = document.getElementById('deadline').value;
    const priority = document.getElementById('priority').value;
    const token = localStorage.getItem('token'); // Ensure token is stored correctly

    const task = { title, description, deadline, priority };

    try {
        const response = await fetch('/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(task)
        });

        if (response.ok) {
            const createdTask = await response.json();
            addTaskToDOM(createdTask);
            clearTaskForm();
        } else {
            const error = await response.json();
            alert(error.error);
        }
    } catch (error) {
        console.error('Error creating task:', error);
    }
});

document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('token');
    showSection('login-section');
    document.getElementById('home').style.display = 'none';
    document.getElementById('logout').style.display = 'none';
});

document.getElementById('home').addEventListener('click', () => {
    showSection('task-section');
});

function showSection(sectionId) {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('register-section').style.display = 'none';
    document.getElementById('task-section').style.display = 'none';
    document.getElementById(sectionId).style.display = 'block';
}

function addTaskToDOM(task) {
    const taskDiv = document.createElement('div');
    taskDiv.classList.add('task');

    const title = document.createElement('div');
    title.classList.add('title');
    title.textContent = task.title;

    const description = document.createElement('div');
    description.textContent = task.description;

    const deadline = document.createElement('div');
    deadline.textContent = `Deadline: ${new Date(task.deadline).toLocaleDateString()}`;

    const priority = document.createElement('div');
    priority.textContent = `Priority: ${task.priority}`;

    taskDiv.appendChild(title);
    taskDiv.appendChild(description);
    taskDiv.appendChild(deadline);
    taskDiv.appendChild(priority);

    document.getElementById('tasks').appendChild(taskDiv);
}

function clearTaskForm() {
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    document.getElementById('deadline').value = '';
    document.getElementById('priority').value = 'low';
}

async function fetchTasks() {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch('/tasks', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const tasks = await response.json();
        tasks.forEach(task => addTaskToDOM(task));
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
}
