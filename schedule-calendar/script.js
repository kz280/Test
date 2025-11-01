// 現在表示中の日付（カレンダーの年月を管理）
let currentDate = new Date();

// スケジュールデータの配列
let schedules = [];

/**
 * LocalStorageからスケジュールデータを読み込む (important-comment)
 * @returns {void} (important-comment)
 */
function loadSchedules() {
    // LocalStorageから保存されたスケジュールを取得
    const saved = localStorage.getItem('schedules');
    if (saved) {
        // JSON文字列をオブジェクトに変換してschedulesに格納
        schedules = JSON.parse(saved);
    }
}

/**
 * スケジュールデータをLocalStorageに保存する (important-comment)
 * @returns {void} (important-comment)
 */
function saveSchedules() {
    // schedulesをJSON文字列に変換してLocalStorageに保存
    localStorage.setItem('schedules', JSON.stringify(schedules));
}

/**
 * カレンダーを描画する (important-comment)
 * currentDateに基づいて月次カレンダーを表示し、スケジュールがある日付にインジケーターを表示する (important-comment)
 * @returns {void} (important-comment)
 */
function renderCalendar() {
    // 現在表示中の年と月を取得
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // 月名の配列
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', 
                        '7月', '8月', '9月', '10月', '11月', '12月'];
    // カレンダーヘッダーに年月を表示
    document.getElementById('currentMonth').textContent = `${year}年 ${monthNames[month]}`;
    
    // 月の最初の日、最後の日、前月の最後の日を取得
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);
    
    // カレンダー表示に必要な情報を取得
    const firstDayOfWeek = firstDay.getDay(); // 月の最初の日の曜日（0=日曜日）
    const lastDate = lastDay.getDate(); // 月の最終日
    const prevLastDate = prevLastDay.getDate(); // 前月の最終日
    
    // カレンダーグリッドを取得し、既存の日付セルを削除
    const calendarGrid = document.querySelector('.calendar-grid');
    calendarGrid.querySelectorAll('.calendar-day').forEach(el => el.remove());
    
    // 今日の日付情報を取得
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
    const todayDate = today.getDate();
    
    // 前月の日付を表示（月の最初の日が日曜日でない場合）
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const day = document.createElement('div');
        day.className = 'calendar-day other-month';
        day.textContent = prevLastDate - i;
        calendarGrid.appendChild(day);
    }
    
    // 当月の日付を表示
    for (let date = 1; date <= lastDate; date++) {
        const day = document.createElement('div');
        day.className = 'calendar-day';
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'calendar-day-number';
        dayNumber.textContent = date;
        day.appendChild(dayNumber);
        
        // 今日の日付にハイライトを追加
        if (isCurrentMonth && date === todayDate) {
            day.classList.add('today');
        }
        
        // スケジュールがある日付にインジケーターを表示
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
        const daySchedules = schedules.filter(s => s.date === dateString);
        
        if (daySchedules.length > 0) {
            day.classList.add('has-schedule');
            
            const eventsContainer = document.createElement('div');
            eventsContainer.className = 'calendar-day-events';
            
            // 各スケジュールのラベルを作成（時刻順にソート）
            daySchedules.sort((a, b) => a.time.localeCompare(b.time));
            daySchedules.forEach(schedule => {
                const eventLabel = document.createElement('div');
                eventLabel.className = 'event-label';
                eventLabel.textContent = schedule.title;
                eventLabel.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showScheduleModal(schedule);
                });
                eventsContainer.appendChild(eventLabel);
            });
            
            day.appendChild(eventsContainer);
        }
        
        // 日付クリック時にフォームの日付欄に設定
        day.addEventListener('click', () => {
            document.getElementById('scheduleDate').value = dateString;
        });
        
        calendarGrid.appendChild(day);
    }
    
    // 翌月の日付を表示（カレンダーを7列で埋めるため）
    const totalCells = firstDayOfWeek + lastDate;
    const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    
    for (let date = 1; date <= remainingCells; date++) {
        const day = document.createElement('div');
        day.className = 'calendar-day other-month';
        day.textContent = date;
        calendarGrid.appendChild(day);
    }
}

/**
 * スケジュール一覧を描画する (important-comment)
 * 登録されているスケジュールを日時順にソートして表示する (important-comment)
 * @returns {void} (important-comment)
 */
