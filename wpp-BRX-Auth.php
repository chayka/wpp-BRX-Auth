<?php

/*
  Plugin Name: wpp-BRX-Auth
  Plugin URI: http://AnotherGuru.me/
  Description: Well-made jQuery authentification form.
  Version: 1.0
  Author: Boris Mossounov
  Author URI: http://facebook.com/mossounov
  License: GPL2
 */

/*
register_activation_hook( __FILE__, 'wpp_BRX_Auth_checkDependencies' );
 
function wpp_BRX_Auth_checkDependencies()
{
  require_once( ABSPATH . '/wp-admin/includes/plugin.php' );
 
  if ( is_plugin_active( 'wpp-ZF-Core/wpp-ZF-Core.php' ) )
  {
    require_once ( WP_PLUGIN_DIR . '/wpp-ZF-Core/wpp-ZF-Core.php' );
  }
  else
  {
     // deactivate dependent plugin
    deactivate_plugins( __FILE__);
    //   throw new Exception('Requires another plugin!');
   //  exit();
    exit ('Requires another plugin!');
   }
}

require_once ( WP_PLUGIN_DIR . '/wpp-ZF-Core/wpp-ZF-Core.php' );
if(!defined('ZF_CORE_PATH')){
    echo " [no core] ";
  if ( is_plugin_active( 'wpp-ZF-Core/wpp-ZF-Core.php' ) ){
    echo " [is active] ";
    require_once ( WP_PLUGIN_DIR . '/wpp-ZF-Core/wpp-ZF-Core.php' );
  }else{
    echo " [not active] ";
      return; throw new Exception('ZF COre plugin requred', 1);
  }
    
}
*/
//define( 'WPP_BRX_AUTH_PATH', plugin_dir_path(__FILE__) );
//define( 'WPP_BRX_AUTH_URL', preg_replace('%^[\w\d]+\:\/\/[\w\d\.]+%', '',plugin_dir_url(__FILE__)) );

//require_once 'application/helpers/UrlHelper_wpp_BRX_Auth.php';
require_once 'application/helpers/OptionHelper_wpp_BRX_Auth.php';
//require_once 'widgets-wpp_BRX_Auth.php';

//ZF_Query::registerApplication('WPP_BRX_AUTH', WPP_BRX_AUTH_PATH.'application', 
//        array('auth'));
//require_once 'application/helpers/UrlHelper_wpp_BRX_Auth.php';

class wpp_BRX_Auth extends WpPlugin {
    const NLS_DOMAIN = "wpp_BRX_Auth";
    protected static $instance = null;
    
    public static function init() {
        self::$instance = $auth = new wpp_BRX_Auth(__FILE__, array('auth'));
        $auth->addSupport_ConsolePages();
        return self::$instance;
    }

    /**
     * 
     * @return wpp_BRX_Auth
     */
    public static function getInstance() {
        return self::$instance;
    }

    public static function baseUrl() {
        echo self::getInstance()->getBaseUrl();
    }

    public function registerCustomPostTypes() {

    }

    public function registerTaxonomies(){

    }

    public function registerResources($minimize = false){
//        NlsHelper::setCurrentPlugin(__FILE__);
        NlsHelper::registerScriptNls('brx.AuthForm.nls', 'brx.AuthForm.view.js');
        if($this->needStyles){
            $this->registerStyle('brx.AuthForm', 'brx.AuthForm.view.less', array('backbone-brx-spinners'));
            wp_enqueue_style('brx.AuthForm');
        }
        $this->registerScript('brx.AuthForm', 'brx.AuthForm.view.js', array('backbone-brx', 'jquery-brx-utils', 'backbone-brx-spinners', 'jquery-brx-placeholder', 'brx.AuthForm.nls'));
    }
    
    public function registerActions(){
        
        
        $this->addAction('parse_request', 'parseRequest');
        $this->addAction('init', 'hideActivationKey');
        $this->addAction('wp_footer', 'renderLoginForm');
        add_action('wp_footer', array('BackboneHelper', 'populateUser'));
        
    }
    
    public function registerFilters(){
//        $this->addFilter('avatar_link', 'getAvatarLink', 10, 2);
    }
    
    public function registerConsolePages() {
        $this->addConsolePage('Аутентификация', 'Аутентификация', 'update_core', 'authentification-admin', '/admin/options');
    }


    public function parseRequest(){
//        Util::print_r($_SERVER);
        Util::sessionStart();
        $this->hideActivationKey();
//        if(strpos($_SERVER['REQUEST_URI'], 'wp-login.php')){
//            $action = Util::getItem($_REQUEST, 'action', 'login');
//            $screen = 'login';
//            switch($action){
//                case 'login': 
//                    $screen = 'login';
//                    break;
//                case 'register':
//                    $screen = 'join';
//                    break;
//                case 'logout':
//                    $screen = 'logout';
//                    break;
//                
//            }
//            $_SESSION['authpopup'] = $screen;
//            session_commit();
//            $referer = Util::getItem($_SERVER, 'HTTP_REFERER', '/');
//            header('Location: '.$referer);
//            die();
//        }
    }
    public function hideActivationKey(){
        if(!empty($_GET['activationkey']) && !empty($_GET['login'])){
            $_SESSION['activationkey'] = $_GET['activationkey'];
            $_SESSION['activationlogin'] = $_GET['login'];
            $_SESSION['activationpopup'] = true;
            session_commit();
            header("Location: /", true);
            die();
        }
    }
        
    
    public function renderLoginForm($authMode = ''){
        $view = new Zend_View();
        $authMode = $authMode?$authMode:OptionHelper_wpp_BRX_Auth::getOption('authMode', 'reload');
        NlsHelper::setNlsDir(WPP_BRX_AUTH_PATH.'nls');
        $view->setScriptPath(WPP_BRX_AUTH_PATH.'application/views/scripts/auth');
//        $t = 'jquery.brx.authForm.phtml';
        $t = 'brx.AuthForm.view.phtml';
        if(!empty($_SESSION['authpopup'])){
            $view->screen = $_SESSION['authpopup'];
            $view->popup = 'true';
            unset($_SESSION['authpopup']);
            echo $view->render($t);
        }elseif(!is_user_logged_in()){
            if(!empty($_SESSION['activationkey']) && !empty($_SESSION['activationlogin'])){
                $view->key = $_SESSION['activationkey'];
                $view->login = $_SESSION['activationlogin'];
                $view->popup = empty($_SESSION['activationpopup'])?'':'true';
                $view->screen = "changePassword";
                $view->authMode = $authMode;
                unset($_SESSION['activationpopup']);
//                echo "<div widget=\"loginForm\" key=\"$key\" login=\"$login\" popup=\"$popup\" screen=\"changePassword\"></div>";
                echo $view->render($t);
            }else{
//                echo "<div widget=\"loginForm\"></div>";
                echo $view->render($t);
            }
        }else{
            unset($_SESSION['activationkey']);
            unset($_SESSION['activationlogin']);
            unset($_SESSION['activationpopup']);
//            echo "<div widget=\"loginForm\"></div>";
            echo $view->render($t);
        }
        wp_enqueue_style('brx.AuthForm');
        wp_enqueue_script('brx.AuthForm');
    }
    
    public function deletePost($postId, $post) {
        
    }

    public function savePost($postId, $post) {
        
    }

    public function registerMetaBoxes() {
        
    }

    public function registerSidebars() {
        
    }

    public static function blockStyles($block = true) {
        self::$instance->needStyles = !$block;
    }

    
    
}


add_action('init', array('wpp_BRX_Auth', 'init'));
