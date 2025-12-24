// Основной скрипт админ-панели
document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
    loadAllData();
    updateStats();
});

// Инициализация админки
function initializeAdmin() {
    // Загрузка последнего открытого таба
    const lastTab = localStorage.getItem('lastActiveTab') || 'content';
    openTab(lastTab);
    
    // Загрузка настроек
    loadSettings();
    
    // Настройка редактора
    setupEditor();
    
    // Проверка подключения Яндекс.Диска
    checkYandexConnection();
}

// Функции для работы с табами
function openTab(tabName) {
    // Сохраняем активный таб
    localStorage.setItem('lastActiveTab', tabName);
    
    // Скрываем все табы
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Показываем выбранный таб
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`[onclick="openTab('${tabName}')"]`).classList.add('active');
    
    // Загружаем данные для таба
    switch(tabName) {
        case 'content':
            loadPagesList();
            break;
        case 'prices':
            loadPricesList();
            break;
        case 'gallery':
            loadGalleryImages();
            break;
        case 'schedule':
            loadSchedule();
            break;
        case 'staff':
            loadStaff();
            break;
        case 'events':
            loadEvents();
            break;
    }
}

// Настройка редактора
function setupEditor() {
    const textarea = document.getElementById('pageContent');
    
    // Автосохранение каждые 30 секунд
    let saveTimeout;
    textarea.addEventListener('input', function() {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(autoSavePage, 30000);
    });
    
    // Подсказка по горячим клавишам
    textarea.addEventListener('keydown', function(e) {
        // Ctrl+B - жирный
        if (e.ctrlKey && e.key === 'b') {
            e.preventDefault();
            formatText('bold');
        }
        // Ctrl+I - курсив
        if (e.ctrlKey && e.key === 'i') {
            e.preventDefault();
            formatText('italic');
        }
        // Ctrl+K - ссылка
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            insertLink();
        }
    });
}

// Форматирование текста в редакторе
function formatText(type) {
    const textarea = document.getElementById('pageContent');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let formattedText = '';
    switch(type) {
        case 'bold':
            formattedText = `<strong>${selectedText}</strong>`;
            break;
        case 'italic':
            formattedText = `<em>${selectedText}</em>`;
            break;
        case 'underline':
            formattedText = `<u>${selectedText}</u>`;
            break;
    }
    
    textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
    textarea.focus();
    textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
}

// Вставка ссылки
function insertLink() {
    const url = prompt('Введите URL ссылки:', 'https://');
    if (!url) return;
    
    const text = prompt('Введите текст ссылки:', 'Текст ссылки');
    const textarea = document.getElementById('pageContent');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    const linkText = text || selectedText || 'Ссылка';
    const linkHtml = `<a href="${url}" target="_blank">${linkText}</a>`;
    
    textarea.value = textarea.value.substring(0, start) + linkHtml + textarea.value.substring(end);
    textarea.focus();
    textarea.setSelectionRange(start + linkHtml.length, start + linkHtml.length);
}

// Вставка изображения
function insertImage() {
    const url = prompt('Введите URL изображения:', 'https://');
    if (!url) return;
    
    const alt = prompt('Введите альтернативный текст:');
    const width = prompt('Ширина (px или %):', '100%');
    const height = prompt('Высота (px или auto):', 'auto');
    
    const imgHtml = `<img src="${url}" alt="${alt || ''}" style="width: ${width}; height: ${height}; max-width: 100%; border-radius: 8px;">`;
    
    const textarea = document.getElementById('pageContent');
    const start = textarea.selectionStart;
    textarea.value = textarea.value.substring(0, start) + imgHtml + textarea.value.substring(start);
    textarea.focus();
    textarea.setSelectionRange(start + imgHtml.length, start + imgHtml.length);
}

// Вставка списка
function insertList(type) {
    const items = prompt('Введите элементы списка через запятую:');
    if (!items) return;
    
    const itemsArray = items.split(',').map(item => item.trim());
    let listHtml = type === 'ul' ? '<ul>' : '<ol>';
    
    itemsArray.forEach(item => {
        listHtml += `<li>${item}</li>`;
    });
    
    listHtml += type === 'ul' ? '</ul>' : '</ol>';
    
    const textarea = document.getElementById('pageContent');
    const start = textarea.selectionStart;
    textarea.value = textarea.value.substring(0, start) + listHtml + textarea.value.substring(start);
    textarea.focus();
    textarea.setSelectionRange(start + listHtml.length, start + listHtml.length);
}

