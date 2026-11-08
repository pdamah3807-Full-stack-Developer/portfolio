// Academic Planner | planner.js
const STORAGE_KEY = "academicPlannerTasks";
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

let tasks = loadTasks();
const today = new Date();
let viewYear = today.getFullYear();
let viewMonth = today.getMonth();
let selectedDate = formatDate(today);

// DOM Elements
const monthYearDisplay = document.getElementById("monthYearDisplay");
const calendarDays = document.getElementById("calendarDays");
const selectedDateTitle = document.getElementById("selectedDateTitle");
const scheduleDateInput = document.getElementById("scheduleDate");
const scheduleTimeInput = document.getElementById("scheduleTime");
const activityCategorySelect = document.getElementById("activityCategory");
const taskInput = document.getElementById("taskInput");
const addTaskButton = document.getElementById("addTaskButton");
const taskList = document.getElementById("taskList");
const listHeading = document.getElementById("listHeading");

// Initialize Application
function init() {
    scheduleDateInput.value = selectedDate;
    updateSelectedDateDisplay(selectedDate);
    renderCalendar();
    renderTasks();

    addTaskButton.addEventListener("click", handleAddSchedule);
    scheduleDateInput.addEventListener("change", (e) => {
        selectedDate = e.target.value;
        updateSelectedDateDisplay(selectedDate);
        renderTasks();
    });
}

function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function parseDate(str) {
    const [y, m, d] = str.split("-").map(Number);
    return new Date(y, m - 1, d);
}

function prettyDate(str) {
    if (!str) return "Select a Date";
    return parseDate(str).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

function loadTasks() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (error) {
        return {};
    }
}

function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
        console.error("Could not save schedules:", error);
    }
}

function updateSelectedDateDisplay(dateStr) {
    selectedDateTitle.textContent = prettyDate(dateStr);
    listHeading.textContent = `Scheduled Items for ${prettyDate(dateStr)}`;
}

// Calendar Generation
function renderCalendar() {
    monthYearDisplay.textContent = `${MONTH_NAMES[viewMonth]} ${viewYear}`;
    calendarDays.innerHTML = "";

    const table = document.createElement("table");
    const headRow = document.createElement("tr");
    
    DAY_NAMES.forEach((name) => {
        const th = document.createElement("th");
        th.textContent = name;
        headRow.appendChild(th);
    });
    table.appendChild(headRow);

    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
    const todayStr = formatDate(today);

    let row = document.createElement("tr");

    for (let i = 0; i < firstDayIndex; i++) {
        row.appendChild(document.createElement("td"));
    }

    for (let day = 1; day <= totalDays; day++) {
        if (row.children.length === 7) {
            table.appendChild(row);
            row = document.createElement("tr");
        }

        const td = document.createElement("td");
        const mStr = String(viewMonth + 1).padStart(2, "0");
        const dStr = String(day).padStart(2, "0");
        const currentCellDate = `${viewYear}-${mStr}-${dStr}`;

        td.textContent = day;

        if (currentCellDate === todayStr) {
            td.classList.add("today");
        }

        if (currentCellDate === selectedDate) {
            td.classList.add("selected");
        }

        // Indicator dot if schedules exist on this date
        if (tasks[currentCellDate] && tasks[currentCellDate].length > 0) {
            const dot = document.createElement("span");
            dot.className = "schedule-dot";
            td.appendChild(dot);
        }

        td.addEventListener("click", () => {
            selectedDate = currentCellDate;
            scheduleDateInput.value = selectedDate;
            updateSelectedDateDisplay(selectedDate);
            renderCalendar();
            renderTasks();
        });

        row.appendChild(td);
    }

    // Fill remaining cells in the final row
    while (row.children.length < 7 && row.children.length > 0) {
        row.appendChild(document.createElement("td"));
    }
    table.appendChild(row);

    calendarDays.appendChild(table);
}

// Add Schedule Handler
function handleAddSchedule() {
    const dateVal = scheduleDateInput.value;
    const timeVal = scheduleTimeInput.value || "All Day";
    const categoryVal = activityCategorySelect.value;
    const descVal = taskInput.value.trim();

    if (!dateVal) {
        alert("Please select a date for the schedule.");
        return;
    }

    if (!descVal) {
        alert("Please enter an activity description.");
        return;
    }

    const newSchedule = {
        id: "_" + Math.random().toString(36).substr(2, 9),
        time: timeVal,
        category: categoryVal,
        description: descVal
    };

    if (!tasks[dateVal]) {
        tasks[dateVal] = [];
    }

    tasks[dateVal].push(newSchedule);
    saveTasks();

    // Reset inputs
    taskInput.value = "";
    scheduleTimeInput.value = "";

    selectedDate = dateVal;
    updateSelectedDateDisplay(selectedDate);
    renderCalendar();
    renderTasks();
}

// Delete Schedule Handler
window.deleteSchedule = function(id) {
    if (!tasks[selectedDate]) return;

    tasks[selectedDate] = tasks[selectedDate].filter(item => item.id !== id);

    if (tasks[selectedDate].length === 0) {
        delete tasks[selectedDate];
    }

    saveTasks();
    renderCalendar();
    renderTasks();
};

// Render Task / Schedule List with All Details
function renderTasks() {
    taskList.innerHTML = "";
    const schedulesForDate = tasks[selectedDate] || [];

    if (schedulesForDate.length === 0) {
        taskList.innerHTML = `<li class="empty-message">No schedules recorded for this date.</li>`;
        return;
    }

    schedulesForDate.forEach(item => {
        const li = document.createElement("li");
        li.className = "task-item";

        // Generate badge class compatible with category styling
        const categoryClass = item.category.toLowerCase().replace(/\s+/g, '-');

        li.innerHTML = `
            <div class="task-info">
                <div class="task-meta">
                    <span class="task-time"><i class="fa-regular fa-clock"></i> ${item.time}</span>
                    <span class="badge ${categoryClass}">${item.category}</span>
                </div>
                <p class="task-desc">${item.description}</p>
            </div>
            <button onclick="deleteSchedule('${item.id}')" class="delete-btn" title="Delete Schedule">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;

        taskList.appendChild(li);
    });
}

// Run init on DOM load
document.addEventListener("DOMContentLoaded", init);
