<?php

class wpp_BRX_Auth_Bootstrap extends WpPluginBootstrap//Zend_Application_Bootstrap_Bootstrap
{
    const MODULE = 'wpp_BRX_Auth';

    public function run(){
        parent::run();
    }
    
    public function getModuleName() {
        return self::MODULE;
    }
    
    
    public function setupRouting(){
        $router = parent::setupRouting();
        $router->addRoute('auth', new Zend_Controller_Router_Route('auth/:action/*', array('controller' => 'auth', 'action'=>'index', 'module'=>self::MODULE)));
//        $router->addRoute('autocomplete-taxonomy', new Zend_Controller_Router_Route('autocomplete/taxonomy/:taxonomy', array('controller' => 'autocomplete', 'action'=>'taxonomy', 'module'=>self::MODULE)));

    }

}

