var themingModule = angular.module('ThemingModule', ['ngMaterial']);

themingModule.config(['$mdThemingProvider', function ($mdThemingProvider) {
    // theming -- example 1 
    /* $mdThemingProvider.theme('default')
        .primaryPalette('pink')
        .accentPalette('orange').dark();*/

    // theming example 2

    $mdThemingProvider.definePalette('amazingPaletteName', {
        '50': 'ffebee',
        '100': 'bbc3c9', //progress bar background image
        '200': 'ef9a9a',
        '300': 'e57373', // add md-hue-1 to get this
        '400': 'ef5350',
        '500': '17a1ff',// primary
        '600': '1c7ffa',
        '700': '00ff00',
        '800': 'c62828', // add md-hue-2
        '900': 'b71c1c',
        'A100': 'ff8a01',
        'A200': 'ff5202',
        'A400': 'ff1703',
        'A700': '17c9ff',
        'contrastDefaultColor': 'light',    // whether, by default, text (contrast)
        // on this palette should be dark or light

        'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
            '200', '300', '400', 'A100'],
        'contrastLightColors': undefined    // could also specify this if default was 'dark'
    });

    $mdThemingProvider.definePalette('amazingContrastPallete', {
        '50': '000000',
        '100': 'ffcd01',
        '200': 'ef9a9a',
        '300': 'e57373',
        '400': 'ef5350',
        '500': 'f44336',
        '600': 'e53902',
        '700': '00ff00',
        '800': 'c62828',
        '900': 'b71c1c',
        'A100': 'ff8a01',
        'A200': '17a1ff', // md-accent
        'A400': 'ff1703',
        'A700': '17a1ff',
        'contrastDefaultColor': 'light',    // whether, by default, text (contrast)
        // on this palette should be dark or light

        'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
            '200', '300', '400', 'A100'],
        'contrastLightColors': undefined    // could also specify this if default was 'dark'
    });

    $mdThemingProvider.theme('default')
        .primaryPalette('amazingPaletteName')
        .accentPalette('amazingContrastPallete');
}]);