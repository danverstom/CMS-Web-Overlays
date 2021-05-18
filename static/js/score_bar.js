const ScoreBar = {
    data() {
        return {
            current_text: "CTF Match Spotlight",
            text_items: ["CTF Match Spotlight", "Season Two", "Map: Blackout"],
            team_one_name: "Delta Force",
            team_one_score: 3,
            team_two_name: "Fotia",
            team_two_score: 3
        }
    },
    mounted() {
        setInterval(() => {
            var context = this;
            var t1 = anime.timeline();
            t1.add({
                targets: "#main_title",
                opacity: [1, 0],
                translateY: [0, 5],
                duration: 200,
                easing: 'easeInOutSine',
                complete: function () {
                    var new_text = context.text_items.shift();
                    context.text_items.push(new_text);
                    context.current_text = new_text;
                }
            })
            t1.add({
                targets: "#main_title",
                opacity: [0, 1],
                translateY: [-5, 0],
                duration: 200,
                easing: 'easeInOutSine',
            })
        }, 5000)
    },
    delimiters: ['[[', ']]']
}

Vue.createApp(ScoreBar).mount("#score_bar")