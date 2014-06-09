<?php

/**
 * Description of UserController
 *
 * @author borismossounov
 */
require_once 'application/helpers/EmailHelper_wpp_BRX_Auth.php';

require_once 'facebook-php-sdk-v4/src/Facebook/FacebookSDKException.php';
require_once 'facebook-php-sdk-v4/src/Facebook/FacebookRequestException.php';
require_once 'facebook-php-sdk-v4/src/Facebook/FacebookAuthorizationException.php';
require_once 'facebook-php-sdk-v4/src/Facebook/FacebookCanvasLoginHelper.php';
require_once 'facebook-php-sdk-v4/src/Facebook/FacebookClientException.php';
require_once 'facebook-php-sdk-v4/src/Facebook/FacebookHttpable.php';
require_once 'facebook-php-sdk-v4/src/Facebook/FacebookCurl.php';
require_once 'facebook-php-sdk-v4/src/Facebook/FacebookCurlHttpClient.php';
require_once 'facebook-php-sdk-v4/src/Facebook/FacebookJavaScriptLoginHelper.php';
require_once 'facebook-php-sdk-v4/src/Facebook/FacebookOtherException.php';
require_once 'facebook-php-sdk-v4/src/Facebook/FacebookPageTabHelper.php';
require_once 'facebook-php-sdk-v4/src/Facebook/FacebookPermissionException.php';
require_once 'facebook-php-sdk-v4/src/Facebook/FacebookRedirectLoginHelper.php';
require_once 'facebook-php-sdk-v4/src/Facebook/FacebookRequest.php';
require_once 'facebook-php-sdk-v4/src/Facebook/FacebookResponse.php';
require_once 'facebook-php-sdk-v4/src/Facebook/FacebookServerException.php';
require_once 'facebook-php-sdk-v4/src/Facebook/FacebookSession.php';
require_once 'facebook-php-sdk-v4/src/Facebook/FacebookThrottleException.php';
require_once 'facebook-php-sdk-v4/src/Facebook/GraphObject.php';
require_once 'facebook-php-sdk-v4/src/Facebook/GraphAlbum.php';
require_once 'facebook-php-sdk-v4/src/Facebook/GraphLocation.php';
require_once 'facebook-php-sdk-v4/src/Facebook/GraphSessionInfo.php';
require_once 'facebook-php-sdk-v4/src/Facebook/GraphUser.php';
use Facebook\FacebookSession;
use Facebook\FacebookRequest;
use Facebook\GraphObject;
use Facebook\GraphUser;
use Facebook\FacebookRequestException;

class wpp_BRX_Auth_AuthController extends Zend_Controller_Action{

    public function init(){
        Util::turnRendererOff();
        NlsHelper::setNlsDir(WPP_BRX_AUTH_PATH.'nls');
        NlsHelper::load('controllers/auth');
        
    }

    public function checkEmailAction(){
        $email = InputHelper::getParam("email");
        
        $errors = new WP_Error();
        if (email_exists($email)) {
            $errors->add('email_exists', NlsHelper::_('error_email_exists'));
        }        
        $payload = array('email' => $email);
        if ($errors->get_error_code()){
            $this->outputErrors($errors, $payload, 200);
        }else{
            JsonHelper::respond($payload);;
        }
    }
    
    public function checkNameAction(){
        $login = InputHelper::getParam("login");
        
        $errors = new WP_Error();
        if (username_exists($login)) {
            $errors->add('username_exists', NlsHelper::_('error_username_exists'));
        }
        $payload = array('login' => $login);
        if ($errors->get_error_code()){
            $this->outputErrors($errors, $payload, 200);
        }else{
            JsonHelper::respond($payload);
        }
    }
    
