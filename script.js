const schedules = [];

const taskInput = document.getElementById("taskInput");
const taskTime = document.getElementById("taskTime");
const taskList = document.getElementById("taskList");

document
.getElementById("addTaskButton")
.addEventListener("click", () => {

    const task = taskInput.value;
    const time = taskTime.value;
    const date = document.getElementById("scheduleDate").value;

    if (!task || !date) {
        alert("Please select date and task");
        return;
    }

    schedules.push({
        date,
        task,
        time
    });

    displaySchedules(date);

    taskInput.value = "";
    taskTime.value = "";
});

document
.getElementById("viewScheduleBtn")
.addEventListener("click", () => {

    const selectedDate =
        document.getElementById("scheduleDate").value;

    displaySchedules(selectedDate);
});

function displaySchedules(date) {

    taskList.innerHTML = "";

    const filtered =
        schedules.filter(item =>
            item.date === date
        );

    document.getElementById(
        "selectedDateTitle"
    ).textContent =
    `Schedule for ${date}`;

    if(filtered.length === 0){
        taskList.innerHTML =
        "<li>No schedule for this date.</li>";
        return;
    }

    filtered.forEach(item => {

        const li =
        document.createElement("li");

        li.textContent =
        `${item.time} - ${item.task}`;

        taskList.appendChild(li);
    });
}

function renderTasksForDate() {

    const taskList =
        document.getElementById("taskList");

    taskList.innerHTML = "";

    const filteredTasks =
        tasksArray.filter(
            task => task.date === selectedDate
        );

    if(filteredTasks.length === 0){
        taskList.innerHTML =
        "<li>No academic schedule for this date.</li>";
        return;
    }

    filteredTasks.forEach((task,index) => {

        const li =
            document.createElement("li");

        li.className =
            task.completed ? "completed" : "";

        li.innerHTML = `
            ${task.text}
            <button class="btn delete-btn">
                Delete
            </button>
        `;

        li.querySelector("button")
        .addEventListener("click", () => {

            const taskIndex =
                tasksArray.findIndex(
                    t =>
                    t.text === task.text &&
                    t.date === selectedDate
                );

            if(taskIndex !== -1){
                tasksArray.splice(taskIndex,1);
            }
        });
    });
}