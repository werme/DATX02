'use strict';

window.Darwinator = window.Darwinator || {};

window.onload = function () {

  var game;

  game = new Phaser.Game(640, 480, Phaser.AUTO, 'darwinator-container');
  game.state.add('boot', Darwinator.Boot);
  game.state.add('preloader', Darwinator.Preloader);
  game.state.add('menu', Darwinator.Menu);
  game.state.add('game', Darwinator.GameState);

  game.state.start('boot');
};
