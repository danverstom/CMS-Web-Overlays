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
            show_next_map_card: true,
        }
    },
    methods: {
        cardEnter(el, done){
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
        cardLeave(el, done){
            anime({
                targets: el,
                translateX: [0, 30],
                opacity: [1, 0],
                rotateZ: [0, 5],
                easing: 'easeOutBack',
                duration: 500,
                complete: function(){
                    el.classList.add("hidden");
                    done();
                }
            })
        },
        testAnimation(){
            var context = this;
            context.show_commentators = true;
            setTimeout(function(){
                context.show_commentators = false;
            }, 5000);
        }
    },
    delimiters: ['[[', ']]']
}

Vue.createApp(InfoCards).mount('#info_cards')