// Загрузка контента страницы
function loadPageContent() {
    const pageSelector = document.getElementById('pageSelector');
    const selectedPage = pageSelector.value;
    const pageName = pageSelector.options[pageSelector.selectedIndex].text;
    
    document.getElementById('currentPageName').textContent = pageName;
    
    // Загружаем сохраненный контент или дефолтный
    const savedContent = localStorage.getItem(`page_${selectedPage}`) || getDefaultPageContent(selectedPage);
    const savedMeta = JSON.parse(localStorage.getItem(`page_meta_${selectedPage}`)) || {};
    
    document.getElementById('pageTitle').value = savedMeta.title || getDefaultPageTitle(selectedPage);
    document.getElementById('pageContent').value = savedContent;
    document.getElementById('pageMetaDescription').value = savedMeta.description || '';
    document.getElementById('pageKeywords').value = savedMeta.keywords || '';
    
    // Показываем превью
    updatePagePreview();
}

// Получение дефолтного контента страницы
function getDefaultPageContent(pageName) {
    const defaultContents = {
        'directions': `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Направления - Первый ритм Ленинского</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body onload="initIframe()">
    <div class="section directions-section">
        <h2 class="section-title">🎯 <span class="highlight-text">НАПРАВЛЕНИЯ ОБУЧЕНИЯ</span></h2>
        
        <div class="directions-grid">
            <div>
                <div class="direction-category">
                    <div class="category-title">
                        👶 <span class="highlight-text">ДЕТСКИЕ НАПРАВЛЕНИЯ</span> 
                        <span class="highlight-number">(3-16 лет)</span>
                    </div>
                    <ul class="direction-list">
                        <li data-direction="dance-game">
                            <strong>ТАНЕЦ-ИГРА</strong> <span class="highlight-number">(3-4 года)</span> - развитие координации и чувства ритма через игру
                        </li>
                        <li data-direction="first-steps">
                            <strong>ПЕРВЫЕ ПА</strong> <span class="highlight-number">(5-7 лет)</span> - основы хореографии, развитие музыкальности
                        </li>
                        <li data-direction="young-dancer">
                            <strong>ЮНЫЙ ТАНЦОР</strong> <span class="highlight-number">(8-10 лет)</span> - изучение базовых танцевальных стилей
                        </li>
                    </ul>
                </div>
            </div>
            
            <div>
                <div class="direction-category">
                    <div class="category-title">🧘 <span class="highlight-text">РАСТЯЖКА И ГИБКОСТЬ</span></div>
                    <ul class="direction-list">
                        <li data-direction="stretching">
                            <strong>ГИБКОЕ ТЕЛО</strong> <span class="highlight-number">(5-10 лет)</span> - безопасная растяжка для детей
                        </li>
                        <li data-direction="stretching">
                            <strong>ГИБКИЙ ПОДРОСТОК</strong> <span class="highlight-number">(11-16 лет)</span> - развитие гибкости для танцев
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        
        <button class="btn-yclients" onclick="parent.openYclientsWidget()">
            🎯 ВЫБРАТЬ НАПРАВЛЕНИЕ И ЗАПИСАТЬСЯ ОНЛАЙН
        </button>
    </div>
    
    <script src="scripts.js"></script>
</body>
</html>`,
        'prices': `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Цены - Первый ритм Ленинского</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body onload="initIframe()">
    <div class="section prices-section">
        <h2 class="section-title">💰 <span class="highlight-text">СТОИМОСТЬ ЗАНЯТИЙ</span></h2>
        
        <div class="main-container">
            <div class="column">
                <div class="price-section trial-section">
                    <h2 class="section-title">🎁 <span class="highlight-sale">ПРОБНОЕ ЗАНЯТИЕ ОТ</span></h2>
                    <div class="trial-price"><span class="highlight-number">300 ₽</span></div>
                    <div class="description">Любое направление • Консультация преподавателя</div>
                </div>
            </div>
        </div>
        
        <button class="btn-yclients" onclick="parent.openYclientsWidget()">
            💰 ЗАБРОНИРОВАТЬ АБОНЕМЕНТ ОНЛАЙН
        </button>
    </div>
    
    <script src="scripts.js"></script>
</body>
</html>`
        // Добавьте остальные страницы по аналогии
    };
    
    return defaultContents[pageName] || `<h1>Страница ${pageName}</h1><p>Содержимое страницы</p>`;
}

