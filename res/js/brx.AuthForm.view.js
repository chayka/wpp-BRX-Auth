(function( $, _ ) {
//    $.widgetTemplated( "brx.authForm", $.brx.form, {
    _.declare( "brx.AuthForm", $.brx.FormView, {
 
        
        // These options will be used as defaults
        nlsNamespace: 'brx.AuthForm',
        
        options: { 
            template: null,
            elementAsTemplate: true,
            screen: null,
            key: null,
            login: null,
            popup: false,
            validEmails: {},
            validNames: {},
            wpnonce: '',
            screens:{},
            titleLocation: 'screen',
            fb: null
        },

        
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
            this.inputs('name').keyup($.proxy(function(event){
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
            this.getWindow();
            if(this.get('popup')){
                this.getWindow().open();
            }
            
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
            $( document ).on( "click", 'a[href*="/wp-login.php?action=changepassword"], a[href*="#change-password"]', $.proxy(function(event){
                event.preventDefault();
                this.openChangePasswordScreen();
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
            $(document).bind('authForm.login', $.proxy(this.openLoginScreen, this));
            $(document).bind('authForm.join', $.proxy(this.openJoinScreen, this));
            $(document).bind('authForm.forgotPassword', $.proxy(this.openForgotPasswordScreen, this));
            $(document).bind('authForm.changePassword', $.proxy(this.openChangePasswordScreen, this));
            

            this.showScreen(this.get('screen'));
            
            $.brx.Ajax.addErrorHandler('authform', $.proxy(this.handleApiError, this));
            
            this.getFB();
        },
        
        getFB: function(){
            if(!this.get('fb') && window.FB){
                // Here we subscribe to the auth.authResponseChange JavaScript event. This event is fired
                // for any authentication related change, such as login, logout or session refresh. This means that
                // whenever someone who was previously logged out tries to log in again, the correct case below 
                // will be handled. 
                window.FB.Event.subscribe('auth.authResponseChange', $.proxy(this.fbStatusChanged, this));
                this.set('fb', window.FB);
            }
            return this.get('fb');
        },
        
        isLoggedIn: function(){
            return parseInt($.wp.currentUser.id)>0;
        },
        
        getWindow: function(){
            if(!this.get('window')){
                var w = $.brx.Modals.create(this.$el, {
//                var w = $.brx.Modals.create('', {
//                    css:{
//                        width: '450px'
//                    }
                });
                this.set('window', w);
            }
            
            return this.get('window');
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
        
        showScreen: function(screen){
            this.getFB();
            this.clearForm();
            screen = screen || 'login';
            for(id in this.get('screens')){
                this.get('screens')[id].hide();
            }
            this.clearMessage();
            var screenBox = this.get('screens')[screen];
            screenBox.show();
            var firstInput = screenBox.find('input[type=text]')[0];
            console.dir({'firstInput':firstInput});
            
            var canChangePw = !_.empty(this.get('key'));
            
            this.option('linksBox').css('display', 'logout' === screen?'none':'block');
            this.option('links').login.css('display', 'login' === screen?'none':'inline');
            this.option('links').join.css('display', 'join' === screen?'none':'inline');
            this.option('links').forgotPassword.css('display', canChangePw || 'forgotPassword' === screen?'none':'inline');
            this.option('links').changePassword.css('display', !canChangePw || 'changePassword' === screen?'none':'inline');
            this.option('buttons').join.css('display', 'join' === screen?'inline':'none');
            this.option('buttons').login.css('display', 'login' === screen?'inline':'none');
            this.option('buttons').sendCode.css('display', 'forgotPassword' === screen?'inline':'none');
            this.option('buttons').resetPassword.css('display', 'changePassword' === screen && !this.isLoggedIn()?'inline':'none');
            this.option('buttons').changePassword.css('display', 'changePassword' === screen && this.isLoggedIn()?'inline':'none');
            this.fields('passwordOld').css('display', 'changePassword' === screen && this.isLoggedIn()?'block':'none');
            this.option('buttonLogout').css('display', 'logout' === screen?'inline':'none');
            this.option('screen',  screen);
            this.option('linksBox').css('display', this.isLoggedIn()?'none':'block');
            if(this.get('titleLocation') === 'header'){
//                this.getTemplate().data('dialog').option('title', screenBox.attr('screen-title'));
                this.getWindow().set('title', screenBox.attr('screen-title'));
                this.getWindow().render();
                screenBox.find('h2').hide();
            }else{
//                this.getTemplate().data('dialog').option('title', this.nls('header_default'));
                this.getWindow().set('title', this.nls('header_default'));
                screenBox.find('h2').show();
            }
            $(firstInput).focus();

        },
        
        showSocialLogin: function(){
            this.get('socialBox').show();
        },
        
        
        showLoginScreen: function(event){
            if(window.FB){
                window.FB.XFBML.parse(this.el);
            }
            this.showScreen('login');
        },
        
        openLoginScreen: function(event){
//            this.getTemplate().dialog('open');
            this.getWindow().open();
            this.showLoginScreen();
//            this.showModal();
        },
        
        showJoinScreen: function(event){
            this.showScreen('join');
        },
        
        openJoinScreen: function(event){
//            this.getTemplate().dialog('open');
            this.getWindow().open();
            this.showJoinScreen();
//            this.showModal();
        },
        
        showForgotPasswordScreen: function(event){
            this.showScreen('forgotPassword');
        },
        
        openForgotPasswordScreen: function(event){
//            this.getTemplate().dialog('open');
            this.getWindow().open();
            this.showForgotPasswordScreen();
//            this.showModal();
        },
        
        showChangePasswordScreen: function(event){
            this.showScreen('changePassword');
        },
        
        openChangePasswordScreen: function(event){
//            this.getTemplate().dialog('open');
            this.getWindow().open();
            this.showChangePasswordScreen();
//            this.showModal();
        },
        
        showLogoutScreen: function(event){
            this.showScreen('logout');
        },
        
        openLogoutScreen: function(event){
            this.getWindow().open();
            this.showLogoutScreen();
//            this.getTemplate().dialog('open');
//            this.showModal();
        },
        
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
            return (event !== undefined 
                || this.checkRequired('name'))
//                && this.checkRegexp('name')
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
        
        processErrors: function(errors){
            for(key in errors){
                var errorMessage = errors[key];
                var field = 'messageBox';
                switch(key){
                    // login
//                    case '*empty_username':
                    case 'invalid_username':
                        field = 'email1';
                        break;
                    case 'empty_password':
                    case 'incorrect_password':
                    case 'authentication_failed':
                        field = 'password';
                        break;
                    // join
                    case 'empty_email':
                    case 'email_exists':
                        field = 'email2';
                        break;
                    case 'empty_username':
                    case 'name_exists':
                    case 'username_exists':
//                    case '*authentication_failed':
                        field = 'name';
                        break;
                }
                if(field!=='messageBox'){
                    this.setFormFieldStateError(field, errorMessage );
                }else{
                    this.setMessage(errorMessage, true);
                }
            }
            
        },
        
        
        
        buttonLoginClicked: function(event){
            console.info('sss');
            event.preventDefault();
            if(this.checkLoginForm()){
                this.setFormFieldStateClear('email1');
                this.setFormFieldStateClear('password');
                this.disableInputs();
                this.getSpinner().show(this.nls('message_spinner_sign_in'));
                
                this.ajax('/api/auth/login',{
                    data: {
                        log: this.inputs('email1').val(),
                        pwd: this.inputs('password').val()
                    },
                    spinner: false,
                    showMessage: false,
                    errorMessage: this.nls('message_error_auth_failed'),
                    success: $.proxy(function(data){
                        console.dir({'data': data});
                        this.setMessage(this.nls('message_welcome'));//'Вход выполнен, добро пожаловать!');
                        $.brx.utils.loadPage();
                    }, this),
                    complete: $.proxy(function(){
                        this.enableInputs();
                        this.getSpinner().hide($.proxy(this.showMessage, this));
                    }, this)
                });
                
            }
        },
        
        buttonJoinClicked: function(event) {
            event.preventDefault();
            if(this.checkJoinForm()){
                this.setFormFieldStateClear('email2');
                this.setFormFieldStateClear('name');
                this.disableInputs();
                this.getSpinner().show(this.nls('message_spinner_sign_up'));//'Выполняется регистрация...');
                
                this.ajax('/api/auth/join', {
                    data:{
                        email: this.inputs('email2').val(),
                        login: this.inputs('name').val()
                    },
                    spinner: false,
                    showMessage: false,
                    errorMessage: this.nls('message_error_sign_up_failed'),
                    success: $.proxy(function(data){
                        console.dir({'data': data});
                        this.showLoginScreen();
                        this.setMessage(this.nls('message_signed_up'));//'Регистрация прошла успешно, вам отправлено письмо, содержащие пароль, для входа на сайт.')
                    },this),
                    complete: $.proxy(function(data){
                        this.enableInputs();
                        this.getSpinner().hide($.proxy(this.showMessage, this));
                    },this)
                });
                
            }
        },
        
        buttonSendCodeClicked: function(event) {
            event.preventDefault();
            if(this.checkForgotPasswordForm()){
                this.setFormFieldStateClear('email3');
                this.disableInputs();
                this.getSpinner().show(this.nls('message_spinner_validating_email'));//'Проверка адреса e-mail...');
                
                this.ajax('/api/auth/forgot-password', {
                    data:{
                        email: this.inputs('email3').val()
                    },
                    spinner: false,
                    showMessage: false,
                    errorMessage: this.nls('message_error_password_recovery'),
                    success: $.proxy(function(data){
                        console.dir({'data': data});
                        this.setMessage(this.nls('message_change_pass_code_sent'));//'Вам отправлено письмо со ссылкой для смены пароля. Чтобы сменить пароль, перейдите по ссылке в письме.');
                    },this),
                    complete: $.proxy(function(data){
                        this.enableInputs();
                        this.getSpinner().hide($.proxy(this.showMessage, this));
                    },this)
                });
                
            }
        },
        
        buttonResetPasswordClicked: function(event) {
            event.preventDefault();
            if(this.checkChangePasswordForm()){
                this.setFormFieldStateClear('password1');
                this.setFormFieldStateClear('password2');
                this.disableInputs();
                this.getSpinner().show(this.nls('message_spinner_reset_password'));//'Смена пароля...');
                
                this.ajax('/api/auth/reset-password', {
                    data:{
                        key: this.get('key'),
                        login: this.get('login'),
                        pass1: this.inputs('password1').val(),
                        pass2: this.inputs('password2').val()
                    },
                    spinner: false,
                    showMessage: false,
                    errorMessage: this.nls('message_error_wrong_code'),
                    success: $.proxy(function(data){
                        console.dir({'data': data});
                        this.option('key',  null);
                        this.option('login',  null);
                        this.setMessage(this.nls('message_password_set_signing_in'));//'Пароль изменен, выполняется вход');
                        $.brx.utils.loadPage();
                    },this),
                    complete: $.proxy(function(data){
                        this.enableInputs();
                        this.getSpinner().hide($.proxy(this.showMessage, this));
                    },this)                    
                });
                
            }
        },
        
        buttonChangePasswordClicked: function(event) {
            event.preventDefault();
            if(this.checkChangePasswordForm()){
                this.setFormFieldStateClear('password1');
                this.setFormFieldStateClear('password2');
                this.disableInputs();
                this.getSpinner().show(this.nls('message_spinner_change_password'));//'Смена пароля...');
                
                this.ajax('/api/auth/change-password', {
                    data:{
                        pass: this.inputs('passwordOld').val(),
                        pass1: this.inputs('password1').val(),
                        pass2: this.inputs('password2').val()
                    },
                    spinner: false,
                    showMessage: false,
                    errorMessage: this.nls('message_error_change_password'),
                    success: $.proxy(function(data){
                        console.dir({'data': data});
                        this.getWindow().close();
                        $.brx.Modals.alert(this.nls('message_password_changed'));
//                        $.brx.modalAlert(this.nls('message_password_changed'));//'Пароль изменен');
//                        this.getTemplate().dialog('close');
                    },this),
                    complete: $.proxy(function(data){
                        this.enableInputs();
                        this.getSpinner().hide($.proxy(this.showMessage, this));
                    },this)
                });
                
            }
        },
        
        buttonLogoutClicked: function() {
            
            if(this.getFB() && this.getFBuserId() && !this.get('fb_not_authorized')){
                this.getFB().logout();
            }
            
            if(true){
                this.disableInputs();
                this.getSpinner().show(this.nls('message_spinner_signout'));//'Выполняется выход...');
                
                this.ajax('/api/auth/logout', {
                    data:{
                        _wpnonce: this.get('wpnonce')
                    },
                    spinner: false,
                    showMessage: false,
                    errorMessage: this.nls('message_error_signing_out'),
                    success:$.proxy(function(data){
                        console.dir({'data': data});
                        this.setMessage(this.nls('message_signed_out'));//'Выход выполнен, до новых встреч!');
                        $.brx.utils.loadPage();
                    },this),
                    complete: $.proxy(function(data){
                        this.enableInputs();
                        this.getSpinner().hide($.proxy(this.showMessage, this));
                    },this)
                });
                
            }
        },
        
        checkEmailExists: function(event){
            var email = this.inputs('email2').val();
            if(email){
                if(this.get('validEmails')[email] === 1){
                    return true;
                }else if(this.get('validEmails')[email] === 0){
                    this.setFormFieldStateError('email2', this.nls('message_error_email_exists'));//'Этот e-mail уже зарегистрирован.')
                    return false;
                }else{
                    this.setFormFieldStateClear('email2');
                    
                    this.ajax('/api/auth/check-email', {
                        data:{
                            email: email
                        },
                        spinner: this.getSpinner(),
                        spinnerMessage: this.nls('message_spinner_validating_email'),
                        success: $.proxy(function(data){
                            console.dir({'data': data});
                            var email = this.inputs('email2').val();
                            if(data.payload.email === email){
                                if(0 === data.code){
                                    console.info('Email ' + email + ' available');
                                }else{
                                    this.processErrors($.brx.Ajax.handleErrors(data));
                                }
                            }
                            this.options.validEmails[data.payload.email] = data.code === 0?1:0;
                        },this)
                    });
                    
                    return false;
                }
            }
        },
        
        checkNameExists: function(){
            var login = this.inputs('name').val();
            if(login && this.checkRegexp('name')){
                if(this.get('validNames')[login] === 1){
                    return true;
                }else if(this.get('validNames')[login] === 0){
                    this.setFormFieldStateError('name', this.nls('message_error_username_exists'));//'Это имя пользователя уже зарегистрировано.')
                    return false;
                }else{
                    this.setFormFieldStateClear('name');
                    
                    this.ajax('/api/auth/check-name', {
                        data:{
                            login: login
                        },
                        spinner: this.getSpinner(),
                        spinnerMessage: this.nls('message_spinner_validating_name'),
                        success: $.proxy(function(data){
                            console.dir({'data': data});
                            var login = this.inputs('name').val();
                            if(data.payload.login === login){
                                if(0 === data.code){
                                    console.info('Name '+login+' available');
                                }else{
                                    this.processErrors($.brx.Ajax.handleErrors(data));
                                }
                            }
                            this.options.validNames[data.payload.login] = data.code === 0?1:0;
                        },this)
                    });
                    
                    return false;
                }
            }
            
            return false;
        },
        
        
        buttonCloseClicked: function(event){
            this.getWindow().close();
//            this.getTemplate().dialog('close');
//            this.hideModal();
        },
        
        refresh: function(){
            
        },

        
        handleApiError: function(code, message){
            switch(code){
                case 'auth_required':
                    message = message || 
                    this.nls('message_auth_required');//'Для выполнения данной операции необходимо авторизоваться на сайте';
                    $.brx.Modals.show({
                        content: message,
                        title: this.nls('dialog_title_auth_required'),
                        buttons: [
                            {text: this.nls('button_stay_anonymous')/*'Продолжить анонимно'*/, click: function(){
                            }},
                            {text: this.nls('button_sign_up')/*'Зарегистрироваться'*/, click: function(){
                                    $(document).trigger('authForm.join');
                            }},
                            {text: this.nls('button_sign_in')/*'Войти'*/, click: function(){
                                    $(document).trigger('authForm.login');
                            }}
                        ]
                    });
                    return true;
                case 'permission_required':
                    message = message || 
                    this.nls('message_permission_required');//'У вас недостаточно прав для выполнения данной операции';
                    $.brx.Modals.alert(message);
//                    $.brx.modalAlert(message);
                    return true;
                case 'reputation_required':
                    break;
            }
            return false;
        }, 
        
        getFBuserId: function(){
            return $.wp.currentUser.get('meta.fb_user_id');
        },

        onFacebookLoginButtonClicked: function(event){
            event.preventDefault();
            var fb = this.getFB();
            if(fb){
                fb.getLoginStatus($.proxy(this.fbStatusChanged, this));
            }
        },
        
        fbStatusChanged: function(response) {
            // Here we specify what we do with the response anytime this event occurs. 
            if (response.status === 'connected') {
                // The response object is returned with a status field that lets the app know the current
                // login status of the person. In this case, we're handling the situation where they 
                // have logged in to the app.
                // testAPI();
                this.getFBuserId() !== response.authResponse.userID && this.onFBlogin(response);
            } else if (response.status === 'not_authorized') {
                // In this case, the person is logged into Facebook, but not into the app, so we call
                // FB.login() to prompt them to do so. 
                // In real-life usage, you wouldn't want to immediately prompt someone to login 
                // like this, for two reasons:
                // (1) JavaScript created popup windows are blocked by most browsers unless they 
                // result from direct interaction from people using the app (such as a mouse click)
                // (2) it is a bad experience to be continually prompted to login upon page load.
//                FB.login();
                this.set('fb_not_autorized', true);
                this.getFBuserId() && this.buttonLogoutClicked();
            } else {
                // In this case, the person is not logged into Facebook, so we call the login() 
                // function to prompt them to do so. Note that at this stage there is no indication
                // of whether they are logged into the app. If they aren't then they'll see the Login
                // dialog right after they log in to Facebook. 
                // The same caveats as above apply to the FB.login() call here.
                this.set('fb_not_autorized', true);
                this.getFBuserId() && this.buttonLogoutClicked();
//                FB.login();
            }
        },
        
        onFBlogin: function(FBResponse){
            console.dir({FBResponse: FBResponse});
            this.getSpinner().show(this.nls('message_spinner_signout'));//'Выполняется выход...');
            return; 
            this.ajax('/api/auth/fb-login', {
                data: FBResponse.authResponse,
                spinner: false,
                showMessage: false,
                errorMessage: this.nls('message_error_signing_out'),
                success:$.proxy(function(data){
                    console.dir({'data': data});
                    this.setMessage(this.nls('message_signed_out'));//'Выход выполнен, до новых встреч!');
//                    $.brx.utils.loadPage();
                },this),
                complete: $.proxy(function(data){
                    this.enableInputs();
                    this.getSpinner().hide($.proxy(this.showMessage, this));
                },this)
            });

        },
        
        // Use the destroy method to clean up any modifications your widget has made to the DOM
        destroy: function() {
            // In jQuery UI 1.8, you must invoke the destroy method from the base widget
//            $.Widget.prototype.destroy.call( this );
        // In jQuery UI 1.9 and above, you would define _destroy instead of destroy and not call the base method
        }
    });
}( jQuery, _ ) );
