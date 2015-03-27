<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of OptionHelper_wpp_BRX_SearchEngine
 *
 * @author borismossounov
 */
class OptionHelper_wpp_BRX_Auth {

    public static function getOption($option, $default='', $reload = false){
        $key = 'wpp_BRX_Auth.'.$option;
        return get_option($key, $default, !$reload);
    }
    
    public static function setOption($option, $value){
        $key = 'wpp_BRX_Auth.'.$option;
        return update_option($key, $value);
    }
    
    public static function getSiteOption($option, $default='', $reload = false){
        $key = 'wpp_BRX_Auth.'.$option;
        return get_site_option($key, $default, !$reload);
    }
    
    public static function setSiteOption($option, $value){
        $key = 'wpp_BRX_Auth.'.$option;
        return update_site_option($key, $value);
    }
    
}