function getDefaultPageTitle(pageName) {
    const titles = {
        'directions': 'Направления обучения',
        'prices': 'Стоимость занятий',
        'schedule': 'Расписание занятий',
        'booking': 'Онлайн-запись',
        'staff': 'Наша команда',
        'gallery': 'Галерея студии',
        'faq': 'Правила и FAQ',
        'contract': 'Договор-оферта',
        'contacts': 'Контакты',
        'events': 'Мероприятия',
        'index': 'Главная страница'
    };
    return titles[pageName] || 'Страница';
}

// Сохранение контента страницы
function savePageContent() {
    const pageSelector = document.getElementById('pageSelector');
    const selectedPage = pageSelector.value;
    
    const pageData = {
        content: document.getElementById('pageContent').value,
        meta: {
            title: document.getElementById('pageTitle').value,
            description: document.getElementById('pageMetaDescription').value,
            keywords: document.getElementById('pageKeywords').value
        }
    };
    
    // Сохраняем в localStorage
    localStorage.setItem(`page_${selectedPage}`, pageData.content);
    localStorage.setItem(`page_meta_${selectedPage}`, JSON.stringify(pageData.meta));
    
    // Обновляем файл на сервере (в реальном проекте здесь был бы AJAX запрос)
    updatePageFile(selectedPage, pageData.content);
    
    showNotification('Страница успешно сохранена', 'success');
    updatePagePreview();
    loadPagesList();
}

// Обновление файла страницы (симуляция)
function updatePageFile(pageName, content) {
    // В реальном проекте здесь был бы AJAX запрос на сервер
    console.log(`Обновление файла ${pageName}.html`);
    
    // Для демонстрации сохраняем в localStorage
    localStorage.setItem(`file_${pageName}`, content);
}

// Предпросмотр страницы
function updatePagePreview() {
    const content = document.getElementById('pageContent').value;
    const preview = document.getElementById('pagePreview');
    
    // Очищаем HTML от тегов для превью
    const cleanText = content.replace(/<[^>]*>/g, ' ');
    const previewText = cleanText.length > 300 ? cleanText.substring(0, 300) + '...' : cleanText;
    
    preview.innerHTML = `<div style="padding: 10px; background: #f8f9fa; border-radius: 6px;">
        <strong>Превью:</strong><br>
        ${previewText}
    </div>`;
}

function previewPage() {
    const content = document.getElementById('pageContent').value;
    const win = window.open('', '_blank');
    win.document.write(content);
    win.document.close();
}

// Сброс страницы
function resetPageContent() {
    if (confirm('Сбросить изменения и восстановить исходный контент?')) {
        const pageSelector = document.getElementById('pageSelector');
        const selectedPage = pageSelector.value;
        
        localStorage.removeItem(`page_${selectedPage}`);
        localStorage.removeItem(`page_meta_${selectedPage}`);
        
        loadPageContent();
        showNotification('Изменения сброшены', 'warning');
    }
}

// Загрузка списка страниц
function loadPagesList() {
    const pages = [
        { id: 'directions', name: '🎯 Направления обучения', icon: '🎯' },
        { id: 'schedule', name: '📅 Расписание занятий', icon: '📅' },
        { id: 'prices', name: '💰 Стоимость занятий', icon: '💰' },
        { id: 'booking', name: '🔄 Онлайн-запись', icon: '🔄' },
        { id: 'staff', name: '👥 Наша команда', icon: '👥' },
        { id: 'gallery', name: '📸 Галерея студии', icon: '📸' },
        { id: 'faq', name: '❓ Правила и FAQ', icon: '❓' },
        { id: 'contract', name: '📄 Договор-оферта', icon: '📄' },
        { id: 'contacts', name: '📞 Контакты', icon: '📞' },
        { id: 'events', name: '🎭 Мероприятия', icon: '🎭' },
        { id: 'index', name: '🏠 Главная страница', icon: '🏠' }
    ];
    
    const grid = document.getElementById('pagesList');
    grid.innerHTML = '';
    
    pages.forEach(page => {
        const savedContent = localStorage.getItem(`page_${page.id}`);
        const hasChanges = savedContent !== null;
        const lastModified = localStorage.getItem(`page_modified_${page.id}`) || 'Не изменялась';
        
        grid.innerHTML += `
            <div class="page-card">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
                    <div style="font-size: 24px;">${page.icon}</div>
                    <div style="flex: 1;">
                        <h4 style="margin: 0 0 5px 0;">${page.name}</h4>
                        <div style="font-size: 12px; color: #666;">
                            ${hasChanges ? '✏️ Есть изменения' : '📄 Исходная версия'} | 
                            ${lastModified}
                        </div>
                    </div>
                </div>
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <button class="btn btn-primary btn-sm" onclick="editPage('${page.id}')" style="flex: 1;">
                        ✏️ Редактировать
                    </button>
                    <button class="btn btn-success btn-sm" onclick="previewPageById('${page.id}')">
                        👁️
                    </button>
                </div>
            </div>
        `;
    });
}

