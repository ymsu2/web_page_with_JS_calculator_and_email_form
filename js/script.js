$(document).ready(function() {
    // Данные для калькулятора
    const fuelPrices = {
        petrol: 500200,
        gas: 200100,
        diesel: 320700
    };

    const brands = {
        petrol: ['Роснефть', 'Татнефть', 'Лукойл'],
        gas: ['Shell', 'Газпром', 'Башнефть'],
        diesel: ['Татнефть', 'Лукойл']
    };

    const services = [
        'Доставка', 'Хранение', 'Страхование', 'Консультация',
        'Монтаж', 'Обслуживание', 'Ремонт', 'Гарантия'
    ];

    const tariffDiscounts = {
        economy: 3,
        selected: 5,
        premium: 7
    };

    const promoDiscounts = {
        economy: [2, 5],
        selected: [5, 20],
        premium: [20, 50]
    };

    // Инициализация
    initCalculator();

    function initCalculator() {
        updateBrands();
        updateServices();
        updatePromoButtons();
        updateMaxThroughput();
        calculateResults();
        
        // События
        $('#region').on('change', function() {
            updateMaxThroughput();
            calculateResults();
        });

        $('#throughput').on('input', function() {
            $('#throughput-value').text($(this).val());
            updateTariff();
            calculateResults();
        });

        $('input[name="fuelType"]').on('change', function() {
            updateBrands();
            updateTariff();
            updatePromoButtons();
            calculateResults();
        });

        $('input[name="tariff"]').on('change', function() {
            updatePromoButtons();
            calculateResults();
        });

        $('#order-btn').on('click', function() {
            updateModalData();
            $('#orderModal').modal('show');
        });

        $('#submit-order').on('click', submitOrder);

        // Валидация в реальном времени
        $('#inn').on('input', function() {
            validateInn($(this));
        });

        $('#phone').on('input', function() {
            validatePhone($(this));
        });

        $('#email').on('input', function() {
            validateEmail($(this));
        });
    }

    function updateMaxThroughput() {
        const region = $('#region').val();
        let maxThroughput = 1200;
        
        switch(region) {
            case '2': maxThroughput = 800; break;
            case '3': maxThroughput = 500; break;
        }
        
        $('#throughput').attr('max', maxThroughput);
        const currentValue = parseInt($('#throughput').val());
        if (currentValue > maxThroughput) {
            $('#throughput').val(maxThroughput);
            $('#throughput-value').text(maxThroughput);
        }
    }

    function updateBrands() {
        const fuelType = $('input[name="fuelType"]:checked').val();
        const brandButtons = $('#brand-buttons');
        brandButtons.empty();
        
        brands[fuelType].forEach((brand, index) => {
            const isChecked = index === 0 ? 'checked' : '';
            brandButtons.append(`
                <input type="radio" class="btn-check" name="brand" id="brand-${index}" value="${brand}" ${isChecked}>
                <label class="btn btn-outline-primary" for="brand-${index}">${brand}</label>
            `);
        });
        
        // Перепривязываем события
        $('input[name="brand"]').on('change', calculateResults);
    }

    function updateServices() {
        const container = $('#services-container');
        container.empty();
        
        services.forEach((service, index) => {
            container.append(`
                <div class="service-item">
                    <input type="checkbox" class="btn-check" id="service-${index}" value="${service}">
                    <label class="btn btn-outline-primary" for="service-${index}">${service}</label>
                </div>
            `);
        });
        
        // Ограничение на выбор не более 4 услуг
        $('input[type="checkbox"]').on('change', function() {
            const checkedCount = $('input[type="checkbox"]:checked').length;
            if (checkedCount >= 5) {
                $(this).prop('checked', false);
                alert('Можно выбрать не более 4 дополнительных услуг');
            }
            calculateResults();
        });
    }

    function updateTariff() {
        const fuelType = $('input[name="fuelType"]:checked').val();
        const throughput = parseInt($('#throughput').val());
        
        let selectedTariff = 'economy';
        
        switch(fuelType) {
            case 'petrol':
                if (throughput >= 300) selectedTariff = 'premium';
                else if (throughput >= 100) selectedTariff = 'selected';
                break;
            case 'gas':
                if (throughput >= 700) selectedTariff = 'premium';
                else if (throughput >= 200) selectedTariff = 'selected';
                break;
            case 'diesel':
                if (throughput >= 350) selectedTariff = 'premium';
                else if (throughput >= 150) selectedTariff = 'selected';
                break;
        }
        
        $(`#${selectedTariff}`).prop('checked', true);
    }

    function updatePromoButtons() {
        const tariff = $('input[name="tariff"]:checked').val();
        const container = $('#promo-container');
        container.empty();
        
        promoDiscounts[tariff].forEach((discount, index) => {
            const isChecked = index === promoDiscounts[tariff].length - 1 ? 'checked' : '';
            container.append(`
                <div class="promo-item">
                    <input type="radio" class="btn-check" name="promo" id="promo-${index}" value="${discount}" ${isChecked}>
                    <label class="btn btn-outline-primary" for="promo-${index}">${discount}%</label>
                </div>
            `);
        });
        
        // Перепривязываем события
        $('input[name="promo"]').on('change', calculateResults);
    }

    function calculateResults() {
        const fuelType = $('input[name="fuelType"]:checked').val();
        const throughput = parseInt($('#throughput').val());
        const tariff = $('input[name="tariff"]:checked').val();
        const promoDiscount = parseInt($('input[name="promo"]:checked').val());
        
        const baseCost = fuelPrices[fuelType] * throughput;
        const tariffDiscount = tariffDiscounts[tariff];
        const totalDiscount = tariffDiscount + promoDiscount;
        
        const monthlyCost = baseCost * (1 - totalDiscount / 100);
        const monthlySaving = baseCost * (totalDiscount / 100);
        const yearlySaving = monthlySaving * 12;
        
        // Обновляем UI
        $('#monthly-cost').text(formatCurrency(monthlyCost));
        $('#total-discount').text(totalDiscount + '%');
        $('#monthly-saving').text(formatCurrency(monthlySaving));
        $('#yearly-saving').text(formatCurrency(yearlySaving));
        
        // Обновляем текст кнопки
        const tariffNames = {
            economy: 'Эконом',
            selected: 'Избранный',
            premium: 'Премиум'
        };
        $('#order-btn').text(`Заказать тариф «${tariffNames[tariff]}»`);
    }

    function updateModalData() {
        // Собираем все данные для отображения в модальном окне
        const region = $('#region option:selected').text();
        const throughput = $('#throughput').val();
        const fuelType = $('input[name="fuelType"]:checked').next('label').text();
        const brand = $('input[name="brand"]:checked').val() || 'Не выбран';
        const services = $('input[type="checkbox"]:checked').map(function() {
            return $(this).val();
        }).get();
        const tariff = $('input[name="tariff"]:checked').next('label').text();
        const promo = $('input[name="promo"]:checked').val() + '%';
        
        const monthlyCost = $('#monthly-cost').text();
        const totalDiscount = $('#total-discount').text();
        const monthlySaving = $('#monthly-saving').text();
        const yearlySaving = $('#yearly-saving').text();

        // Обновляем данные в модальном окне
        $('#modal-region').text(region);
        $('#modal-throughput').text(throughput + ' тонн');
        $('#modal-fuel-type').text(fuelType);
        $('#modal-brand').text(brand);
        $('#modal-services').text(services.length > 0 ? services.join(', ') : 'Не выбраны');
        $('#modal-tariff').text(tariff);
        $('#modal-promo').text(promo);
        $('#modal-total-discount').text(totalDiscount);
        $('#modal-monthly-cost').text(monthlyCost);
        $('#modal-monthly-saving').text(monthlySaving);
        $('#modal-yearly-saving').text(yearlySaving);
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0
        }).format(amount);
    }

    // Функции валидации
    function validateInn(input) {
        const value = input.val();
        const isValid = /^\d{12}$/.test(value);
        
        if (value && !isValid) {
            input.addClass('is-invalid');
        } else {
            input.removeClass('is-invalid');
        }
        
        return isValid;
    }

    function validatePhone(input) {
        const value = input.val();
        const isValid = /^\d{11}$/.test(value);
        
        if (value && !isValid) {
            input.addClass('is-invalid');
        } else {
            input.removeClass('is-invalid');
        }
        
        return isValid;
    }

    function validateEmail(input) {
        const value = input.val();
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        
        if (value && !isValid) {
            input.addClass('is-invalid');
        } else {
            input.removeClass('is-invalid');
        }
        
        return isValid;
    }

    function submitOrder() {
        const formData = {
            inn: $('#inn').val(),
            phone: $('#phone').val(),
            email: $('#email').val(),
            agreement: $('#agreement').is(':checked'),
            
            // Данные калькулятора
            region: $('#region option:selected').text(),
            throughput: $('#throughput').val(),
            fuelType: $('input[name="fuelType"]:checked').next('label').text(),
            brand: $('input[name="brand"]:checked').val(),
            services: $('input[type="checkbox"]:checked').map(function() {
                return $(this).val();
            }).get(),
            tariff: $('input[name="tariff"]:checked').next('label').text(),
            promo: $('input[name="promo"]:checked').val() + '%',
            monthlyCost: $('#monthly-cost').text(),
            totalDiscount: $('#total-discount').text(),
            monthlySaving: $('#monthly-saving').text(),
            yearlySaving: $('#yearly-saving').text()
        };

        // Валидация
        if (!validateForm(formData)) {
            return;
        }

        // Отправка AJAX
        $.ajax({
            url: 'php/backend.php',
            type: 'POST',
            data: formData,
            success: function(response) {
                const result = JSON.parse(response);
                if (result.success) {
                    showMessage('Спасибо! Успешно отправлено.', 'success');
                    $('#order-form')[0].reset();
                    $('.form-control').removeClass('is-invalid');
                    setTimeout(() => {
                        $('#orderModal').modal('hide');
                        $('#form-message').empty().removeClass('success error');
                    }, 2000);
                } else {
                    showMessage('Ошибка: ' + result.error, 'error');
                }
            },
            error: function() {
                showMessage('Ошибка: проблема с соединением', 'error');
            }
        });
    }

    function validateForm(data) {
        const message = $('#form-message');
        message.empty().removeClass('success error');

        let isValid = true;
        let errors = [];

        // Проверка ИНН
        if (!validateInn($('#inn'))) {
            errors.push('ИНН должен содержать ровно 12 цифр');
            isValid = false;
        }

        // Проверка телефона
        if (!validatePhone($('#phone'))) {
            errors.push('Телефон должен содержать ровно 11 цифр');
            isValid = false;
        }

        // Проверка email
        if (!validateEmail($('#email'))) {
            errors.push('Неверный формат email');
            isValid = false;
        }

        // Проверка согласия
        if (!data.agreement) {
            errors.push('Необходимо согласие с условиями');
            isValid = false;
        }

        if (!isValid) {
            showMessage('Ошибка: ' + errors.join(', '), 'error');
        }

        return isValid;
    }

    function showMessage(text, type) {
        const message = $('#form-message');
        message.text(text).addClass(type);
    }
});