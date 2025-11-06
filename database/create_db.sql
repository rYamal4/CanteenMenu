-- Создание базы данных для столовой
-- База данных: canteen_db

-- Удаление таблиц если они существуют
DROP TABLE IF EXISTS dish_ingredients CASCADE;
DROP TABLE IF EXISTS dishes CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS ingredients CASCADE;

-- Таблица категорий блюд
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

-- Таблица блюд
CREATE TABLE dishes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category_id INTEGER NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    weight INTEGER, -- вес в граммах
    is_available BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Таблица ингредиентов
CREATE TABLE ingredients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    unit VARCHAR(20) NOT NULL -- единица измерения (г, мл, шт)
);

-- Связь между блюдами и ингредиентами
CREATE TABLE dish_ingredients (
    dish_id INTEGER NOT NULL,
    ingredient_id INTEGER NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (dish_id, ingredient_id),
    FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE
);

-- Вставка тестовых данных

-- Категории
INSERT INTO categories (name, description) VALUES
('Первые блюда', 'Супы, борщи, солянки'),
('Вторые блюда', 'Основные горячие блюда с гарниром'),
('Салаты', 'Холодные закуски и салаты'),
('Напитки', 'Горячие и холодные напитки'),
('Выпечка', 'Хлебобулочные и кондитерские изделия'),
('Гарниры', 'Гарниры к основным блюдам');

-- Блюда
INSERT INTO dishes (name, category_id, description, price, weight, is_available) VALUES
-- Первые блюда
('Борщ украинский', 1, 'Классический борщ со сметаной', 120.00, 300, TRUE),
('Щи из свежей капусты', 1, 'Традиционные русские щи', 100.00, 300, TRUE),
('Солянка мясная', 1, 'Солянка с мясным ассорти', 150.00, 300, TRUE),
('Суп гороховый', 1, 'Суп с копченостями', 110.00, 300, TRUE),

-- Вторые блюда
('Котлета по-киевски', 2, 'Куриная котлета с маслом', 180.00, 150, TRUE),
('Бефстроганов', 2, 'Говядина в сметанном соусе', 200.00, 200, TRUE),
('Рыба запеченная', 2, 'Филе рыбы с овощами', 170.00, 180, TRUE),
('Плов узбекский', 2, 'Плов с бараниной', 160.00, 250, TRUE),
('Гуляш из свинины', 2, 'Свинина в томатном соусе', 190.00, 200, TRUE),

-- Салаты
('Салат Цезарь', 3, 'С курицей и пармезаном', 140.00, 150, TRUE),
('Салат Греческий', 3, 'С фетой и оливками', 130.00, 150, TRUE),
('Оливье', 3, 'Классический салат с майонезом', 100.00, 150, TRUE),
('Винегрет', 3, 'Овощной салат', 80.00, 150, TRUE),

-- Напитки
('Чай черный', 4, 'Горячий чай', 20.00, 200, TRUE),
('Кофе американо', 4, 'Черный кофе', 50.00, 150, TRUE),
('Компот из сухофруктов', 4, 'Домашний компот', 30.00, 200, TRUE),
('Сок апельсиновый', 4, 'Натуральный сок', 60.00, 200, TRUE),
('Морс клюквенный', 4, 'Клюквенный морс', 40.00, 200, TRUE),

-- Выпечка
('Пирожок с капустой', 5, 'Печеный пирожок', 35.00, 80, TRUE),
('Ватрушка с творогом', 5, 'Сдобная ватрушка', 45.00, 100, TRUE),
('Булочка с маком', 5, 'Сладкая булочка', 40.00, 90, TRUE),

-- Гарниры
('Картофельное пюре', 6, 'Пюре на молоке', 50.00, 150, TRUE),
('Гречка отварная', 6, 'Гречневая каша', 45.00, 150, TRUE),
('Рис отварной', 6, 'Рис длиннозерный', 45.00, 150, TRUE),
('Макароны', 6, 'Отварные макароны', 40.00, 150, TRUE);

-- Ингредиенты
INSERT INTO ingredients (name, unit) VALUES
-- Овощи
('Картофель', 'г'),
('Капуста', 'г'),
('Морковь', 'г'),
('Лук', 'г'),
('Свекла', 'г'),
('Помидор', 'г'),
('Огурец', 'г'),
-- Мясо и рыба
('Курица', 'г'),
('Говядина', 'г'),
('Свинина', 'г'),
('Рыба', 'г'),
-- Крупы
('Рис', 'г'),
('Гречка', 'г'),
('Макароны', 'г'),
-- Молочные продукты
('Молоко', 'мл'),
('Сметана', 'г'),
('Масло сливочное', 'г'),
('Сыр', 'г'),
-- Другое
('Яйцо', 'шт'),
('Мука', 'г'),
('Сахар', 'г'),
('Соль', 'г');

-- Связь блюд с ингредиентами (примеры для некоторых блюд)

-- Борщ украинский
INSERT INTO dish_ingredients (dish_id, ingredient_id, quantity) VALUES
(1, 5, 100), -- свекла
(1, 1, 80),  -- картофель
(1, 2, 80),  -- капуста
(1, 3, 30),  -- морковь
(1, 4, 30),  -- лук
(1, 17, 20); -- сметана

-- Котлета по-киевски
INSERT INTO dish_ingredients (dish_id, ingredient_id, quantity) VALUES
(5, 8, 150),  -- курица
(5, 18, 30),  -- масло сливочное
(5, 20, 1);   -- яйцо

-- Салат Цезарь
INSERT INTO dish_ingredients (dish_id, ingredient_id, quantity) VALUES
(10, 8, 80),  -- курица
(10, 19, 30), -- сыр
(10, 20, 1);  -- яйцо

-- Картофельное пюре
INSERT INTO dish_ingredients (dish_id, ingredient_id, quantity) VALUES
(22, 1, 150),  -- картофель
(22, 16, 50),  -- молоко
(22, 18, 20);  -- масло сливочное

-- Гречка отварная
INSERT INTO dish_ingredients (dish_id, ingredient_id, quantity) VALUES
(23, 13, 150); -- гречка

-- Создание индексов для ускорения запросов
CREATE INDEX idx_dishes_category ON dishes(category_id);
CREATE INDEX idx_dishes_available ON dishes(is_available);
CREATE INDEX idx_dish_ingredients_dish ON dish_ingredients(dish_id);
CREATE INDEX idx_dish_ingredients_ingredient ON dish_ingredients(ingredient_id);
