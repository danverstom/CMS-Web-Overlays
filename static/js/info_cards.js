const InfoCards = {
    data() {
        return {
            commentators: ["TomD53", "Ninsanity"],
            show_commentators: false,

            notification: {
                title: "Notification Card",
                description: "This card could be used to show a notification, give an update about a game, or make an announcement"
            },
            show_notification: false,


            next_map_card: {
                title: "Next Map",
                map_id: 1196,
                description: "Map Two will be Lowrise"
            },
            show_next_map_card: false,
        }
    },
    methods: {
        cardEnter(el, done) {
            el.classList.remove("hidden");
            anime({
                targets: el,
                translateX: [30, 0],
                opacity: [0, 1],
                rotateZ: [5, 0],
                easing: 'easeOutBack',
                duration: 500,
                complete: done
            })
        },
        cardLeave(el, done) {
            anime({
                targets: el,
                translateX: [0, 30],
                opacity: [1, 0],
                rotateZ: [0, 5],
                easing: 'easeOutBack',
                duration: 500,
                complete: function () {
                    el.classList.add("hidden");
                    done();
                }
            })
        },
        testAnimation() {
            var context = this;
            context.show_commentators = true;
            setTimeout(function () {
                context.show_commentators = false;
            }, 5000);
        }
    },
    delimiters: ['[[', ']]'],
    created: function () {
        // Open the websocket that listens for popups
        this.connection = new WebSocket('ws://' + document.domain + ':' + location.port + '/ws');
        var context = this;
        this.connection.onmessage = function (event) {
            console.log(event);
            var data = JSON.parse(event.data);
            console.log(data);
            if (data.action_type == "show_card") {
                if (data.card == "commentators") {
                    var duration = 10000;
                    if (data.duration) {
                        duration = data.duration;
                    }
                    context.show_commentators = true;
                    setTimeout(function () {
                        context.show_commentators = false;
                    }, duration);
                } else if (data.card == "notification") {
                    var duration = 10000;
                    if (data.duration) {
                        duration = data.duration;
                    }
                    context.notification.title = data.title;
                    context.notification.description = data.description;
                    context.show_notification = true;
                    setTimeout(function () {
                        context.show_notification = false;
                    }, duration);
                }
            }
        }
    }
}

Vue.createApp(InfoCards).mount('#info_cards')