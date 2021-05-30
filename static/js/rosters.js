const Rosters = {
    data() {
        return {
            counter: 0,
            all_usernames: [],
            upper_usernames: [],
            lower_usernames: [],
            team_logo: "",
            team_name: "",

            current_roster: "red",

            red_roster: {
                usernames: [
                    "bigwiwi", "Wrongerbox", "B_Swan", "colorr", "Daveeeeeeeee", "redboo123",
                    "Aussi", "2OO8", "Bloomishly", "Chactation", "Clener", "Foodcourt"
                ],
                logo: "",
                name: "The Monkeys"
            },

            blue_roster: {
                usernames: [
                    "TomD53", "pestoo", "eeyore6", "gamren", "Islendingur", "Cherriie",
                    "Carowinds", "TomD53", "Arzuloria", "CertifiedPlexer", "FireTurtle", "redboo123"
                ],
                logo: "/static/assets/team_logos/fotia.png",
                name: "Fotia"
            }
        }
    },
    methods: {
        splitUsernames() {
            var half = Math.ceil(this.all_usernames.length / 2);
            this.upper_usernames = this.all_usernames.slice(0, half);
            this.lower_usernames = this.all_usernames.slice(-half);
        },
        cycleRosters() {
            var t1 = anime.timeline();
            var context = this;
            t1.add({
                targets: '.card',
                opacity: [1, 0],
                rotateZ: [0, 10],
                translateY: [0, 200],
                delay: anime.stagger(50),
                easing: "easeInBack",
                duration: 500,
                complete: function(){
                    if (context.current_roster == "red"){
                        var new_roster = context.blue_roster;
                        context.current_roster = "blue";
                    } else if (context.current_roster == "blue"){
                        var new_roster = context.red_roster;
                        context.current_roster = "red";
                    }
                    context.all_usernames = new_roster.usernames;
                    context.team_logo = new_roster.logo;
                    context.team_name = new_roster.name;
                    context.splitUsernames();
                    anime({
                        targets: '#rosters-team-logo',
                        opacity: [0, 1],
                        duration: 500,
                        easing: "easeOutBack",
                    })
                }
            })
            t1.add({
                targets: '#rosters-team-logo',
                opacity: [1, 0],
                duration: 500,
                easing: "easeInBack",
            }, 0)
            t1.add({
                targets: '.card',
                opacity: [0, 1],
                rotateZ: [-10, 0],
                translateY: [-200, 0],
                delay: anime.stagger(50),
                easing: "easeOutBack",
                duration: 500
            })
        }
    },
    created: function () {
        this.splitUsernames();
        this.cycleRosters();
        setInterval(this.cycleRosters, 3000)
    },
    delimiters: ['[[', ']]']
}

Vue.createApp(Rosters).mount("#rosters");