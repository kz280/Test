let currentDate = new Date();
let schedules = [];

function loadSchedules() {
    const saved = localStorage.getItem('schedules');
    if (saved) {
        schedules = JSON.parse(saved);
    }
}

function saveSchedules() {
    localStorage.setItem('schedules', JSON.stringify(schedules));
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', 
                        '7月', '8月', '9月', '10月', '11月', '12月'];
    document.getElementById('currentMonth').textContent = `${year}年 ${monthNames[month]}`;
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);
    
    const firstDayOfWeek = firstDay.getDay();
    const lastDate = lastDay.getDate();
    const prevLastDate = prevLastDay.getDate();
    
    const calendarDays = document.getElementById('calendarDays');
    calendarDays.innerHTML = '';
    
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
    const todayDate = today.getDate();
    
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const day = document.createElement('div');
        day.className = 'calendar-day other-month';
        day.textContent = prevLastDate - i;
        calendarDays.appendChild(day);
    }
    
    for (let date = 1; date <= lastDate; date++) {
        const day = document.createElement('div');
        day.className = 'calendar-day';
        day.textContent = date;
        
        if (isCurrentMonth && date === todayDate) {
            day.classList.add('today');
        }
        
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
        const hasSchedule = schedules.some(s => s.date === dateString);
        if (hasSchedule) {
            day.classList.add('has-schedule');
            const indicator = document.createElement('div');
            indicator.className = 'schedule-indicator';
            day.appendChild(indicator);
        }
        
        day.addEventListener('click', () => {
            document.getElementById('scheduleDate').value = dateString;
        });
        
        calendarDays.appendChild(day);
    }
    
    const totalCells = firstDayOfWeek + lastDate;
    const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    
    for (let date = 1; date <= remainingCells; date++) {
        const day = document.createElement('div');
        day.className = 'calendar-day other-month';
        day.textContent = date;
        calendarDays.appendChild(day);
    }
}

function renderSchedules() {
    const scheduleItems = document.getElementById('scheduleItems');
    
    if (schedules.length === 0) {
        scheduleItems.innerHTML = '<div class="no-schedules">スケジュールがありません</div>';
        return;
    }
    
    const sortedSchedules = [...schedules].sort((a, b) => {
        const dateTimeA = new Date(`${a.date}T${a.time}`);
        const dateTimeB = new Date(`${b.date}T${b.time}`);
        return dateTimeA - dateTimeB;
    });
    
    scheduleItems.innerHTML = '';
    
    sortedSchedules.forEach((schedule, index) => {
        const item = document.createElement('div');
        item.className = 'schedule-item';
        
        const dateObj = new Date(schedule.date);
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth() + 1;
        const day = dateObj.getDate();
        const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
        const dayOfWeek = dayNames[dateObj.getDay()];
        
        const formattedDate = `${year}年${month}月${day}日(${dayOfWeek}) ${schedule.time}`;
        
        item.innerHTML = `
            <div class="schedule-item-header">
                <div>
                    <div class="schedule-item-title">${schedule.title}</div>
                    <div class="schedule-item-datetime">${formattedDate}</div>
                </div>
                <button class="delete-btn" onclick="deleteSchedule(${schedule.id})">削除</button>
            </div>
            ${schedule.description ? `<div class="schedule-item-description">${schedule.description}</div>` : ''}
        `;
        
        scheduleItems.appendChild(item);
    });
}

function deleteSchedule(id) {
    schedules = schedules.filter(s => s.id !== id);
    saveSchedules();
    renderCalendar();
    renderSchedules();
}

function addSchedule(date, time, title, description) {
    const newSchedule = {
        id: Date.now(),
        date: date,
        time: time,
        title: title,
        description: description
    };
    
    schedules.push(newSchedule);
    saveSchedules();
    renderCalendar();
    renderSchedules();
}

document.getElementById('prevMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

document.getElementById('scheduleForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const date = document.getElementById('scheduleDate').value;
    const time = document.getElementById('scheduleTime').value;
    const title = document.getElementById('scheduleTitle').value;
    const description = document.getElementById('scheduleDescription').value;
    
    if (date && time && title) {
        addSchedule(date, time, title, description);
        
        document.getElementById('scheduleForm').reset();
        
        alert('スケジュールを追加しました！');
    }
});

const today = new Date();
const todayString = today.toISOString().split('T')[0];
document.getElementById('scheduleDate').value = todayString;

loadSchedules();
renderCalendar();
renderSchedules();
