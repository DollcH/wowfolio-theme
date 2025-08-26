<?php
add_action('wp_enqueue_scripts', function () {
  wp_enqueue_style('wowfolio-style', get_stylesheet_uri(), [], '1.0');

  wp_enqueue_style('wowfolio-main', get_stylesheet_directory_uri() . '/assets/css/main.css', [], '1.0');

  wp_enqueue_script('wowfolio-main', get_stylesheet_directory_uri() . '/assets/js/main.js', [], '1.0', true);
});

add_action('after_setup_theme', function () {
  add_theme_support('title-tag');
  add_theme_support('post-thumbnails');
});
