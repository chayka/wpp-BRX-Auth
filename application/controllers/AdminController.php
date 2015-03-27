<?php

class wpp_BRX_Auth_AdminController extends Zend_Controller_Action{

    public function init(){
        add_action('in_admin_footer', array('ZF_Core', 'addUiFramework'));
    }

    public function optionsAction(){
        wp_enqueue_style('backbone-brx-optionsForm');
        wp_enqueue_script('backbone-brx-optionsForm');
    }

}