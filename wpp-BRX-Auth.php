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


define( 'WPP_BRX_AUTH_PATH', plugin_dir_path(__FILE__) );
define( 'WPP_BRX_AUTH_URL', preg_replace('%^[\w\d]+\:\/\/[\w\d\.]+%', '',plugin_dir_url(__FILE__)) );

//require_once 'application/helpers/UrlHelper_wpp_BRX_Auth.php';
//require_once 'application/helpers/OptionHelper_wpp_BRX_Auth.php';
//require_once 'widgets-wpp_BRX_Auth.php';

ZF_Query::registerApplication('WPP_BRX_AUTH', WPP_BRX_AUTH_PATH.'application', 
        array('auth'));
//require_once 'application/helpers/UrlHelper_wpp_BRX_Auth.php';

class wpp_BRX_Auth {
    const NLS_DOMAIN = "wpp_BRX_Auth";
    
    public static function baseUrl(){
        echo WPP_BRX_AUTH_URL;
    }
    
    public static function dbUpdate() {
        WpDbHelper::dbUpdate('1.0', 'wpp_brx_auth_db_version', WPP_BRX_AUTH_PATH.'res/sql');
    }
    
    public static function installPlugin() {
        self::registerResources();
//        self::registerCustomPostTypes();
//        self::registerTaxonomies();
        self::registerActions();
        self::registerFilters();
        self::addLoginForm();
    }

    public static function registerCustomPostTypes() {

    }

    public static function registerTaxonomies(){

    }

    public static function excerptLength(){
        return 20;
    }
    
    public static function addJQueryWidgets(){
        wp_enqueue_style('jquery-ui');
        wp_enqueue_script('jquery');
        wp_enqueue_script('jquery-effects-fade');
        wp_enqueue_script('jquery-effects-drop');
        wp_enqueue_script('jquery-effects-blind');
        wp_enqueue_script('jquery-ui-widget');
        wp_enqueue_script('jquery-ui-templated');
        wp_enqueue_script('jquery-brx-modalBox');
        wp_enqueue_style('jquery-brx-spinner');
        wp_enqueue_script('jquery-brx-spinner');
        wp_print_scripts();
        
        ?>
                    
        <div widget="generalSpinner"></div>
        <div widget="modalBox"></div>    
        <script>
        jQuery(document).ready(function($) {
            $.ui.parseWidgets('<?php echo WPP_BRX_AUTH_URL?>res/js/');
        });        
        </script>
                    
        <?php
    }
    
    public static function registerResources($minimize = false){
//        wp_register_style('se-control-panel', WPP_BRX_AUTH_URL.'res/css/bem-se_control_panel.less');
//        wp_register_style('se-search-options', WPP_BRX_AUTH_URL.'res/css/bem-se_search_options.less');
//        wp_register_script('se-control-panel', WPP_BRX_AUTH_URL.'res/js/jquery.se.controlPanel.js', array('jquery-brx-form', 'jquery-ui-progressbar'));
//        wp_register_style('se-setup-form', WPP_BRX_AUTH_URL.'res/css/bem-se_setup.less');
//        NlsHelper::setCurrentPlugin(__FILE__);
        NlsHelper::registerScriptNls('jquery-brx-authForm-nls', 'jquery.brx.authForm.js');
        wp_register_style('jquery-brx-authForm', WPP_BRX_AUTH_URL.'res/css/bem-authForm.less');
        wp_register_script('jquery-brx-authForm', WPP_BRX_AUTH_URL.'res/js/jquery.brx.authForm.js', array('jquery-brx-form', 'jquery-brx-authForm-nls'));

    }
    
    public static function registerActions(){
        add_action('admin_menu', array('wpp_BRX_Auth', 'registerConsolePages'));
//        add_action('add_meta_boxes', array('wpp_BRX_Auth', 'addMetaBoxSearchOptions') );
        
        add_action('parse_request', array('wpp_BRX_Auth', 'parseRequest'));
//        add_action('wp_footer', array('wpp_BRX_Auth', 'addJQueryWidgets'));
//        add_action('wp_head', array('wpp_BRX_Auth', 'addLoginForm'));
        add_action('init', array('wpp_BRX_Auth', 'hideActivationKey'));
        
    }
    
