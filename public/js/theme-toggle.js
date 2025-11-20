/**
 * Переключение светлой/темной темы
 * Сохраняет выбор пользователя в localStorage
 */

(function() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.querySelector('.theme-icon');
    const htmlElement = document.documentElement;

    // Иконки для тем
    const icons = {
        light: '🌙',
        dark: '☀️'
    };

    // Получить сохраненную тему или определить системную
    function getSavedTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme;
        }

        // Проверить системные настройки
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }

        return 'light';
    }

    // Применить тему
    function applyTheme(theme) {
        if (theme === 'dark') {
            htmlElement.setAttribute('data-theme', 'dark');
            themeIcon.textContent = icons.dark;
        } else {
            htmlElement.removeAttribute('data-theme');
            themeIcon.textContent = icons.light;
        }

        localStorage.setItem('theme', theme);
    }

    // Переключить тему
    function toggleTheme() {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
    }

    // Инициализация: применить сохраненную или системную тему
    const initialTheme = getSavedTheme();
    applyTheme(initialTheme);

    // Обработчик клика по кнопке
    themeToggle.addEventListener('click', toggleTheme);

    // Следить за изменением системных настроек (опционально)
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            // Только если пользователь еще не выбрал тему вручную
            if (!localStorage.getItem('theme')) {
                applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
})();
