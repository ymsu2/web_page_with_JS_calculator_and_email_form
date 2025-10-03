<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// Получение данных
$data = [
    'inn' => $_POST['inn'] ?? '',
    'phone' => $_POST['phone'] ?? '',
    'email' => $_POST['email'] ?? '',
    'region' => $_POST['region'] ?? '',
    'throughput' => $_POST['throughput'] ?? '',
    'fuelType' => $_POST['fuelType'] ?? '',
    'brand' => $_POST['brand'] ?? '',
    'services' => $_POST['services'] ?? [],
    'tariff' => $_POST['tariff'] ?? '',
    'promo' => $_POST['promo'] ?? '',
    'monthlyCost' => $_POST['monthlyCost'] ?? '',
    'totalDiscount' => $_POST['totalDiscount'] ?? '',
    'monthlySaving' => $_POST['monthlySaving'] ?? '',
    'yearlySaving' => $_POST['yearlySaving'] ?? ''
];

// Валидация на бэкенде
$errors = [];

// Валидация ИНН
if (!preg_match('/^\d{12}$/', $data['inn'])) {
    $errors[] = 'ИНН должен содержать ровно 12 цифр';
}

// Валидация телефона
if (!preg_match('/^\d{11}$/', $data['phone'])) {
    $errors[] = 'Телефон должен содержать ровно 11 цифр';
}

// Валидация email
if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Неверный формат email';
}

if (!empty($errors)) {
    echo json_encode(['success' => false, 'error' => implode(', ', $errors)]);
    exit;
}

// Формирование текста письма
$emailContent = "
Результаты расчета:

Регион: {$data['region']}
Прокачка: {$data['throughput']} тонн
Тип топлива: {$data['fuelType']}
Бренд: {$data['brand']}
Дополнительные услуги: " . (is_array($data['services']) ? implode(', ', $data['services']) : $data['services']) . "
Тариф: {$data['tariff']}
Промо-акция: {$data['promo']}
Стоимость топлива в месяц: {$data['monthlyCost']}
Суммарная скидка: {$data['totalDiscount']}
Экономия в месяц: {$data['monthlySaving']}
Экономия в год: {$data['yearlySaving']}

Данные клиента:
ИНН: {$data['inn']}
Телефон: {$data['phone']}
Email: {$data['email']}
";

// Отправка email (заглушка - в реальном проекте использовать mail() или PHPMailer)
$to = $data['email'];
$subject = 'Результаты расчета стоимости топлива';
$headers = 'From: calculator@example.com' . "\r\n" .
           'Content-Type: text/plain; charset=utf-8';

// В реальном проекте раскомментировать:
// if (mail($to, $subject, $emailContent, $headers)) {
if (true) { // Заглушка для демонстрации
    // Логирование успешной отправки
    error_log("Email sent to: " . $data['email']);
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => 'Ошибка отправки email']);
}
?>