    public function joinAction(){
        if(BlockadeHelper::isBlocked()){
            JsonHelper::respondError(NlsHelper::_('error_site_blocked'), 'error_site_blocked');
        }
        $email = InputHelper::getParam("email");
        $login = InputHelper::getParam("login");
        $password = InputHelper::getParam("password", wp_generate_password(12, false));
        
        $errors = new WP_Error();

        $sanitized_user_login = sanitize_user($login);
        $email = apply_filters('user_registration_email', $email);

        // Check the username
        if ($sanitized_user_login == '') {
            $errors->add('empty_username', NlsHelper::_('error_empty_username'));
        } elseif (!validate_username($login)) {
            $errors->add('invalid_username', NlsHelper::_('error_invalid_username'));
            $sanitized_user_login = '';
        } elseif (username_exists($sanitized_user_login)) {
            $errors->add('username_exists', NlsHelper::_('error_username_exists'));
        }

        // Check the e-mail address
        if ($email == '') {
            $errors->add('empty_email', NlsHelper::_('error_empty_email'));
        } elseif (!is_email($email)) {
            $errors->add('invalid_email', NlsHelper::_('error_invalid_email'));
            $email = '';
        } elseif (email_exists($email)) {
            $errors->add('email_exists', NlsHelper::_('error_email_exists'));
        }

        do_action('register_post', $sanitized_user_login, $email, $errors);

        $errors = apply_filters('registration_errors', $errors, $sanitized_user_login, $email);

        if (!$errors->get_error_code()){
            $user_pass = $password;//wp_generate_password(12, false);
            $user_id = wp_create_user($sanitized_user_login, $user_pass, $email);
            if ($user_id){
                update_user_option($user_id, 'default_password_nag', true, true); //Set up the Password change nag.
                update_user_option($user_id, 'show_admin_bar_front', false, true); //
                
//                wp_new_user_notification($user_id, $user_pass);

                $user = UserModel::selectById($user_id);
                EmailHelper_wpp_BRX_Auth::userRegistered($user, $user_pass);
                JsonHelper::respond($user);
            }else{
                $errors->add('register_fail', NlsHelper::_('error_register_fail', get_option('admin_email')));
            }

        }
        if ($errors->get_error_code()){
            $this->outputErrors($errors);
        }
        
    }
    
    public function loginAction(){
//        echo "d";
        $errors = new WP_Error();
	$secure_cookie = '';

        $email = InputHelper::getParam('log');
        $pass = InputHelper::getParam('pwd');
        $rememberme = InputHelper::getParam('rememberme');
        $login = '';
//            echo "e: $email|$pass";
        if($email){
            $user = get_user_by('email', $email);
//            print_r($user);
            $login = $user? $user->user_login: $email;
//            echo "login $login";
        }
	// If the user wants ssl but the session is not ssl, force a secure cookie.
	if (!empty($email) && !force_ssl_admin()) {
            if ($user) {
                if (get_user_option('use_ssl', $user->ID)) {
                    $secure_cookie = true;
                    force_ssl_admin(true);
                }
            }
        }
	$reauth = empty($_REQUEST['reauth']) ? false : true;
        // Clear any stale cookies.
        if ( $reauth ){
            wp_clear_auth_cookie();
        }

	// If the user was redirected to a secure login form from a non-secure admin page, and secure login is required but secure admin is not, then don't use a secure
	// cookie and redirect back to the referring non-secure admin page.  This allows logins to always be POSTed over SSL while allowing the user to choose visiting
	// the admin via http or https.
	if ( !$secure_cookie && is_ssl() && force_ssl_login() && !force_ssl_admin() && ( 0 !== strpos($redirect_to, 'https') ) && ( 0 === strpos($redirect_to, 'http') ) ){
		$secure_cookie = false;
        }
	$user = wp_signon(array(
            'user_login'=>$login, 
            'user_password'=>$pass, 
            'rememberme'=>$rememberme), $secure_cookie);
        if(BlockadeHelper::isBlocked() && (!$user || is_wp_error($user) || !in_array('administrator', $user->roles))){
            JsonHelper::respondError(NlsHelper::_('error_site_blocked'), 'error_site_blocked');
        }

 	if ( !is_wp_error($user)) {
            $user = UserModel::unpackDbRecord($user);
            JsonHelper::respond($user);
	}else{

            $errors = $user;
            $this->outputErrors($errors);

        }
    }
    