    public static function registerFilters(){
//        add_filter('post_type_link', array('wpp_BRX_Auth', 'postPermalink'), 1, 3);
//        add_filter('term_link', array('wpp_BRX_Auth', 'termLink'), 1, 3);
//        add_filter( 'the_search_query', array('wpp_BRX_Auth', 'enableSearch' ));
//        add_filter('get_sample_permalink_html', array('wpp_BRX_Auth', 'getSamplePermalinkHtml'), 1, 4);
//        add_filter('manage_question_posts_columns', array('wpp_BRX_Auth', 'manageQuestionColumns'));
//        add_filter('manage_edit_question_sortable_columns', array('wpp_BRX_Auth', 'questionSortableColumns'));
//        add_action('delete_post', array('wpp_BRX_Auth', 'deletePost'), 10, 1);
//        add_filter('excerpt_more', array('wpp_BRX_Auth', 'excerptMore'));
//        add_filter('wp_insert_post_data', array('wpp_BRX_Auth', 'autoSlug'), 10, 1 );
//        add_filter('post_link', array('wpp_BRX_Auth', 'postPermalink'), 1, 3);
//        add_filter('get_comment_link', array('wpp_BRX_Auth', 'commentPermalink'), 1, 2);
//        add_filter('wp_nav_menu_objects', array('wpp_BRX_Auth', 'wp_nav_menu_objects'), 1, 2);
//        add_filter('media_upload_tabs', array('wpp_BRX_Auth', 'mediaUploadTabs'), 1, 1);
//        add_filter('excerpt_length', array('wpp_BRX_Auth', 'excerpt_length'), 1, 1);
//        add_filter('wp_nav_menu_items', array('wpp_BRX_Auth', 'wp_nav_menu_items'), 1, 2);
//        add_filter('wp_nav_menu', array('wpp_BRX_Auth', 'wp_nav_menu'), 1, 2);
        
    }
    public static function registerConsolePages() {
//        add_submenu_page('edit.php?post_type='.wpp_BRX_Auth::POST_TYPE_CATALOG_ITEM, 
//                'Импорт каталога', 'Импорт', 'update_core', 'ilat-catalogue-import-items', 
//                array('wpp_BRX_Auth', 'renderConsolePageImportItems'), '', null); 
//        add_submenu_page('edit.php?post_type='.wpp_BRX_Auth::POST_TYPE_CATALOG_ITEM, 
//                'Настройка полей', 'Настройка полей', 'update_core', 'ilat-catalogue-setup-fields', 
//                array('wpp_BRX_Auth', 'renderConsolePageSetupFields'), '', null); 
//        add_submenu_page('edit.php?post_type='.wpp_BRX_Auth::POST_TYPE_CATALOG_ITEM, 
//                'Настройка каталога', 'Настройка каталога', 'update_core', 'ilat-catalogue-setup-catalog', 
//                array('wpp_BRX_Auth', 'renderConsolePageSetupCatalog'), '', null); 
//        add_submenu_page('edit.php?post_type='.wpp_BRX_Auth::POST_TYPE_SERVICE_ITEM, 
//                'Импорт услуг', 'Импорт', 'update_core', 'ilat-catalogue-import-services', 
//                array('wpp_BRX_Auth', 'renderConsolePageImportServices'), '', null); 
        add_menu_page('Аутентификация', 'Аутентификация', 'update_core', 'authentification-admin', 
                array('wpp_BRX_Auth', 'renderConsolePageSetup'), '', null); 
    }


    public static function renderConsolePageSetup(){
       echo ZF_Query::processRequest('/admin/setup-authentification', 'WPP_BRX_AUTH');	
    }

    public static function parseRequest(){
//        Util::print_r($_SERVER);
        Util::sessionStart();
        self::hideActivationKey();
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
    public static function hideActivationKey(){
        if(!empty($_GET['activationkey']) && !empty($_GET['login'])){
            $_SESSION['activationkey'] = $_GET['activationkey'];
            $_SESSION['activationlogin'] = $_GET['login'];
            $_SESSION['activationpopup'] = true;
            session_commit();
            $server = $_SERVER['SERVER_NAME'];
            header("Location: /", true);
            die();
        }
    }
    
    public static function renderLoginForm(){
        $view = new Zend_View();
        NlsHelper::setNlsDir(WPP_BRX_AUTH_PATH.'nls');
        $view->setScriptPath(WPP_BRX_AUTH_PATH.'application/views/scripts/auth');
        $t = 'jquery.brx.authForm.phtml';
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
        wp_enqueue_style('jquery-brx-authForm');
        wp_enqueue_script('jquery-brx-authForm');
    }
    
    public static function addLoginForm(){
        add_action('wp_footer', array('wpp_BRX_Auth', 'renderLoginForm'));
        add_action('wp_footer', array('BackboneHelper', 'populateUser'));
        
    }
    
    
    
}




add_action('init', array('wpp_BRX_Auth', 'installPlugin'));
register_uninstall_hook(__FILE__, array('wpp_BRX_Auth', 'uninstallPlugin'));
    
//register_sidebar(array(
//    'id'=>'index-index',
//    'name'=>__('Главная страница'),
//));
