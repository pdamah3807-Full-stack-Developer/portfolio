// /* Academic Planner | planner.js (functionality only, no styling) */

document.addEventListener("DOMContentLoaded", () => {
    const monthYearDisplay = document.getElementById("monthYearDisplay");
    const calendarDays = document.getElementById("calendarDays");
    const selectedDateTitle = document.getElementById("selectedDateTitle");
    const scheduleDate = document.getElementById("scheduleDate");
    const activityCategory = document.getElementById("activityCategory");
    const taskInput = document.getElementById("taskInput");
    const addTaskButton = document.getElementById("addTaskButton");
    const taskList = document.getElementById("taskList");

    const STORAGE_KEY = "academicPlannerTasks";
    const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    let tasks = loadTasks();
    const today = new Date();
    let viewYear = today.getFullYear();
    let viewMonth = today.getMonth();
    let selectedDate = formatDate(today);

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
        return parseDate(str).toLocaleDateString("en-GB", {
            weekday: "long", day: "numeric", month: "long", year: "numeric"
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
            console.error("Could not save tasks:", error);
        }
    }

    // Calendar (plain table so it lays out in 7 columns without any CSS)
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

            const dateStr = formatDate(new Date(viewYear, viewMonth, day));
            const count = tasks[dateStr] ? tasks[dateStr].length : 0;

            let label = String(day);
            if (count > 0) label += " •";
            if (dateStr === selectedDate) label = `[${label}]`;

            const button = document.createElement("button");
            button.type = "button";
            button.textContent = label;
            button.title = (dateStr === todayStr ? "Today. " : "") +
                (count > 0 ? `${count} scheduled item(s)` : "No items");
            button.setAttribute("aria-pressed", dateStr === selectedDate ? "true" : "false");
            button.addEventListener("click", () => selectDate(dateStr));

            const td = document.createElement("td");
            td.appendChild(button);
            row.appendChild(td);
        }

        while (row.children.length < 7) {
            row.appendChild(document.createElement("td"));
        }
        table.appendChild(row);
        calendarDays.appendChild(table);
    }

    function selectDate(dateStr) {
        selectedDate = dateStr;
        scheduleDate.value = dateStr;
        const date = parseDate(dateStr);
        viewYear = date.getFullYear();
        viewMonth = date.getMonth();
        selectedDateTitle.textContent = prettyDate(dateStr);
        renderCalendar();
        renderTasks();
    }

    // Tasks
    function renderTasks() {
        taskList.innerHTML = "";
        const items = tasks[selectedDate] || [];

        if (items.length === 0) {
            const empty = document.createElement("li");
            empty.textContent = "No items scheduled for this date.";
            taskList.appendChild(empty);
            return;
        }

        items.forEach((task) => {
            const li = document.createElement("li");

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = task.done;
            checkbox.addEventListener("change", () => toggleTask(task.id));

            const text = document.createElement("span");
            text.textContent = ` ${task.category}: ${task.text} `;
            if (task.done) text.style.textDecoration = "line-through";

            const deleteBtn = document.createElement("button");
            deleteBtn.type = "button";
            deleteBtn.textContent = "Delete";
            deleteBtn.addEventListener("click", () => deleteTask(task.id));

            li.append(checkbox, text, deleteBtn);
            taskList.appendChild(li);
        });
    }

    function addTask() {
        const text = taskInput.value.trim();
        const date = scheduleDate.value || selectedDate;

        if (!date) {
            alert("Please select a date.");
            return;
        }
        if (!text) {
            alert("Please enter an activity description.");
            taskInput.focus();
            return;
        }

        if (!tasks[date]) tasks[date] = [];
        tasks[date].push({
            id: Date.now().toString(),
            category: activityCategory.value,
            text: text,
            done: false
        });

        saveTasks();
        taskInput.value = "";
        selectDate(date);
        taskInput.focus();
    }

    function toggleTask(id) {
        const task = (tasks[selectedDate] || []).find((t) => t.id === id);
        if (task) {
            task.done = !task.done;
            saveTasks();
            renderTasks();
        }
    }

    function deleteTask(id) {
        tasks[selectedDate] = (tasks[selectedDate] || []).filter((t) => t.id !== id);
        if (tasks[selectedDate].length === 0) delete tasks[selectedDate];
        saveTasks();
        renderCalendar();
        renderTasks();
    }

    addTaskButton.addEventListener("click", addTask);
    taskInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") addTask();
    });
    scheduleDate.addEventListener("change", () => {
        if (scheduleDate.value) selectDate(scheduleDate.value);
    });

    selectDate(selectedDate);
});