    public function fbLoginAction(){
        $accessToken = InputHelper::getParam('accessToken');
        $expiresIn = InputHelper::getParam('expiresIn');
        $signedRequest = InputHelper::getParam('signedRequest');
        $userID = InputHelper::getParam('userID');
        
        
        FacebookSession::setDefaultApplication('155736051299351', '4b425360929f7f729c4866cc5d36b77c');
        $session = new FacebookSession($accessToken);

        // Get the GraphUser object for the current user:
        $me = null;
        $avatarFnShort = null;
        try {
          $me = (new FacebookRequest(
            $session, 'GET', '/me'
          ))->execute()->getGraphObject(GraphUser::className());
//          echo $me->getName();
//          echo $me->getId();
          Util::print_r($me);
          
          $picture = (new FacebookRequest(
            $session, 'GET', '/me/picture?redirect=false&width=160&height=160'
          ))->execute()->getGraphObject(GraphObject::className());
          Util::print_r($picture);
          $pictureData = $picture->asArray();
          $pictureUrl = Util::getItem($pictureData, 'url');
          $isSilhouette = Util::getItem($pictureData, 'is_silhouette');
          $uploadDirs = wp_upload_dir();
          Util::print_r($uploadDirs);
          $avatarsDir = $uploadDirs['basedir'].'/avatars';
          is_dir($avatarsDir) || mkdir($avatarsDir, 0777, true);
          $avatarFnShort = $userID."@facebook.com.".  FileSystem::extension($pictureUrl);
          echo $avatarFn = $avatarsDir.'/'.$avatarFnShort;
          
          file_exists($avatarFn) && FileSystem::delete($avatarFn);
          CurlHelper::download($avatarFn, $pictureUrl);
        } catch (FacebookRequestException $e) {
          // The Graph API returned an error
        } catch (\Exception $e) {
          // Some other error occurred
        }
        
        if($me && $me->getId() == $userID){
            $user = UserModel::query()
                    ->metaQuery('fb_user_id', $userID)
                    ->selectOne();
            if(!$user){
                $user = new UserModel();
                $wpUserId = 
                    $user->setLogin('fb'.$userID)
                        ->setEmail($userID."@facebook.com")
                        ->setDisplayName($me->getName())
                        ->setFirstName($me->getFirstName())
                        ->setLastName($me->getLastName())
                        ->setPassword(wp_generate_password(12, false))
                        ->insert();
                if($wpUserId){
                    $user->updateMeta('fb_user_id', $userID);
                    $user->updateMeta('avatar', $avatarFnShort);
                }
            }
            JsonHelper::respond($user);
        }
        
        JsonHelper::respond(array(
            'accessToken' => $accessToken,
            'expiresIn' => $expiresIn,
            'signedRequest' => $signedRequest,
            'userID' => $userID,
        ));
    }
    
    public function logoutAction(){
        $errors = new WP_Error();
//	check_admin_referer('log-out');
	$adminurl = strtolower(admin_url());
	$referer = strtolower(wp_get_referer());
	$result = isset($_REQUEST["_wpnonce"]) ? wp_verify_nonce($_REQUEST["_wpnonce"], 'log-out') : false;
//        echo $result .': '.wp_verify_nonce($_REQUEST["_wpnonce"], 'logout');
	if ( false && !$result && !(strpos($referer, $adminurl) === 0) ) {
            $errors->add('nonce_not_found',sprintf( __( "Do you really want to <a href='%s'>log out</a>?"), wp_logout_url() ));
            $this->outputErrors($errors);
	}else{
            wp_logout();
            JsonHelper::respond();
            exit();
        }
        
    }
    
    public function forgotPasswordAction(){
        global $wpdb, $current_site;

        $errors = new WP_Error();
        
        $loginOrEmail = InputHelper::getParam('email');
        $user_data = null;
        
        if (empty($loginOrEmail)) {
            $errors->add('empty_email_or_username', NlsHelper::_('error_empty_email_or_username'));
        } else if (strpos($loginOrEmail, '@')) {
            $user_data = get_user_by('email', trim($loginOrEmail));
        } else {
            $login = trim($loginOrEmail);
            $user_data = get_user_by('login', $login);
        }
        if (!$user_data) {
            $errors->add('invalid_combo', NlsHelper::_('error_invalid_combo'));
        }

        if ($errors->get_error_code()){
            $this->outputErrors($errors);
        }

        // redefining user_login ensures we return the right case in the email
        $user_login = $user_data->user_login;
        $user_email = $user_data->user_email;

        do_action('retrieve_password', $user_login);

        $allow = apply_filters('allow_password_reset', true, $user_data->ID);

        if (!$allow){
            $errors->add('no_password_reset', NlsHelper::_('error_no_password_reset'));
        }else if (is_wp_error($allow)){
            $errors = $allow;
        }
        if ($errors->get_error_code()){
            $this->outputErrors($errors);
        }
        
        $key = $wpdb->get_var($wpdb->prepare("SELECT user_activation_key FROM $wpdb->users WHERE user_login = %s", $user_login));
        if (empty($key)) {
            // Generate something random for a key...
            $key = wp_generate_password(20, false);
            do_action('retrieve_password_key', $user_login, $key);
            // Now insert the new md5 key into the db
            $wpdb->update($wpdb->users, array('user_activation_key' => $key), array('user_login' => $user_login));
        }
        
        $user = UserModel::selectByLogin($user_data->user_login);
//        print_r($user);
        EmailHelper_wpp_BRX_Auth::forgotPassword($user, $key);

        if ($errors->get_error_code()){
            $this->outputErrors($errors);
        }
        
        JsonHelper::respond();
    }