function editPage(pageId) {
    document.getElementById('pageSelector').value = pageId;
    loadPageContent();
    openTab('content');
}

function previewPageById(pageId) {
    const content = localStorage.getItem(`page_${pageId}`) || getDefaultPageContent(pageId);
    const win = window.open('', '_blank');
    win.document.write(content);
    win.document.close();
}

// Автосохранение
function autoSavePage() {
    const pageSelector = document.getElementById('pageSelector');
    const selectedPage = pageSelector.value;
    
    if (selectedPage && document.getElementById('pageContent').value) {
        localStorage.setItem(`page_${selectedPage}`, document.getElementById('pageContent').value);
        localStorage.setItem(`page_modified_${selectedPage}`, new Date().toLocaleString());
        console.log('Автосохранение выполнено');
    }
}

// Управление ценами
function loadPriceTemplate() {
    const type = document.getElementById('priceCategoryType').value;
    const templates = {
        'trial': {
            title: 'ПРОБНОЕ ЗАНЯТИЕ ОТ',
            subtitle: '',
            items: [
                { name: 'Пробное занятие', price: 300, period: '1 занятие', description: 'Любое направление • Консультация преподавателя' }
            ]
        },
        'kids': {
            title: 'ДЕТСКИЕ НАПРАВЛЕНИЯ',
            subtitle: '(3-16 лет)',
            items: [
                { name: 'Пробное занятие', price: 350, period: '1 занятие', description: '' },
                { name: 'Разовое посещение', price: 400, period: '1 занятие', description: '' },
                { name: 'Абонемент на 8 занятий', price: 2800, period: '30 дней', description: '', discount: 'ВЫГОДА' }
            ]
        }
        // Добавьте остальные шаблоны
    };
    
    const template = templates[type] || templates.trial;
    
    document.getElementById('priceCategoryTitle').value = template.title;
    document.getElementById('priceCategorySubtitle').value = template.subtitle || '';
    
    const container = document.getElementById('priceItemsContainer');
    container.innerHTML = '';
    
    template.items.forEach(item => {
        container.innerHTML += createPriceItemHtml(item);
    });
}

function createPriceItemHtml(item) {
    return `
        <div class="price-item-editor">
            <div class="form-row">
                <div class="form-group">
                    <label>Название услуги</label>
                    <input type="text" class="price-name" value="${item.name}">
                </div>
                <div class="form-group">
                    <label>Цена (₽)</label>
                    <input type="number" class="price-value" value="${item.price}">
                </div>
                <div class="form-group">
                    <label>Период/количество</label>
                    <input type="text" class="price-period" value="${item.period}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Описание</label>
                    <input type="text" class="price-description" value="${item.description || ''}">
                </div>
                <div class="form-group">
                    <label>Скидка/акция</label>
                    <input type="text" class="price-discount" value="${item.discount || ''}">
                </div>
            </div>
            <button class="btn btn-danger btn-sm" onclick="removePriceItem(this)">
                🗑️ Удалить эту цену
            </button>
        </div>
    `;
}

function addPriceItem() {
    const container = document.getElementById('priceItemsContainer');
    container.innerHTML += createPriceItemHtml({
        name: '',
        price: 0,
        period: '',
        description: '',
        discount: ''
    });
}

function removePriceItem(button) {
    if (confirm('Удалить эту позицию?')) {
        button.closest('.price-item-editor').remove();
    }
}

function savePriceCategory() {
    const type = document.getElementById('priceCategoryType').value;
    const title = document.getElementById('priceCategoryTitle').value;
    const subtitle = document.getElementById('priceCategorySubtitle').value;
    const additionalInfo = document.getElementById('priceAdditionalInfo').value;
    
    const items = [];
    document.querySelectorAll('.price-item-editor').forEach(editor => {
        items.push({
            name: editor.querySelector('.price-name').value,
            price: parseInt(editor.querySelector('.price-value').value) || 0,
            period: editor.querySelector('.price-period').value,
            description: editor.querySelector('.price-description').value,
            discount: editor.querySelector('.price-discount').value
        });
    });
    
    const priceCategory = {
        type,
        title,
        subtitle,
        items,
        additionalInfo,
        lastModified: new Date().toISOString()
    };
    
    // Сохраняем в localStorage
    localStorage.setItem(`price_${type}`, JSON.stringify(priceCategory));
    
    // Обновляем список
    loadPricesList();
    
    showNotification('Категория цен сохранена', 'success');
}

