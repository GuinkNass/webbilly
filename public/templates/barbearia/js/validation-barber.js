$(document).ready(function () {

    $('#contact_form').on('submit', function (e) {

        e.preventDefault();

        let error = false;

        const name    = $('#name').val().trim();
        const email   = $('#email').val().trim();
        const phone   = $('#phone').val().trim();
        const service = $('#service').val();
        const date    = $('#date').val();
        const time    = $('#time').val();

        $('.error_input').removeClass('error_input');

        if (name === '') {
            $('#name').addClass('error_input');
            error = true;
        }

        if (email === '' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            $('#email').addClass('error_input');
            error = true;
        }

        if (phone === '') {
            $('#phone').addClass('error_input');
            error = true;
        }

        if (!service) {
            $('#service').addClass('error_input');
            error = true;
        }

        if (date === '') {
            $('#date').addClass('error_input');
            error = true;
        }

        if (time === '') {
            $('#time').addClass('error_input');
            error = true;
        }

        if (!error) {

            $('#send_message')
                .prop('disabled', true)
                .val('Sending...');

            $.ajax({
                url: 'booking-barber.php',
                type: 'POST',
                data: $('#contact_form').serialize(),
                success: function (result) {

                    result = $.trim(result);

                    if (result === 'sent') {

                        $('#contact_form').trigger('reset');
                        $('#success_message').fadeIn(500);
                        $('#error_message').hide();

                    } else {

                        $('#error_message').fadeIn(500);
                    }

                    $('#send_message')
                        .prop('disabled', false)
                        .val('Book Appointment');
                },
                error: function () {

                    $('#error_message').fadeIn(500);

                    $('#send_message')
                        .prop('disabled', false)
                        .val('Book Appointment');
                }
            });

        }

    });

});