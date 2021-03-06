(function( $ ) {
//    $.widgetTemplated( "brx.authForm", $.brx.form, {
    $.widget( "brx.authForm", $.brx.form, {
 
//        _parentPrototype: $.ui.templated.prototype,
        
        // These options will be used as defaults
        options: { 
//            templatePath: "jquery.brx.authForm.html",
            template: null,
            elementAsTemplate: true,
            screen: null,
            activationKey: null,
            activationLogin: null,
            popup: false,
            validEmails: {},
            validNames: {},
            wpnonce: '',
            screens:{},
            nlsNamespace:'brx.authForm',
            titleLocation: 'screen'
//            uiFramework: 'bootstrap'
        },

        
        // Set up the widget
        _create: function() {
//            this._super('_create');
            $.brx.form.prototype._create.apply( this, arguments );
            console.log('brx.authForm._create');
//            this.option()
            this.set('screen', this.element.attr('screen'));
            this.set('activationKey',  this.element.attr('key'));
            this.set('activationLogin',  this.element.attr('login'));
            this.set('popup',  !$.brx.utils.empty(this.element.attr('popup')) || this.popup);
            
            this._initTemplated();
            
//            $('a').hide();
        },
        
 
        // Use the _setOption method to respond to changes to options
//        _setOption: function( key, value ) {
//            console.dir({'brx.authForm._setOption':{key:key, value:value}});
//            switch( key ) {
//                default:
//            }
// 
//            // In jQuery UI 1.8, you have to manually invoke the _setOption method from the base widget
//            $.ui.templated.prototype._setOption.apply( this, arguments );
//            // In jQuery UI 1.9 and above, you use the _super method instead
////            this._super( "_setOption", key, value );
//            $.brx.form.prototype._setOption.apply( this, arguments );
//        },
        
        postCreate: function(){
            console.dir({'authForm.postCreate': this});
            if(this.getSpinner()){
                this.getSpinner().getTemplate()
                    .css('display', 'inline-block');
                this.getSpinner().getTemplate().hide();
            }
            
            
            this.initField('email1');
            this.inputs('email1').blur($.proxy(
                this.checkLoginEmailField, this));
            this.inputs('email1').focus($.proxy(function(){
                this.setFormFieldStateClear('email1');
            }, this));
//            this.inputs('email1').placeholder({'text':'Введите ваш email...'});

            this.initField('password');
            this.inputs('password').blur($.proxy(
                this.checkPasswordField, this));
            this.inputs('password').focus($.proxy(function(){
                this.setFormFieldStateClear('password');
            }, this));
//            this.inputs('password').placeholder({'text':'Введите ваш пароль...'});

            this.initField('email2');
            this.inputs('email2').blur($.proxy(
                this.checkJoinEmailField, this));
            this.inputs('email2').focus($.proxy(function(){
                this.setFormFieldStateClear('email2');
            }, this));

            this.initField('name');
            this.inputs('name').blur($.proxy(
                this.checkNameField, this));
            this.inputs('name').focus($.proxy(function(){
                this.setFormFieldStateClear('name');
            }, this));
            this.inputs('name').keypress($.proxy(function(event){
                $.brx.utils.delayedCall('name-check', 500, $.proxy(this.checkNameExists, this));
            }, this));
            
            this.initField('email3');
            this.inputs('email3').blur($.proxy(
                this.checkForgotPasswordEmailField, this));
            this.inputs('email3').focus($.proxy(function(){
                this.setFormFieldStateClear('email3');
            }, this));

            this.initField('passwordOld');
            this.inputs('passwordOld').blur($.proxy(
                this.checkPasswordOldField, this));
            this.inputs('passwordOld').focus($.proxy(function(){
                this.setFormFieldStateClear('passwordOld');
            }, this));

            this.initField('password1');
            this.inputs('password1').blur($.proxy(
                this.checkPassword1Field, this));
            this.inputs('password1').focus($.proxy(function(){
                this.setFormFieldStateClear('password1');
            }, this));

            this.initField('password2');
            this.inputs('password2').blur($.proxy(
                this.checkPassword2Field, this));
            this.inputs('password2').focus($.proxy(function(){
                this.setFormFieldStateClear('password2');
            }, this));

            console.dir({
                'labels': this.options.labels, 
                'inputs': this.options.inputs,
                'hints': this.options.hints
            });

            
            this.getTemplate().dialog({
                autoOpen: this.get('popup'),
//                height: 410,
                width: 'auto',
                modal: true,
                resizable: false,
                open: $.proxy(function(){
                    this.clearForm();
                }, this)
            });
            if(!this.get('popup')){
                this.getTemplate().dialog('close');
            }
//            this.modal({
////                height: 410,
//                width: 410,
//                show: false,
//                title: "Авторизация"
//            });
            
            this.getTemplate().show();
//            $('a[href*="/wp-login.php"], a[href*="#login"]', document).click($.proxy(function(event){
            $( document ).on( "click", 'a[href*="/wp-login.php"], a[href*="#login"]', $.proxy(function(event){
                event.preventDefault();
                this.openLoginScreen();
            }, this));
//            $('a[href*="/wp-login.php?action=register"], a[href*="#join"]', document).click($.proxy(function(event){
            $( document ).on( "click", 'a[href*="/wp-login.php?action=register"], a[href*="#join"]', $.proxy(function(event){
                event.preventDefault();
                this.openJoinScreen();
            }, this));
//            $('a[href*="/wp-login.php?action=lostpassword"], a[href*="#forgot-password"]', document).click($.proxy(function(event){
            $( document ).on( "click", 'a[href*="/wp-login.php?action=lostpassword"], a[href*="#forgot-password"]', $.proxy(function(event){
                event.preventDefault();
                this.openForgotPasswordScreen();
            }, this));
//            $('a[href*="/wp-login.php?action=logout"], a[href*="#logout"]', document).click($.proxy(function(event){
            $( document ).on( "click", 'a[href*="/wp-login.php?action=logout"], a[href*="#logout"]', $.proxy(function(event){
                event.preventDefault();
                console.info('logout submited');
                var pat = /_wpnonce=([\w\d]*)/;
                var href = $(event.currentTarget).attr('href');
                console.dir({event:event, href: href, pat: pat.exec(href)});
                this.option('wpnonce',  pat.test(href)?pat.exec(href)[1]:'');
                this.openLogoutScreen('logout');
            }, this));
            $(document).bind('authForm.login', $.proxy(this.openLoginScreen, this))
            $(document).bind('authForm.join', $.proxy(this.openJoinScreen, this))
            $(document).bind('authForm.forgotPassword', $.proxy(this.openForgotPasswordScreen, this))
            $(document).bind('authForm.changePassword', $.proxy(this.openChangePasswordScreen, this))
            

            this.showScreen(this.get('screen'));
            
            $.brx.utils.addErrorHandler('authform', $.proxy(this.handleApiError, this));
            
            
        },
        
        isLoggedIn: function(){
            return parseInt(window.currentUser.ID||$.wp.currentUser.id)>0;
        },
        
        
        disableInputs: function(event){
            $.brx.form.prototype.disableInputs(event);
            $.brx.form.prototype.disableButtons(event);
        },
        
        enableInputs: function(event){
            $.brx.form.prototype.enableInputs(event);
            $.brx.form.prototype.enableButtons(event);
        },
        
        getMessageBox: function(){
            return this.option('messageBox');
        },
        
        getSpinner: function(){
            return this.option('spinner');
        },
        
        setMessage: function(message, isError){
            this.getMessageBox().html(message);
            if(isError){
                this.getMessageBox().removeClass('ui-state-highlight');
                this.getMessageBox().addClass('ui-state-error');
            }else{
                this.getMessageBox().removeClass('ui-state-error');
                this.getMessageBox().addClass('ui-state-highlight');
            }
        },
        
        clearMessage: function(){
            this.getMessageBox().text('').hide();
//            this.getMessageBox().dialog('close');
        },
        
        
        showMessage: function(timeout){
            if(this.getMessageBox().text()){
                this.getMessageBox().show('fade', {}, 200, timeout?$.proxy(
                    function(){
                        set_timeout( this.hideMessage, timeout);
                    }, this):null);
            }
        },
        
        hideMessage: function(){
            this.getMessageBox().hide('fade', {}, 200);
        },
        
        clearMessage: function(){
            this.getMessageBox().text('').hide();
        },
        
        showScreen: function(screen){
            this.clearForm();
            screen = screen || 'login';
            for(id in this.get('screens')){
                this.get('screens')[id].hide();
            }
            this.clearMessage();
            var screenBox = this.get('screens')[screen];
            screenBox.show();
            
            var canChangePw = !$.brx.utils.empty(this.get('activationKey'));
            
            this.option('linksBox').css('display', 'logout' == screen?'none':'block');
            this.option('links').login.css('display', 'login' == screen?'none':'inline');
            this.option('links').join.css('display', 'join' == screen?'none':'inline');
            this.option('links').forgotPassword.css('display', canChangePw || 'forgotPassword' == screen?'none':'inline');
            this.option('links').changePassword.css('display', !canChangePw || 'changePassword' == screen?'none':'inline');
            this.option('buttons').join.css('display', 'join' == screen?'inline':'none');
            this.option('buttons').login.css('display', 'login' == screen?'inline':'none');
            this.option('buttons').sendCode.css('display', 'forgotPassword' == screen?'inline':'none');
            this.option('buttons').resetPassword.css('display', 'changePassword' == screen && !this.isLoggedIn()?'inline':'none');
            this.option('buttons').changePassword.css('display', 'changePassword' == screen && this.isLoggedIn()?'inline':'none');
            this.fields('passwordOld').css('display', 'changePassword' == screen && this.isLoggedIn()?'block':'none');
            this.option('buttonLogout').css('display', 'logout' == screen?'inline':'none');
            this.option('screen',  screen);
            this.option('linksBox').css('display', this.isLoggedIn()?'none':'block');
            var height = 410;
            switch(screen){
                case 'login':
                    height = 390;
                    break;
                case 'join':
                    height = 390;
                    break;
                case 'forgotPassword':
                    height = 390;
                    break;
                case 'changePassword':
                    height = 400;
                    break;
                case 'logout':
                    height = 220;
                    break;
            }
//            if(this.get('uiFramework') == 'jQueryUI'){
//                if(this.getTemplate().data('dialog').isOpen()){
//                    this.getTemplate().data('dialog').close();
//                    this.getTemplate().data('dialog').option('height', height);
//                    this.getTemplate().data('dialog').open();
//                }else{
//                    this.getTemplate().data('dialog').option('height', height);
//                }
//                
//            }
            if(this.get('titleLocation') == 'header'){
                this.getTemplate().data('dialog').option('title', screenBox.attr('screen-title'));
                screenBox.find('h2').hide();
            }else{
                this.getTemplate().data('dialog').option('title', this.nls('header_default'));
                screenBox.find('h2').show();
            }

        },
        
        showLoginScreen: function(event){
            this.showScreen('login');
        },
        
        openLoginScreen: function(event){
            this.showLoginScreen();
            this.getTemplate().dialog('open');
//            this.showModal();
        },
        
        showJoinScreen: function(event){
            this.showScreen('join');
        },
        
        openJoinScreen: function(event){
            this.showJoinScreen();
            this.getTemplate().dialog('open');
//            this.showModal();
        },
        
        showForgotPasswordScreen: function(event){
            this.showScreen('forgotPassword');
        },
        
        openForgotPasswordScreen: function(event){
            this.showForgotPasswordScreen();
            this.getTemplate().dialog('open');
//            this.showModal();
        },
        
        showChangePasswordScreen: function(event){
            this.showScreen('changePassword');
        },
        
        openChangePasswordScreen: function(event){
            this.showChangePasswordScreen();
            this.getTemplate().dialog('open');
//            this.showModal();
        },
        
        showLogoutScreen: function(event){
            this.showScreen('logout');
        },
        
        openLogoutScreen: function(event){
            this.showLogoutScreen();
            this.getTemplate().dialog('open');
//            this.showModal();
        },
        
//        checkEmail: function (fieldName, errorMessage){
//            errorMessage = errorMessage ;//|| "Неверный формат (образец: master@potroydom.by)";
//            return $.brx.form.prototype.checkEmail.apply(this, [fieldName, errorMessage]);
////            return this.checkRegexp( fieldName, /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i, errorMessage );
//        },
        checkLoginEmailField: function(event){
            var email = this.inputs('email1').val();
            return (event !== undefined || this.checkRequired('email1'))
                && (email && this.checkEmail('email1'));
					;
        },
        
        checkPasswordField: function(event){
            return event !== undefined || this.checkRequired('password');
        },
        
        checkJoinEmailField: function(event){
            var email = this.inputs('email2').val();
            return (event !== undefined || this.checkRequired('email2'))
                && (email && this.checkEmail('email2'))
                && this.checkEmailExists();
            
        },
        
        checkNameField: function(event){
            return (event !== undefined || this.checkRequired('name'))
                && this.checkNameExists();
        },
        
        checkForgotPasswordEmailField: function(event){
            var email = this.inputs('email3').val();
            return (event !== undefined || this.checkRequired('email3'))
                && (email && this.checkEmail('email3'));
					;
        },
        
        checkPasswordOldField: function(event){
            var pass = this.inputs('passwordOld').val();
            return (event !== undefined || this.checkRequired('passwordOld'));
        },
        
        checkPassword1Field: function(event){
            var pass = this.inputs('password1').val();
            return (event !== undefined || this.checkRequired('password1'))
                && (pass && this.checkPassword('password1', 7));
        },
        
        checkPassword2Field: function(event){
            var pass = this.inputs('password2').val();
            return (event !== undefined || this.checkRequired('password2'))
                && (pass && this.checkPasswordMatch('password1', 'password2'));
        },
        
        checkLoginForm: function(event){
            var valid = this.checkLoginEmailField(event);
                valid = this.checkPasswordField(event) && valid;
            return valid;
        },
        
        checkJoinForm: function(event){
            var valid = this.checkJoinEmailField(event);
                valid = this.checkNameField(event) && valid;
            return valid;
        },
        
        checkForgotPasswordForm: function(event){
            var valid = this.checkForgotPasswordEmailField(event);
            return valid;
            
        },
        
        checkChangePasswordForm: function(event){
            var valid = this.checkPassword1Field(event);
                valid = this.checkPassword2Field(event) && valid;
                valid = (!this.isLoggedIn() || this.checkPasswordOldField(event)) && valid;
            return valid;
            
        },
        
        processLoginErrors: function(errors){
            for(key in errors){
                var errorMessage = errors[key];
                var field = 'messageBox';
                switch(key){
                    case 'empty_username':
                    case 'invalid_username':
                        field = 'email1';
                        break;
                    case 'empty_password':
                    case 'incorrect_password':
                    case 'authentication_failed':
                        field = 'password';
                        break;
                }
                if(field!='messageBox'){
                    this.setFormFieldStateError(field, errorMessage );
                }else{
                    this.setMessage(errorMessage, true);
                }
            }
        },
        
        processJoinErrors: function(errors){
            for(key in errors){
                var errorMessage = errors[key];
                var field = 'messageBox';
                switch(key){
                    case 'empty_email':
                    case 'email_exists':
                        field = 'email2';
                        break;
                    case 'empty_username':
                    case 'name_exists':
                    case 'authentication_failed':
                    default:
                        field = 'name';
                        break;
                }
                if(field!='messageBox'){
                    this.setFormFieldStateError(field, errorMessage );
                }else{
                    this.setMessage(errorMessage,true);
                }
            }
        },
        
        processForgotPasswordErrors: function(errors){
            for(key in errors){
                var errorMessage = errors[key];
                var field = 'messageBox';

                if(field!='messageBox'){
                    this.setFormFieldStateError(field, errorMessage );
                }else{
                    this.setMessage(errorMessage, true);
                }
            }
        },
        
        processChangePasswordErrors: function(errors){
            for(key in errors){
                var errorMessage = errors[key];
                var field = 'messageBox';
                if(field!='messageBox'){
                    this.setFormFieldStateError(field, errorMessage );
                }else{
                    this.setMessage(errorMessage, true);
                }
            }
        },
        
        buttonLoginClicked: function(event){
            event.preventDefault();
            if(this.checkLoginForm()){
                this.setFormFieldStateClear('email1');
                this.setFormFieldStateClear('password');
                this.clearMessage();
                this.getSpinner().show(this.nls('message_spinner_sign_in'));
                this.disableInputs();
                $.ajax('/api/auth/login', {
                    data:{
                        log: this.inputs('email1').val(),
                        pwd: this.inputs('password').val()
                    },
                    dataType: 'json',
                    type: 'post'
                })
                
                .done($.proxy(function(data){
                    console.dir({'data': data});
                    if(0 == data.code){
                        this.setMessage(this.nls('message_welcome'));//'Вход выполнен, добро пожаловать!');
//                        window.location = window.location;
                        $.brx.utils.loadPage()
                    }else{
                        this.processLoginErrors($.brx.utils.handleErrors(data));
                    }
                },this))
                
                .fail($.proxy(function(response){
                    var message = $.brx.utils.processFail(response) 
                        || this.nls('message_error_auth_failed');//'Ошибка: вход не выполнен';
                    this.setMessage(message, true);
                },this))

                .always($.proxy(function(){
                   this.getSpinner().hide($.proxy(this.showMessage, this));
                    this.enableInputs();
                },this));
            }
        },
        
        buttonJoinClicked: function(event) {
            event.preventDefault();
            if(this.checkJoinForm()){
                this.setFormFieldStateClear('email2');
                this.setFormFieldStateClear('name');
                this.clearMessage();
                this.getSpinner().show(this.nls('message_spinner_sign_up'));//'Выполняется регистрация...');
                this.disableInputs();
                $.ajax('/api/auth/join', {
                    data:{
                        email: this.inputs('email2').val(),
                        login: this.inputs('name').val()
                    },
                    dataType: 'json',
                    type: 'post'
                })
                
                .done($.proxy(function(data){
                    console.dir({'data': data});
                    if(0 == data.code){
                        this.showLoginScreen();
                        this.setMessage(this.nls('message_signed_up'));//'Регистрация прошла успешно, вам отправлено письмо, содержащие пароль, для входа на сайт.')
                        console.info('User registered');
                    }else{
                        this.processJoinErrors($.brx.utils.handleErrors(data));
                    }
                },this))
                
                .fail($.proxy(function(response){
                    var message = $.brx.utils.processFail(response) 
                        || this.nls('message_error_sign_up_failed');//'Ошибка: регистрация не выполнена';
                    this.setMessage(message, true);
                },this))

                .always($.proxy(function(){
                    this.getSpinner().hide($.proxy(this.showMessage, this));
                    this.enableInputs();
                },this));
            }
        },
        
        buttonSendCodeClicked: function(event) {
            event.preventDefault();
            if(this.checkForgotPasswordForm()){
                this.setFormFieldStateClear('email3');
                this.getSpinner().show(this.nls('message_spinner_validating_email'));//'Проверка адреса e-mail...');
                this.disableInputs();
                this.clearMessage();
                $.ajax('/api/auth/forgot-password', {
                    data:{
                        email: this.inputs('email3').val()
                    },
                    dataType: 'json',
                    type: 'post'
                })
                
                .done($.proxy(function(data){
                    console.dir({'data': data});
                    if(0 == data.code){
                        console.info('Code sent');
                        this.setMessage(this.nls('message_change_pass_code_sent'));//'Вам отправлено письмо со ссылкой для смены пароля. Чтобы сменить пароль, перейдите по ссылке в письме.');
                    }else{
                        this.processForgotPasswordErrors($.brx.utils.handleErrors(data));
                    }
                },this))
                
                .fail($.proxy(function(response){
                    var message = $.brx.utils.processFail(response) 
                        || this.nls('message_error_password_recovery');//'Ошибка восстановления пароля';
                    this.setMessage(message, true);
                },this))

                .always($.proxy(function(){
                    this.getSpinner().hide($.proxy(this.showMessage, this));
                    this.enableInputs();
                   
                },this));
            }
        },
        
        buttonResetPasswordClicked: function(event) {
            event.preventDefault();
            if(this.checkChangePasswordForm()){
                this.setFormFieldStateClear('password1');
                this.setFormFieldStateClear('password2');
                this.clearMessage();
                this.getSpinner().show(this.nls('message_spinner_reset_password'));//'Смена пароля...');
                this.disableInputs();
                $.ajax('/api/auth/reset-password', {
                    data:{
                        key: this.get('activationKey'),
                        login: this.get('activationLogin'),
                        pass1: this.inputs('password1').val(),
                        pass2: this.inputs('password2').val()
                    },
                    dataType: 'json',
                    type: 'post'
                })
                
                .done($.proxy(function(data){
                    console.dir({'data': data});
                    if(0 == data.code){
                        console.info('Password changed');
                        this.option('activationKey',  null);
                        this.option('activationLogin',  null);
//                        this.showLoginScreen();
//                        this.setMessage('Пароль изменен, теперь вы можете войти с новым паролем.');
                        this.setMessage(this.nls('message_password_set_signing_in'));//'Пароль изменен, выполняется вход');
                        $.brx.utils.loadPage()
                        
                    }else{
                        this.processChangePasswordErrors($.brx.utils.handleErrors(data));
                    }
                },this))
                
                .fail($.proxy(function(response){
                    var message = $.brx.utils.processFail(response) 
                        || this.nls('message_error_wrong_code');//'Неверный код активации, пройдите процедуру восстановления пароля еще раз';
                    this.setMessage(message, true);
                    this.option('activationKey',  null);
                    this.option('activationLogin',  null);
                    this.showForgotPasswordScreen();
//                    this.setMessage('Неверный код активации, пройдите процедуру восстановления пароля еще раз.',true);
                },this))

                .always($.proxy(function(){
                    this.getSpinner().hide($.proxy(this.showMessage, this));
                    this.enableInputs();
                   
                },this));
            }
        },
        
        buttonChangePasswordClicked: function(event) {
            event.preventDefault();
            if(this.checkChangePasswordForm()){
                this.setFormFieldStateClear('password1');
                this.setFormFieldStateClear('password2');
                this.clearMessage();
                this.getSpinner().show(this.nls('message_spinner_change_password'));//'Смена пароля...');
                this.disableInputs();
                $.ajax('/api/auth/change-password', {
                    data:{
                        pass: this.inputs('passwordOld').val(),
                        pass1: this.inputs('password1').val(),
                        pass2: this.inputs('password2').val()
                    },
                    dataType: 'json',
                    type: 'post'
                })
                
                .done($.proxy(function(data){
                    console.dir({'data': data});
                    if(0 == data.code){
                        console.info('Password changed');
//                        this.setMessage('Пароль изменен, теперь вы можете войти с новым паролем.');
                        this.getSpinner().hide();
                        $.brx.modalAlert(this.nls('message_password_changed'));//'Пароль изменен');
                        this.getTemplate().dialog('close');
//                        this.hideModal();
                    }else{
                        this.processChangePasswordErrors($.brx.utils.handleErrors(data));
                    }
                },this))
                
                .fail($.proxy(function(response){
                    var message = $.brx.utils.processFail(response) 
                        || this.nls('message_error_change_password');//'Ошибка смены пароля';
                    this.setMessage(message, true);
                },this))

                .always($.proxy(function(){
                    this.getSpinner().hide($.proxy(this.showMessage, this));
                    this.enableInputs();
                   
                },this));
            }
        },
        
        buttonLogoutClicked: function() {
            if(true){
                this.clearMessage();
                this.getSpinner().show(this.nls('message_spinner_signout'));//'Выполняется выход...');
                this.disableInputs();
                $.ajax('/api/auth/logout', {
                    data:{
                        _wpnonce: this.get('wpnonce')
                    },
                    dataType: 'json',
                    type: 'post'
                })
                
                .done($.proxy(function(data){
                    console.dir({'data': data});
                    if(0 == data.code){
                        this.setMessage(this.nls('message_signed_out'));//'Выход выполнен, до новых встреч!');
//                        window.location = ''+window.location;
                        $.brx.utils.loadPage();
                    }else{
                        this.processLoginErrors($.brx.utils.handleErrors(data));
                    }
                },this))
                
                .fail($.proxy(function(response){
                    var message = $.brx.utils.processFail(response) 
                        || this.nls('message_error_signing_out');//'Ошибка: выход не выполнен';
                    this.setMessage(message, true);
                },this))

                .always($.proxy(function(){
                   this.getSpinner().hide($.proxy(this.showMessage, this));
                    this.enableInputs();
                },this));
            }
        },
        
        checkEmailExists: function(event){
            var email = this.inputs('email2').val();
            if(email){
                if(this.get('validEmails')[email] == 1){
                    return true;
                }else if(this.get('validEmails')[email] == 0){
                    this.setFormFieldStateError('email2', this.nls('message_error_email_exists'));//'Этот e-mail уже зарегистрирован.')
                    return false;
                }else{
                    this.setFormFieldStateClear('email2');
                    this.clearMessage();
                    this.getSpinner().show(this.nls('message_spinner_validating_email'));//'Проверка адреса...');
                    $.ajax('/api/auth/check-email', {
                        data:{
                            email: email
                        },
                        dataType: 'json',
                        type: 'post'
                    })

                    .done($.proxy(function(data){
                        console.dir({'data': data});
                        var email = this.inputs('email2').val();
                        if(data.payload.email == email){
                            if(0 == data.code){
                                console.info('Email ' + email + ' available');
                            }else{
                                this.processJoinErrors($.brx.utils.handleErrors(data));
                            }
                        }
                        this.options.validEmails[data.payload.email] = data.code == 0?1:0;
                    },this))

                    .fail($.proxy(function(){
                    },this))

                    .always($.proxy(function(){
                       this.getSpinner().hide($.proxy(this.showMessage, this));
                    },this));
                    
                    return false
                }
            }
        },
        
        checkNameExists: function(){
            var login = this.inputs('name').val();
            if(login){
                if(this.get('validNames')[login] == 1){
                    return true;
                }else if(this.get('validNames')[login] == 0){
                    this.setFormFieldStateError('name', this.nls('message_error_username_exists'));//'Это имя пользователя уже зарегистрировано.')
                    return false;
                }else{
                    this.setFormFieldStateClear('name');
                    this.clearMessage();
                    this.getSpinner().show(this.nls('message_spinner_validating_name'));//'Проверка имени...');
                    $.ajax('/api/auth/check-name', {
                        data:{
                            login: login
                        },
                        dataType: 'json',
                        type: 'post'
                    })

                    .done($.proxy(function(data){
                        console.dir({'data': data});
                        var login = this.inputs('name').val();
                        if(data.payload.login == login){
                            if(0 == data.code){
                                console.info('Name '+login+' available');
                            }else{
                                this.processJoinErrors($.brx.utils.handleErrors(data));
                            }
                        }
                        this.options.validNames[data.payload.login] = data.code == 0?1:0;
                    },this))

                    .fail($.proxy(function(){
                    },this))

                    .always($.proxy(function(){
                       this.getSpinner().hide($.proxy(this.showMessage, this));
                    },this));
                    return false;
                }
            }
        },
        
        
        buttonCloseClicked: function(event){
            this.getTemplate().dialog('close');
//            this.hideModal();
        },
        
        refresh: function(){
            
        },

        
        handleApiError: function(code, message){
            switch(code){
                case 'auth_required':
                    message = message || 
                    this.nls('message_auth_required');//'Для выполнения данной операции необходимо авторизоваться на сайте';
                    $.brx.modalDialog(message, {
                        title: this.nls('dialog_title_auth_required'),//'Требуется авторизация',
                        buttons: [
                            {text: this.nls('button_stay_anonymous')/*'Продолжить анонимно'*/, click: function(){
//                                    $(this).dialog('close');
                            }},
                            {text: this.nls('button_sign_up')/*'Зарегистрироваться'*/, click: function(){
                                    $(document).trigger('authForm.join');
//                                    $(this).dialog('close');
                            }},
                            {text: this.nls('button_sign_in')/*'Войти'*/, click: function(){
                                    $(document).trigger('authForm.login');
//                                    $(this).dialog('close');
                            }}
                        ],
                        width: 400
                    });
                    return true;
                case 'permission_required':
                    message = message || 
                    this.nls('message_permission_required');//'У вас недостаточно прав для выполнения данной операции';
                    $.brx.modalAlert(message);
                    return true;
                case 'reputation_required':
                    break;
            }
            return false;
        },        
        
        // Use the destroy method to clean up any modifications your widget has made to the DOM
        destroy: function() {
            // In jQuery UI 1.8, you must invoke the destroy method from the base widget
//            $.Widget.prototype.destroy.call( this );
        // In jQuery UI 1.9 and above, you would define _destroy instead of destroy and not call the base method
        }
    });
}( jQuery ) );
