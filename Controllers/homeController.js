exports.getIndex = (req, res) => {
    res.render('Home/Index', {
        title: 'Система управления меню столовой',
        activePage: 'home'
    });
};

exports.getAbout = (req, res) => {
    res.render('Home/About', {
        title: 'О программе',
        activePage: 'about'
    });
};