    public function resetPasswordAction(){
        Util::turnRendererOn();
        $key = InputHelper::getParam('key');
        $login = InputHelper::getParam('login');
	$user = UserModel::checkActivationKey($key, $login);
	$errors = '';

	if ( is_wp_error($user) ) {
//            wp_redirect( site_url('wp-login.php?action=lostpassword&error=invalidkey') );
//            exit;
            $errors = $user;
	}

        $pass1 = InputHelper::getParam('pass1');
        $pass2 = InputHelper::getParam('pass2');

	if ( $pass1 && $pass2){ 
            Util::turnRendererOff();
            if( $pass1 != $pass2 ) {
		$errors = new WP_Error('passwords_mismatch', NlsHelper::_('error_passwords_mismatch'));
                $this->outputErrors($errors);
            } else{
                $user->changePassword($pass1);
                unset($_SESSION['activationkey']);
                unset($_SESSION['activationlogin']);
                unset($_SESSION['activationpopup']);
                wp_signon(array(
                    'user_login' => $user->getLogin(),
                    'user_password' => $pass1 
                ));
                EmailHelper_wpp_BRX_Auth::newPassword($user, $pass1);
                session_commit();
                JsonHelper::respond();
            }
	}

	wp_enqueue_script('utils');
	wp_enqueue_script('user-profile');
        $this->login = $login;
        $this->key = $key;
        $this->errors = $errors;
    }
    
    public function changePasswordAction(){
        Util::turnRendererOff();
        $pass = InputHelper::getParam('pass');
	$user = UserModel::selectById(get_current_user_id());
        if(!$user->checkPassword($pass)){
            $errors = new WP_Error('invalid_password', NlsHelper::_('error_invalid_password'));
            $this->outputErrors($errors);
        }
        
        $pass1 = InputHelper::getParam('pass1');
        $pass2 = InputHelper::getParam('pass2');

        if ( $pass1 && $pass2){ 
            if( $pass1 != $pass2 ) {
                $errors = new WP_Error('passwords_mismatch', NlsHelper::_('error_passwords_mismatch'));
                $this->outputErrors($errors);
            } else{
                $user->changePassword($pass1);
                wp_signon(array(
                    'user_login' => $user->getLogin(),
                    'user_password' => $pass1 
                ));
                EmailHelper_wpp_BRX_Auth::newPassword($user, $pass1);
//                $user->checkPassword($pass1);
                JsonHelper::respond();
            }
        }
        $errors = new WP_Error('passwords_required', NlsHelper::_('error_passwords_required'));
        $this->outputErrors($errors);
    }
    
    public function outputErrors(WP_Error $errors, $payload = array(), $httpResponseCode = 400){
        foreach($errors->errors as $code => $error){
            $newMessage = preg_replace('%<strong>[^<]*</strong>:\s*%m', '', $errors->get_error_message($code));
            switch($code){
                    case 'incorrect_password':
                        $newMessage = NlsHelper::_('error_invalid_password');
                        break;
                    case 'username_exists':
                        $newMessage = NlsHelper::_('error_username_exists');
                        break;
                    case 'email_exists':
                        $newMessage = NlsHelper::_('error_email_exists');
                        break;
                    case 'invalid_username':
                        $newMessage = NlsHelper::_('error_invalid_combo');
                        break;
                    case 'empty_username':
                    case 'empty_password':
                    case 'authentication_failed':
                        break;
                    default:
            }
            if($newMessage){
                $errors->errors[$code] = array($newMessage);
            }
        }
        
        JsonHelper::respondErrors($errors, $payload, $httpResponseCode);
    }

}
