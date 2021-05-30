const Rosters = {
    data() {
        return {
            counter: 0,
            all_usernames: [],
            upper_usernames: [],
            lower_usernames: [],
            team_logo: "",

            rosters: [
                {
                    usernames: [
                        "bigwiwi", "Wrongerbox", "B_Swan", "colorr", "Daveeeeeeeee", "redboo123",
                        "Aussi", "2OO8", "Bloomishly", "Chactation", "Clener", "Foodcourt"
                    ],
                    logo: "/static/assets/team_logos/the_monkeys.png",
                },
                {
                    usernames: [
                        "TomD53", "pestoo", "eeyore6", "gamren", "Islendingur", "Cherriie",
                        "Carowinds", "TomD53", "Arzuloria", "CertifiedPlexer", "FireTurtle", "redboo123"
                    ],
                    logo: "/static/assets/team_logos/fotia.png",
                }
            ]

        }
    },
    methods: {
        splitUsernames() {
            var half = Math.ceil(this.all_usernames.length / 2);
            this.upper_usernames = this.all_usernames.slice(0, half);
            this.lower_usernames = this.all_usernames.slice(-half);
        },
        cycleRosters() {
            var new_roster = this.rosters.shift();
            this.rosters.push(new_roster);
            this.all_usernames = new_roster.usernames;
            this.team_logo = new_roster.logo;
            this.splitUsernames();
        }
    },
    created: function () {
        this.splitUsernames();
        this.cycleRosters();
        setInterval(this.cycleRosters, 10000)
    },
    delimiters: ['[[', ']]']
}

Vue.createApp(Rosters).mount("#rosters");