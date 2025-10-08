🚀 Быстрый запуск
1. Установите Docker и Docker Compose

Скачать Docker Desktop

Проверьте:

docker compose version

2. Поднимите контейнеры

В корне проекта выполните:

docker-compose up -d


Это создаст два сервиса:

web — PHP 8.3 + Apache

db — MariaDB 11 с базой demo_contact

3. Инициализируйте базу данных
docker-compose exec -T db sh -lc 'mariadb -uapp -papp demo_contact' < init.sql


Проверка:

docker-compose exec db sh -lc 'mariadb -uapp -papp -e "USE demo_contact; SHOW TABLES;"'


Ожидаемый результат:

+------------------------+
| Tables_in_demo_contact |
+------------------------+
| contact_requests       |
+------------------------+

4. Откройте сайт

Перейдите в браузере:

http://localhost:8089

Admin panel http://localhost:8089/admin/index.php

login: admin
password: sesadmin123