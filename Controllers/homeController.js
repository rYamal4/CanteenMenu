// Контроллер для главных страниц приложения

// Главная страница
exports.getIndex = (req, res) => {
    res.render('Home/Index', {
        title: 'Система управления меню столовой',
        activePage: 'home'
    });
};

// Страница "О программе"
exports.getAbout = (req, res) => {
    res.render('Home/About', {
        title: 'О программе',
        activePage: 'about'
    });
};