function loadPricesList() {
    const priceTypes = ['trial', 'kids', 'adults', 'stretching', 'individual', 'packages'];
    const container = document.getElementById('pricesList');
    container.innerHTML = '';
    
    priceTypes.forEach(type => {
        const saved = localStorage.getItem(`price_${type}`);
        if (saved) {
            const data = JSON.parse(saved);
            container.innerHTML += `
                <div class="price-category">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <h4 style="margin: 0;">${data.title} ${data.subtitle}</h4>
                        <button class="btn btn-warning btn-sm" onclick="editPriceCategory('${type}')">
                            ✏️ Редактировать
                        </button>
                    </div>
                    <div style="color: #666; font-size: 14px;">
                        ${data.items.length} позиций • 
                        Обновлено: ${new Date(data.lastModified).toLocaleDateString()}
                    </div>
                </div>
            `;
        }
    });
    
    if (container.innerHTML === '') {
        container.innerHTML = `
            <div class="empty-state">
                <div>💰</div>
                <p>Цены не настроены</p>
                <button class="btn btn-primary" onclick="addPriceCategory()">
                    ➕ Добавить первую категорию
                </button>
            </div>
        `;
    }
}

function editPriceCategory(type) {
    document.getElementById('priceCategoryType').value = type;
    loadPriceTemplate();
    openTab('prices');
}

function addPriceCategory() {
    document.getElementById('priceCategoryType').value = 'trial';
    loadPriceTemplate();
    openTab('prices');
}

// Галерея с Яндекс.Диском
function setUploadMethod(method) {
    // Скрываем все разделы
    document.querySelectorAll('.upload-section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.upload-method').forEach(m => {
        m.classList.remove('active');
    });
    
    // Показываем выбранный раздел
    document.getElementById(`upload${method.charAt(0).toUpperCase() + method.slice(1)}`).classList.add('active');
    document.querySelector(`[onclick="setUploadMethod('${method}')"]`).classList.add('active');
}

function checkYandexConnection() {
    const token = localStorage.getItem('yandex_token');
    const status = document.getElementById('yandexStatus');
    
    if (token) {
        status.innerHTML = '<div style="color: #4CAF50;">✅ Яндекс.Диск подключен</div>';
        status.style.display = 'block';
        loadYandexFiles();
    } else {
        status.innerHTML = '<div style="color: #FF9800;">⚠️ Яндекс.Диск не подключен</div>';
        status.style.display = 'block';
    }
}

function connectYandexDisk() {
    const token = document.getElementById('yandexToken').value;
    const folder = document.getElementById('yandexFolder').value;
    
    if (!token) {
        showNotification('Введите OAuth-токен', 'error');
        return;
    }
    
    // Сохраняем токен
    localStorage.setItem('yandex_token', token);
    localStorage.setItem('yandex_folder', folder);
    
    showNotification('Яндекс.Диск успешно подключен', 'success');
    checkYandexConnection();
}

function loadYandexFiles() {
    const token = localStorage.getItem('yandex_token');
    const folder = localStorage.getItem('yandex_folder') || 'studio-gallery';
    const container = document.getElementById('yandexFiles');
    
    // Симуляция загрузки файлов
    container.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <div>🔄</div>
            <p>Загрузка файлов с Яндекс.Диска...</p>
            <div style="font-size: 12px; color: #666; margin-top: 10px;">
                Папка: ${folder}
            </div>
        </div>
    `;
    
    // В реальном проекте здесь был бы запрос к API Яндекс.Диска
    setTimeout(() => {
        // Демонстрационные файлы
        const demoFiles = [
            { name: 'hall1.jpg', type: 'image', size: '2.1 MB' },
            { name: 'class1.jpg', type: 'image', size: '1.8 MB' },
            { name: 'team.jpg', type: 'image', size: '2.5 MB' },
            { name: 'event1.jpg', type: 'image', size: '3.2 MB' },
            { name: 'studio.jpg', type: 'image', size: '1.5 MB' }
        ];
        
        container.innerHTML = '';
        demoFiles.forEach(file => {
            container.innerHTML += `
                <div class="file-item" onclick="selectYandexFile('${file.name}')" 
                     style="padding: 10px; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 5px; cursor: pointer;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div>🖼️</div>
                        <div style="flex: 1;">
                            <div style="font-weight: 500;">${file.name}</div>
                            <div style="font-size: 12px; color: #666;">${file.size}</div>
                        </div>
                    </div>
                </div>
            `;
        });
    }, 1000);
}

function selectYandexFile(filename) {
    // В реальном проекте здесь был бы URL файла с Яндекс.Диска
    const demoUrl = `https://yadi.sk/i/${filename.replace('.', '_')}`;
    document.getElementById('imageUrl').value = demoUrl;
    setUploadMethod('url');
    
    showNotification(`Выбрано: ${filename}`, 'success');
}