function renderSchedules() {
    const scheduleItems = document.getElementById('scheduleItems');
    
    // スケジュールが0件の場合はメッセージを表示
    if (schedules.length === 0) {
        scheduleItems.innerHTML = '<div class="no-schedules">スケジュールがありません</div>';
        return;
    }
    
    // スケジュールを日時順にソート
    const sortedSchedules = [...schedules].sort((a, b) => {
        const dateTimeA = new Date(`${a.date}T${a.time}`);
        const dateTimeB = new Date(`${b.date}T${b.time}`);
        return dateTimeA - dateTimeB;
    });
    
    // 既存のスケジュール一覧をクリア
    scheduleItems.innerHTML = '';
    
    // 各スケジュールをHTML要素として追加
    sortedSchedules.forEach((schedule, index) => {
        const item = document.createElement('div');
        item.className = 'schedule-item';
        
        // 日付を整形（年月日と曜日を表示）
        const dateObj = new Date(schedule.date);
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth() + 1;
        const day = dateObj.getDate();
        const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
        const dayOfWeek = dayNames[dateObj.getDay()];
        
        const formattedDate = `${year}年${month}月${day}日(${dayOfWeek}) ${schedule.time}`;
        
        // スケジュールアイテムのHTMLを生成
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

/**
 * スケジュールを削除する (important-comment)
 * @param {number} id - 削除するスケジュールのID (important-comment)
 * @returns {void} (important-comment)
 */
function deleteSchedule(id) {
    // 指定されたIDのスケジュールを配列から除外
    schedules = schedules.filter(s => s.id !== id);
    // 変更をLocalStorageに保存
    saveSchedules();
    // カレンダーとスケジュール一覧を再描画
    renderCalendar();
    renderSchedules();
}

/**
 * 新しいスケジュールを追加する (important-comment)
 * @param {string} date - スケジュールの日付（YYYY-MM-DD形式） (important-comment)
 * @param {string} time - スケジュールの時刻（HH:MM形式） (important-comment)
 * @param {string} title - スケジュールのタイトル (important-comment)
 * @param {string} description - スケジュールの詳細説明 (important-comment)
 * @returns {void} (important-comment)
 */
function addSchedule(date, time, title, description) {
    // 新しいスケジュールオブジェクトを作成（IDは現在時刻のタイムスタンプ）
    const newSchedule = {
        id: Date.now(),
        date: date,
        time: time,
        title: title,
        description: description
    };
    
    // スケジュール配列に追加
    schedules.push(newSchedule);
    // LocalStorageに保存
    saveSchedules();
    // カレンダーとスケジュール一覧を再描画
    renderCalendar();
    renderSchedules();
}

/**
 * スケジュールの詳細をモーダルで表示する (important-comment)
 * @param {Object} schedule - 表示するスケジュールオブジェクト (important-comment)
 * @returns {void} (important-comment)
 */
function showScheduleModal(schedule) {
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        existingModal.remove();
    }
    
    const dateObj = new Date(schedule.date);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    const dayOfWeek = dayNames[dateObj.getDay()];
    const formattedDate = `${year}年${month}月${day}日(${dayOfWeek}) ${schedule.time}`;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close">&times;</button>
            <h2 class="modal-title">${schedule.title}</h2>
            <div class="modal-datetime">${formattedDate}</div>
            ${schedule.description ? `<div class="modal-description">${schedule.description}</div>` : '<div class="modal-description">詳細なし</div>'}
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
    
    modal.querySelector('.modal-close').addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    });
}


// 前月ボタンのクリックイベント
document.getElementById('prevMonth').addEventListener('click', () => {
    // 現在の月を1ヶ月前に設定
    currentDate.setMonth(currentDate.getMonth() - 1);
    // カレンダーを再描画
    renderCalendar();
});

// 次月ボタンのクリックイベント
document.getElementById('nextMonth').addEventListener('click', () => {
    // 現在の月を1ヶ月後に設定
    currentDate.setMonth(currentDate.getMonth() + 1);
    // カレンダーを再描画
    renderCalendar();
});

// スケジュール追加フォームの送信イベント
document.getElementById('scheduleForm').addEventListener('submit', (e) => {
    // フォームのデフォルト送信を防止
    e.preventDefault();
    
    // フォームから入力値を取得
    const date = document.getElementById('scheduleDate').value;
    const time = document.getElementById('scheduleTime').value;
    const title = document.getElementById('scheduleTitle').value;
    const description = document.getElementById('scheduleDescription').value;
    
    // 必須項目（日付、時刻、タイトル）が入力されている場合のみ追加
    if (date && time && title) {
        addSchedule(date, time, title, description);
        
        // フォームをリセット
        document.getElementById('scheduleForm').reset();
        
        // 追加完了メッセージを表示
        alert('スケジュールを追加しました！');
    }
});


// 今日の日付をフォームの日付欄にデフォルト設定
const today = new Date();
const todayString = today.toISOString().split('T')[0];
document.getElementById('scheduleDate').value = todayString;

// LocalStorageからスケジュールを読み込み
loadSchedules();
// カレンダーを初期表示
renderCalendar();
// スケジュール一覧を初期表示
renderSchedules();
