const topics = [
  {
    id: "git",
    title: "Git",
    description:
      "Практика веток, коммитов, pull request и merge через реальные шаги.",
    href: "git.html",
    state: "Активная тема",
    active: true,
  },
  {
    id: "frontend",
    title: "Frontend",
    description:
      "Место под HTML, CSS, JavaScript и сборку маленьких интерфейсов.",
    href: "#",
    state: "Скоро",
    active: false,
  },
  {
    id: "backend",
    title: "Backend",
    description:
      "Здесь потом можно трекать серверную логику, API и базы данных.",
    href: "#",
    state: "Скоро",
    active: false,
  },
];

const gitPlan = [
  {
    day: "День 1",
    title: "База Git",
    task: "Status, log, add, commit, restore. Результат: два коммита и один откат.",
  },
  {
    day: "День 2",
    title: "Ветки",
    task: "Branch и checkout. Результат: отдельная ветка под маленькую фичу.",
  },
  {
    day: "День 3",
    title: "Слияние",
    task: "Merge и смысл изолированной работы. Результат: фича влита в main.",
  },
  {
    day: "День 4",
    title: "GitHub",
    task: "Push, origin, удаленная ветка. Результат: ветка отправлена на GitHub.",
  },
  {
    day: "День 5",
    title: "Pull Request",
    task: "Сравнение веток, чистый PR, merge. Результат: один чистый pull request.",
  },
  {
    day: "День 6",
    title: "Сборка цепочки",
    task: "Branch -> commit -> push -> PR. Результат: повторить почти без подсказок.",
  },
  {
    day: "День 7",
    title: "Контрольный день",
    task: "Пройти весь цикл самостоятельно и отметить пробелы.",
  },
];

const storageKey = "study-crm-state";

const defaultState = {
  git: {
    days: {},
    notes: {
      understood: "",
      stuck: "",
      distraction: "",
    },
    history: {
      understood: [],
      stuck: [],
      distraction: [],
    },
  },
};

const state = loadState();

if (document.querySelector("#topic-grid")) {
  renderTopics();
}

if (document.querySelector("#plan-list")) {
  bindGitPage();
}

function renderTopics() {
  const topicGrid = document.querySelector("#topic-grid");
  topicGrid.innerHTML = "";

  for (const topic of topics) {
    const article = document.createElement("article");
    article.className = `topic-card ${topic.active ? "active" : ""}`;

    const inner = `
      <div class="topic-meta">
        <span class="topic-pill">${topic.state}</span>
      </div>
      <div class="topic-copy">
        <h3>${topic.title}</h3>
        <p>${topic.description}</p>
      </div>
      <div class="topic-footer">
        <span class="topic-action">${topic.active ? "Открыть план" : "Скоро доступно"}</span>
      </div>
    `;

    if (topic.active) {
      article.innerHTML = `<a class="topic-link" href="${topic.href}">${inner}</a>`;
    } else {
      article.innerHTML = `<div class="topic-link disabled">${inner}</div>`;
    }

    topicGrid.appendChild(article);
  }
}