function previewSelectedImage(input) {
    const preview = document.getElementById('filePreview');
    const previewImage = document.getElementById('selectedImage');
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            preview.style.display = 'block';
        };
        
        reader.readAsDataURL(input.files[0]);
    }
}

function saveGalleryImage() {
    const title = document.getElementById('galleryImageTitle').value;
    const category = document.getElementById('galleryImageCategory').value;
    const description = document.getElementById('galleryImageDescription').value;
    
    // Получаем URL в зависимости от метода загрузки
    let imageUrl = '';
    const activeMethod = document.querySelector('.upload-method.active');
    
    if (activeMethod.querySelector('.method-title').textContent === 'По ссылке') {
        imageUrl = document.getElementById('imageUrl').value;
    } else if (activeMethod.querySelector('.method-title').textContent === 'Файл') {
        // В реальном проекте здесь была бы загрузка файла на сервер
        imageUrl = document.getElementById('selectedImage').src;
    } else {
        // Яндекс.Диск
        imageUrl = document.getElementById('imageUrl').value || 'https://yadi.sk/i/demo_image';
    }
    
    if (!title || !imageUrl) {
        showNotification('Заполните обязательные поля', 'error');
        return;
    }
    
    const galleryItem = {
        id: Date.now(),
        title,
        category,
        url: imageUrl,
        description,
        date: new Date().toISOString(),
        status: 'active'
    };
    
    // Сохраняем в localStorage
    const gallery = JSON.parse(localStorage.getItem('gallery')) || [];
    gallery.push(galleryItem);
    localStorage.setItem('gallery', JSON.stringify(gallery));
    
    // Обновляем галерею
    loadGalleryImages();
    
    // Очищаем форму
    document.getElementById('galleryImageTitle').value = '';
    document.getElementById('galleryImageDescription').value = '';
    document.getElementById('imageUrl').value = '';
    document.getElementById('imageFile').value = '';
    document.getElementById('filePreview').style.display = 'none';
    
    showNotification('Фото добавлено в галерею', 'success');
}

