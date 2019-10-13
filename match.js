window.addEventListener('load', () => {
  //registerSW();
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.unregister('./sw.js');
    } catch (e) {
      console.log('SW registration failed');
    }
  }
});

const registerSW = (async () => {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('./sw.js');
    } catch (e) {
      console.log('SW registration failed');
    }
  }
});

const Admin = new Vue({
  el: '#Matos',
  data: {
    players: [],
    numberOfPlayers: 4,
    crossesPerPlayer: 4,
    foulsPerPlayer: 3,
    settingsOpen: false
  },
  created: function () {
    for (let i = 0; i < 15; i++) {
      this.players.push({
        number: i + 1,
        crosses: 0,
        fouls: 0,
      });
    };
  },
  methods: {
    pureAddFaul: (currentValue, maxValue) => {
      return (currentValue < maxValue ? currentValue++ : maxValue);
    },
    addFaul: function (event, playerIndex) {
      if (event.target.classList.contains('fouls')) {
        let player = this.players[playerIndex];

        if ((player.fouls + 1) >= this.foulsPerPlayer) {
          player.fouls = 0;
          this.addCross(playerIndex);
        }
        else {
          if (player.crosses < this.crossesPerPlayer) {
            player.fouls++;
          }
        }
      }
      else {
        this.removeFaul(playerIndex);
        return;
      }
    },
    removeFaul: function (playerIndex) {
      let player = this.players[playerIndex];

      if (player.fouls > 0) {
        player.fouls--;
      }
    },
    addCross: function (playerIndex) {
      let player = this.players[playerIndex];

      if (player.crosses < this.crossesPerPlayer) {
        player.crosses++;
      }
    },
    removeCross: function (playerIndex) {
      let player = this.players[playerIndex];

      if (player.crosses > 0) {
        player.crosses--;
      }
    },
    reset: function () {
      this.players.map(player => {
        player.crosses = 0;
        player.fouls = 0;
      });
    }
  }
})