function bindGitPage() {
  const doneDays = document.querySelector("#done-days");
  const streakDays = document.querySelector("#streak-days");
  const stuckCount = document.querySelector("#stuck-count");
  const currentFocus = document.querySelector("#current-focus");
  const understood = document.querySelector("#understood");
  const understoodPreview = document.querySelector("#understood-preview");
  const stuck = document.querySelector("#stuck");
  const stuckPreview = document.querySelector("#stuck-preview");
  const distraction = document.querySelector("#distraction");
  const distractionPreview = document.querySelector("#distraction-preview");
  const saveButton = document.querySelector("#save-notes");
  const saveStatus = document.querySelector("#save-status");
  const resetButton = document.querySelector("#reset-progress");

  understood.value = state.git.notes.understood;
  stuck.value = state.git.notes.stuck;
  distraction.value = state.git.notes.distraction;

  renderGitPlan();
  renderGitStats();
  renderSavedNotes();

  saveButton.addEventListener("click", () => {
    saveNote("understood", understood.value.trim());
    saveNote("stuck", stuck.value.trim());
    saveNote("distraction", distraction.value.trim());
    persistState();
    renderSavedNotes();
    saveStatus.textContent = `Сохранено: ${new Date().toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  });

  resetButton.addEventListener("click", () => {
    state.git = structuredClone(defaultState.git);
    persistState();
    location.reload();
  });

  function renderGitPlan() {
    const planList = document.querySelector("#plan-list");
    planList.innerHTML = "";

    for (const item of gitPlan) {
      const status = state.git.days[item.day] || "planned";
      const article = document.createElement("article");
      article.className = "plan-item";
      article.innerHTML = `
        <div class="plan-day">${item.day}</div>
        <div class="plan-copy">
          <h3>${item.title}</h3>
          <p>${item.task}</p>
        </div>
        <div class="plan-actions">
          <button class="status-button ${status === "planned" ? "active" : ""}" data-day="${item.day}" data-status="planned">Запланировано</button>
          <button class="status-button ${status === "doing" ? "active" : ""}" data-day="${item.day}" data-status="doing">В работе</button>
          <button class="status-button ${status === "done" ? "active" : ""}" data-day="${item.day}" data-status="done">Сделано</button>
          <button class="status-button stuck ${status === "stuck" ? "active" : ""}" data-day="${item.day}" data-status="stuck">Не понял</button>
        </div>
      `;
      planList.appendChild(article);
    }

    planList.querySelectorAll(".status-button").forEach((button) => {
      button.addEventListener("click", () => {
        state.git.days[button.dataset.day] = button.dataset.status;
        persistState();
        renderGitPlan();
        renderGitStats();
      });
    });
  }

  function renderGitStats() {
    const statuses = Object.values(state.git.days);
    const done = statuses.filter((item) => item === "done").length;
    const stuckDays = statuses.filter((item) => item === "stuck").length;

    doneDays.textContent = String(done);
    stuckCount.textContent = String(stuckDays);
    streakDays.textContent = String(calculateStreak());

    const activeDay = gitPlan.find((item) => state.git.days[item.day] === "doing");
    currentFocus.textContent = activeDay
      ? `Сегодня: ${activeDay.title}. ${activeDay.task}`
      : "Сегодня: открыть план, выбрать один день и довести его до конца.";
  }

  function renderSavedNotes() {
    renderNoteList("understood", understoodPreview, state.git.history.understood);
    renderNoteList("stuck", stuckPreview, state.git.history.stuck);
    renderNoteList("distraction", distractionPreview, state.git.history.distraction);
  }

  function renderNoteList(key, container, items) {
    container.innerHTML = "";

    if (!items.length) {
      container.innerHTML = '<div class="saved-note-empty">Пока пусто</div>';
      return;
    }

    const orderedItems = [...items].reverse();

    for (const item of orderedItems) {
      const entry = document.createElement("article");
      entry.className = "saved-note-entry";
      entry.innerHTML = `
        <div class="saved-note-head">
          <p class="saved-note-time">${item.savedAt}</p>
          <button class="delete-note-button" type="button" data-key="${key}" data-id="${item.id}">×</button>
        </div>
        <div class="saved-note-body">${item.text}</div>
      `;
      container.appendChild(entry);
    }

    container.querySelectorAll(".delete-note-button").forEach((button) => {
      button.addEventListener("click", () => {
        deleteNote(button.dataset.key, button.dataset.id);
      });
    });
  }

  function saveNote(key, value) {
    state.git.notes[key] = value;

    if (!value) return;

    const history = state.git.history[key];
    const lastItem = history[history.length - 1];

    if (lastItem && lastItem.text === value) return;

    history.push({
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      text: value,
      savedAt: new Date().toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
  }

  function deleteNote(key, noteId) {
    state.git.history[key] = state.git.history[key].filter((item) => item.id !== noteId);
    persistState();
    renderSavedNotes();
  }

  function calculateStreak() {
    let streak = 0;

    for (const item of gitPlan) {
      if (state.git.days[item.day] === "done") {
        streak += 1;
      } else {
        break;
      }
    }

    return streak;
  }
}

function loadState() {
  const raw = localStorage.getItem(storageKey);

  if (!raw) return structuredClone(defaultState);

  try {
    const parsed = JSON.parse(raw);
    const normalizedHistory = normalizeHistory(parsed.git?.history || {});
    const normalizedNotes = normalizeNotes(parsed.git?.notes || {}, normalizedHistory);

    return {
      ...structuredClone(defaultState),
      ...parsed,
      git: {
        ...structuredClone(defaultState.git),
        ...parsed.git,
        notes: normalizedNotes,
        history: normalizedHistory,
      },
    };
  } catch {
    return structuredClone(defaultState);
  }
}

function persistState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function normalizeHistory(history) {
  return {
    understood: (history.understood || []).filter((item) => item && item.id),
    stuck: (history.stuck || []).filter((item) => item && item.id),
    distraction: (history.distraction || []).filter((item) => item && item.id),
  };
}

function normalizeNotes(notes, history) {
  return {
    understood: history.understood.length ? notes.understood || "" : "",
    stuck: history.stuck.length ? notes.stuck || "" : "",
    distraction: history.distraction.length ? notes.distraction || "" : "",
  };
}