function loadGalleryImages() {
    const gallery = JSON.parse(localStorage.getItem('gallery')) || [];
    const filter = document.getElementById('galleryFilter').value;
    const container = document.getElementById('galleryImages');
    
    let filteredGallery = gallery;
    if (filter !== 'all') {
        filteredGallery = gallery.filter(item => item.category === filter);
    }
    
    if (filteredGallery.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div>📸</div>
                <p>В галерее пока нет фото</p>
                <button class="btn btn-primary" onclick="addGalleryItem()">
                    ➕ Добавить первое фото
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    filteredGallery.forEach(item => {
        const categoryNames = {
            'halls': '🏛️ Залы',
            'classes': '💃 Занятия',
            'events': '🎭 Мероприятия',
            'team': '👥 Команда',
            'studio': '🏢 Студия',
            'other': '📷 Другое'
        };
        
        container.innerHTML += `
            <div class="gallery-image">
                <div style="width: 100%; height: 100%; background: #f5f5f5; display: flex; flex-direction: column;">
                    <div style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 10px;">
                        <div style="text-align: center; color: #999; font-size: 14px;">
                            🖼️<br>
                            <small>${item.title}</small>
                        </div>
                    </div>
                    <div style="background: white; padding: 10px; border-top: 1px solid #eee;">
                        <div style="font-size: 12px; color: #666; margin-bottom: 5px;">
                            ${categoryNames[item.category] || item.category}
                        </div>
                        <div style="display: flex; gap: 5px;">
                            <button class="btn btn-warning btn-sm" onclick="editGalleryImage(${item.id})" style="flex: 1;">
                                ✏️
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="deleteGalleryImage(${item.id})">
                                🗑️
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
}

function filterGallery() {
    loadGalleryImages();
}

function refreshGallery() {
    loadGalleryImages();
    showNotification('Галерея обновлена', 'success');
}

function editGalleryImage(id) {
    const gallery = JSON.parse(localStorage.getItem('gallery')) || [];
    const item = gallery.find(img => img.id === id);
    
    if (item) {
        // Заполняем форму редактирования
        document.getElementById('galleryImageTitle').value = item.title;
        document.getElementById('galleryImageCategory').value = item.category;
        document.getElementById('galleryImageDescription').value = item.description;
        document.getElementById('imageUrl').value = item.url;
        
        setUploadMethod('url');
        openTab('gallery');
        
        showNotification('Редактирование фото', 'warning');
    }
}

function deleteGalleryImage(id) {
    if (confirm('Удалить это фото из галереи?')) {
        let gallery = JSON.parse(localStorage.getItem('gallery')) || [];
        gallery = gallery.filter(img => img.id !== id);
        localStorage.setItem('gallery', JSON.stringify(gallery));
        
        loadGalleryImages();
        updateStats();
        showNotification('Фото удалено', 'success');
    }
}

// Настройки
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('site_settings')) || getDefaultSettings();
    
    document.getElementById('studioName').value = settings.studioName;
    document.getElementById('studioPhone').value = settings.phone;
    document.getElementById('studioEmail').value = settings.email;
    document.getElementById('studioAddress').value = settings.address;
    document.getElementById('yclientsId').value = settings.yclientsId;
    document.getElementById('telegramBot').value = settings.telegramBot || '';
    document.getElementById('siteTitle').value = settings.siteTitle;
    document.getElementById('siteDescription').value = settings.siteDescription;
    document.getElementById('primaryColor').value = settings.colors?.primary || '#667eea';
    document.getElementById('secondaryColor').value = settings.colors?.secondary || '#764ba2';
    document.getElementById('accentColor').value = settings.colors?.accent || '#FF6B6B';
}

function getDefaultSettings() {
    return {
        studioName: 'Первый ритм Ленинского',
        phone: '+7 (904) 123-31-75',
        email: 'egor.denunn@yandex.ru',
        address: 'г. Иркутск, ул. 1-й Ленинский квартал д. 1',
        yclientsId: '1729530',
        siteTitle: 'Студия танцев Первый ритм Ленинского | Иркутск',
        siteDescription: 'Студия танцев Первый ритм Ленинского в Иркутске. Детские и взрослые группы, растяжка, фитнес. Профессиональные педагоги. Запись на пробное занятие.',
        colors: {
            primary: '#667eea',
            secondary: '#764ba2',
            accent: '#FF6B6B'
        }
    };
}

function saveSettings() {
    const settings = {
        studioName: document.getElementById('studioName').value,
        phone: document.getElementById('studioPhone').value,
        email: document.getElementById('studioEmail').value,
        address: document.getElementById('studioAddress').value,
        yclientsId: document.getElementById('yclientsId').value,
        telegramBot: document.getElementById('telegramBot').value,
        siteTitle: document.getElementById('siteTitle').value,
        siteDescription: document.getElementById('siteDescription').value,
        colors: {
            primary: document.getElementById('primaryColor').value,
            secondary: document.getElementById('secondaryColor').value,
            accent: document.getElementById('accentColor').value
        },
        lastModified: new Date().toISOString()
    };
    
    localStorage.setItem('site_settings', JSON.stringify(settings));
    
    // Обновляем CSS переменные
    updateCSSVariables(settings.colors);
    
    showNotification('Настройки сохранены', 'success');
}

function updateCSSVariables(colors) {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', colors.primary);
    root.style.setProperty('--secondary-color', colors.secondary);
    root.style.setProperty('--accent-color', colors.accent);
}

function generateSiteMap() {
    // Генерация простой карты сайта
    const pages = [
        { url: 'index.html', name: 'Главная' },
        { url: 'directions.html', name: 'Направления' },
        { url: 'schedule.html', name: 'Расписание' },
        { url: 'prices.html', name: 'Цены' },
        { url: 'booking.html', name: 'Онлайн-запись' },
        { url: 'staff.html', name: 'Команда' },
        { url: 'gallery.html', name: 'Галерея' },
        { url: 'faq.html', name: 'FAQ' },
        { url: 'contract.html', name: 'Договор' },
        { url: 'contacts.html', name: 'Контакты' }
    ];
    
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    const baseUrl = window.location.origin;
    pages.forEach(page => {
        sitemap += `  <url>\n`;
        sitemap += `    <loc>${baseUrl}/${page.url}</loc>\n`;
        sitemap += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
        sitemap += `    <changefreq>weekly</changefreq>\n`;
        sitemap += `    <priority>0.8</priority>\n`;
        sitemap += `  </url>\n`;
    });
    
    sitemap += '</urlset>';
    
    // Скачивание файла
    const blob = new Blob([sitemap], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Sitemap сгенерирован', 'success');
}

function clearCache() {
    // Очистка некоторых данных из localStorage
    const keysToKeep = ['site_settings', 'yandex_token', 'yandex_folder', 'lastActiveTab'];
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!keysToKeep.includes(key) && !key.startsWith('page_')) {
            localStorage.removeItem(key);
        }
    }
    
    showNotification('Кэш очищен', 'success');
}

// Общие функции
function saveAllChanges() {
    // Сохранение всех изменений на всех страницах
    const pages = ['directions', 'schedule', 'prices', 'booking', 'staff', 'gallery', 'faq', 'contract', 'contacts', 'events', 'index'];
    
    pages.forEach(page => {
        const content = localStorage.getItem(`page_${page}`);
        if (content) {
            // В реальном проекте здесь был бы AJAX запрос на сервер
            console.log(`Сохранение страницы: ${page}`);
        }
    });
    
    showNotification('Все изменения сохранены', 'success');
}

function previewSite() {
    window.open('index.html', '_blank');
}

function exportAllData() {
    const allData = {};
    
    // Собираем все данные из localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        try {
            allData[key] = JSON.parse(localStorage.getItem(key));
        } catch {
            allData[key] = localStorage.getItem(key);
        }
    }
    
    const dataStr = JSON.stringify(allData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `studio-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Все данные экспортированы', 'success');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                
                // Импортируем данные
                for (const key in data) {
                    if (typeof data[key] === 'object') {
                        localStorage.setItem(key, JSON.stringify(data[key]));
                    } else {
                        localStorage.setItem(key, data[key]);
                    }
                }
                
                showNotification('Данные успешно импортированы', 'success');
                location.reload();
            } catch (error) {
                showNotification('Ошибка при импорте данных', 'error');
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

function backToSite() {
    window.location.href = 'index.html';
}

function clearAllData() {
    if (confirm('ВНИМАНИЕ! Это удалит ВСЕ данные без возможности восстановления. Продолжить?')) {
        localStorage.clear();
        showNotification('Все данные очищены', 'success');
        setTimeout(() => location.reload(), 1000);
    }
}

function resetToDefaults() {
    if (confirm('Восстановить все настройки и контент к значениям по умолчанию?')) {
        localStorage.clear();
        
        // Загружаем дефолтные настройки
        localStorage.setItem('site_settings', JSON.stringify(getDefaultSettings()));
        
        showNotification('Все настройки восстановлены', 'success');
        setTimeout(() => location.reload(), 1000);
    }
}

function updateStats() {
    // Подсчет страниц
    let pageCount = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('page_') && !key.includes('meta') && !key.includes('modified')) {
            pageCount++;
        }
    }
    document.getElementById('totalPages').textContent = pageCount;
    
    // Подсчет фото
    const gallery = JSON.parse(localStorage.getItem('gallery')) || [];
    document.getElementById('totalPhotos').textContent = gallery.length;
    
    // Подсчет цен (упрощенно)
    let priceCount = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('price_')) {
            const data = JSON.parse(localStorage.getItem(key));
            priceCount += data.items?.length || 0;
        }
    }
    document.getElementById('totalPrices').textContent = priceCount;
    
    // Подсчет сотрудников
    const staff = JSON.parse(localStorage.getItem('staff')) || [];
    document.getElementById('totalStaff').textContent = staff.length;
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Загрузка всех данных
function loadAllData() {
    // Загрузка расписания, сотрудников и мероприятий (упрощенно)
    // В реальном проекте здесь была бы загрузка из localStorage или API
    
    // Инициализация дефолтных данных, если их нет
    if (!localStorage.getItem('schedule')) {
        const defaultSchedule = [
            { id: 1, day: 'mon', time: '18:00', direction: 'Танцы для души', teacher: 'Степан В.', room: 'Основной зал', status: 'active' }
        ];
        localStorage.setItem('schedule', JSON.stringify(defaultSchedule));
    }
    
    if (!localStorage.getItem('staff')) {
        const defaultStaff = [
            { id: 1, name: 'Степан Васильев', position: 'Главный хореограф', experience: '14 лет' }
        ];
        localStorage.setItem('staff', JSON.stringify(defaultStaff));
    }
    
    if (!localStorage.getItem('events')) {
        const defaultEvents = [
            { id: 1, title: 'Открытый урок', date: new Date().toISOString(), location: 'Студия', status: 'upcoming' }
        ];
        localStorage.setItem('events', JSON.stringify(defaultEvents));
    }
}
