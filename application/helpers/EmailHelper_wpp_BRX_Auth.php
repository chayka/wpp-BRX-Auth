<?php

class EmailHelper_wpp_BRX_Auth extends EmailHelper {

    public static function sendTemplate($subject, $template, $params, $to, $from = '', $cc = '', $bcc = ''){
        $html = new Zend_View();
        $html->setScriptPath(WPP_BRX_AUTH_APPLICATION_PATH . '/views/scripts/email/');
//        print_r($params);
        foreach($params as $key => $value){
            $html->assign($key, $value);
        }
        
        $content = $html->render($template);
        $content = apply_filters_ref_array('EmailHelper_wpp_BRX_Auth.sendTemplate', array($content, $template, $params));
        return EmailHelper::send($subject, $content, $to, $from, $cc, $bcc);
    }
    
    public static function userRegistered($user, $password){
        self::sendTemplate(sprintf("Учетная запись на %s", $_SERVER['SERVER_NAME']), 
                'user-registered.phtml', array('user' => $user, 'password' => $password), 
                $user->getEmail());
    }
    
    public static function forgotPassword($user, $activationKey){        
        self::sendTemplate(sprintf("Смена пароля на %s", $_SERVER['SERVER_NAME']), 
                'forgot-password.phtml', array(
                    'user' => $user, 
                    'activationKey' => $activationKey
                    ), $user->getEmail());
    }
    
    public static function newPassword($user, $password){
        self::sendTemplate(sprintf("Учетная запись на %s", $_SERVER['SERVER_NAME']), 
                'new-password.phtml', array('user' => $user, 'password' => $password), 
                $user->getEmail());
        
    }
    
}