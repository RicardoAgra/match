window.addEventListener('load', () => {
  registerSW();
});

const registerSW = (async () => {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('./sw.js');
    } catch (e) {
      console.log('SW registration failed', e);
    }
  }
});

const SERVER_URL = "match-bilhar.herokuapp.com";
const HTTP_URL = `https://${SERVER_URL}`;
const WS_URL = `ws://${SERVER_URL}`;

const Admin = new Vue({
  el: '#Match',
  data: {
    match: {
      matchId: null
    },
    players: [],
    settings: {
      numberOfPlayers: 4,
      crossesPerPlayer: 3,
      foulsPerPlayer: 3,
    },
    settingsOpen: true,
    gameId: "",
    touchStart: 0,
    hostSocket: null,
    hostMatchId: null,
    watch: {
      matchId: null,
      isWatching: false,
      caption: 'Assistir'
    }
  },
  created: function () {
    for (let i = 0; i < 15; i++) {
      this.players.push({
        number: i + 1,
        crosses: 0,
        fouls: 0,
      });
    };

    this.hostSocket = new WebSocket(`${WS_URL}/match`);

    this.hostSocket.onmessage = message => {
      this.match.matchId = message.data;
      this.watch.matchId = message.data;
    };
  },
  methods: {
    openSettings: function () {
      if (this.watch.isWatching) {
        return;
      }

      this.settingsOpen = !this.settingsOpen;
    },
    setActive: function (event) {
      event.target.classList.add('active');
    },
    unsetActive: function (event) {
      event.target.classList.remove('active');
      this.updateSettings();
    },
    swipeStart: function (event) {
      this.touchStart = event.changedTouches[0].clientX;
    },
    swipeEnd: function (event) {
      if (event.target.classList.contains('settings-menu') && (event.changedTouches[0].clientX - this.touchStart) > 20) {
        this.settingsOpen = false;
      }
    },
    addRemoveFoul: function (event, playerId) {
      if (event.target.classList.contains('fouls')) {
        this.addFaul(playerId);
      }
      else {
        this.removeFoul(playerId);
      }
    },
    addFaul: function (playerId) {
      let player = this.players[playerId];

      if ((player.fouls + 1) >= this.settings.foulsPerPlayer) {
        player.fouls = 0;

        if (player.crosses < this.settings.crossesPerPlayer) {
          player.crosses++;
        }
      }
      else {
        if (player.crosses < this.settings.crossesPerPlayer) {
          player.fouls++;
        }
      }
      this.sendMove('addFoul', playerId);
    },
    removeFoul: function (playerId) {
      let player = this.players[playerId];

      if (player.fouls > 0) {
        player.fouls--;

        this.sendMove('removeFoul', playerId);
      }
    },
    addCross: function (playerId) {
      let player = this.players[playerId];

      if (player.crosses < this.settings.crossesPerPlayer) {
        player.crosses++;

        this.sendMove('addCross', playerId);
      }
    },
    removeCross: function (playerId) {
      let player = this.players[playerId];

      if (player.crosses > 0) {
        player.crosses--;

        this.sendMove('removeCross', playerId);
      }
    },
    reset: function () {
      this.players.map(player => {
        player.crosses = 0;
        player.fouls = 0;
      });
    },
    updateSettings: function () {
      if (!this.hostSocket || this.hostSocket.readyState !== 1) {
        console.log('Socket not ready');
        return;
      }

      let message = JSON.stringify({
        type: 'settings',
        settings: this.settings,
        matchId: this.match.matchId
      });

      this.hostSocket.send(message);
    },
    sendMove: function (moveType, playerId) {
      if (!this.hostSocket || this.hostSocket.readyState !== 1) {
        console.log('Socket not ready');
        return;
      }

      let message = JSON.stringify({
        type: 'move',
        moveType: moveType,
        playerId: playerId,
        matchId: this.match.matchId
      });

      console.log(message);

      this.hostSocket.send(message);
    },
    updatePlayer: function (newPlayer) {
      let player = this.players[newPlayer.number - 1];

      Object.keys(player).forEach(key => {
        player[key] = newPlayer[key];
      });
    },
    watchMatch: function (matchId) {
      if (matchId === this.match.matchId)
        return;

      this.settingsOpen = false;
      this.watch.isWatching = true;
      this.watch.caption = "Assistindo";

      let source = new EventSource(`${HTTP_URL}/match/${matchId}`);

      source.addEventListener('message', event => {
        let message = JSON.parse(event.data);

        switch (message.type) {
          case 'match': {
            console.log('Match', message.body);
            this.settings = message.body.settings;
            Object.values(message.body.players).forEach(newPlayer => {
              this.updatePlayer(newPlayer);
            });
            break;
          }
          case 'settings': {
            console.log('Settings', message.body);
            this.settings = message.body;
            break;
          }
          case 'move': {
            console.log('Move', message.body, this);
            this.updatePlayer(message.body);
            break;
          }

          default: {
            console.log(`No handler for event ${message.type}`);
          }
        }
      }, false);
    }
  }
})