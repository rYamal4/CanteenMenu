DROP TABLE IF EXISTS dish_ingredients CASCADE;
DROP TABLE IF EXISTS dishes CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS ingredients CASCADE;

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE dishes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category_id INTEGER NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    weight INTEGER,
    is_available BOOLEAN DEFAULT TRUE,
    image_url TEXT,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE ingredients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    unit VARCHAR(20) NOT NULL
);

CREATE TABLE dish_ingredients (
    dish_id INTEGER NOT NULL,
    ingredient_id INTEGER NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (dish_id, ingredient_id),
    FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE
);

INSERT INTO categories (name, description) VALUES
('Первые блюда', 'Супы, борщи, солянки'),
('Вторые блюда', 'Основные горячие блюда с гарниром'),
('Салаты', 'Холодные закуски и салаты'),
('Напитки', 'Горячие и холодные напитки'),
('Выпечка', 'Хлебобулочные и кондитерские изделия'),
('Гарниры', 'Гарниры к основным блюдам');

INSERT INTO dishes (name, category_id, description, price, weight, is_available) VALUES
('Борщ украинский', 1, 'Классический борщ со сметаной', 120.00, 300, TRUE),
('Щи из свежей капусты', 1, 'Традиционные русские щи', 100.00, 300, TRUE),
('Солянка мясная', 1, 'Солянка с мясным ассорти', 150.00, 300, TRUE),
('Суп гороховый', 1, 'Суп с копченостями', 110.00, 300, TRUE),
('Котлета по-киевски', 2, 'Куриная котлета с маслом', 180.00, 150, TRUE),
('Бефстроганов', 2, 'Говядина в сметанном соусе', 200.00, 200, TRUE),
('Рыба запеченная', 2, 'Филе рыбы с овощами', 170.00, 180, TRUE),
('Плов узбекский', 2, 'Плов с бараниной', 160.00, 250, TRUE),
('Гуляш из свинины', 2, 'Свинина в томатном соусе', 190.00, 200, TRUE),
('Салат Цезарь', 3, 'С курицей и пармезаном', 140.00, 150, TRUE),
('Салат Греческий', 3, 'С фетой и оливками', 130.00, 150, TRUE),
('Оливье', 3, 'Классический салат с майонезом', 100.00, 150, TRUE),
('Винегрет', 3, 'Овощной салат', 80.00, 150, TRUE),
('Чай черный', 4, 'Горячий чай', 20.00, 200, TRUE),
('Кофе американо', 4, 'Черный кофе', 50.00, 150, TRUE),
('Компот из сухофруктов', 4, 'Домашний компот', 30.00, 200, TRUE),
('Сок апельсиновый', 4, 'Натуральный сок', 60.00, 200, TRUE),
('Морс клюквенный', 4, 'Клюквенный морс', 40.00, 200, TRUE),
('Пирожок с капустой', 5, 'Печеный пирожок', 35.00, 80, TRUE),
('Ватрушка с творогом', 5, 'Сдобная ватрушка', 45.00, 100, TRUE),
('Булочка с маком', 5, 'Сладкая булочка', 40.00, 90, TRUE),
('Картофельное пюре', 6, 'Пюре на молоке', 50.00, 150, TRUE),
('Гречка отварная', 6, 'Гречневая каша', 45.00, 150, TRUE),
('Рис отварной', 6, 'Рис длиннозерный', 45.00, 150, TRUE),
('Макароны', 6, 'Отварные макароны', 40.00, 150, TRUE);

INSERT INTO ingredients (name, unit) VALUES
('Картофель', 'г'),
('Капуста', 'г'),
('Морковь', 'г'),
('Лук', 'г'),
('Свекла', 'г'),
('Помидор', 'г'),
('Огурец', 'г'),
('Курица', 'г'),
('Говядина', 'г'),
('Свинина', 'г'),
('Рыба', 'г'),
('Рис', 'г'),
('Гречка', 'г'),
('Макароны', 'г'),
('Молоко', 'мл'),
('Сметана', 'г'),
('Масло сливочное', 'г'),
('Сыр', 'г'),
('Яйцо', 'шт'),
('Мука', 'г'),
('Сахар', 'г'),
('Соль', 'г');

INSERT INTO dish_ingredients (dish_id, ingredient_id, quantity) VALUES
(1, 5, 100),
(1, 1, 80),
(1, 2, 80),
(1, 3, 30),
(1, 4, 30),
(1, 17, 20);

INSERT INTO dish_ingredients (dish_id, ingredient_id, quantity) VALUES
(5, 8, 150),
(5, 18, 30),
(5, 20, 1);

INSERT INTO dish_ingredients (dish_id, ingredient_id, quantity) VALUES
(10, 8, 80),
(10, 19, 30),
(10, 20, 1);

INSERT INTO dish_ingredients (dish_id, ingredient_id, quantity) VALUES
(22, 1, 150),
(22, 16, 50),
(22, 18, 20);

INSERT INTO dish_ingredients (dish_id, ingredient_id, quantity) VALUES
(23, 13, 150);

CREATE INDEX idx_dishes_category ON dishes(category_id);
CREATE INDEX idx_dishes_available ON dishes(is_available);
CREATE INDEX idx_dish_ingredients_dish ON dish_ingredients(dish_id);
CREATE INDEX idx_dish_ingredients_ingredient ON dish_ingredients(ingredient_id);
