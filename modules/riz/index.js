/**
 * Miscellaneous functionality Riz finds helpful.
 * @exports
 * */
module.exports = {
    /**
    * Useful unicode characters.
    * */
    Unicode: {
        ThumbsUp: "👍",
        ThumbsDown: "👎",
        GreenCheck: "✅",
        BlueCheck: "☑",
        RedX: "❌",
        Fire: "🔥",
        Heart: "❤️",
        F: "🇫",
        A: "🇦",
        C: "🇨",
        M: "🇲",
        P: "🇵",
        One: "1⃣",
        Two: "2⃣"
    },

    Util: {
    /**
        * Get a random Rocket League quick chat.
        * @returns {string} A Rocket League quick chat.
        * */
        GetQuickChat: function () {
            const arr = [
                "All yours.",
                "Calculated.",
                "Centering.",
                "Everybody dance!",
                "Go for it!",
                "Great clear!",
                "Great pass!",
                "Holy cow!",
                "I got it!",
                "In position.",
                "Incoming!",
                "My bad...",
                "My fault.",
                "Need boost!",
                "Nice block!",
                "Nice moves.",
                "Nice one!",
                "Nice shot!",
                "No way!",
                "Noooo!",
                "OMG!",
                "Okay.",
                "One. More. Game.",
                "Oops!",
                "Rematch!",
                "S#@%!",
                "Savage!",
                "Siiiick!",
                "Sorry!",
                "Thanks!",
                "That was fun!",
                "Well played.",
                "What a game!",
                "What a play!",
                "What a save!",
                "Whew.",
                "Whoops...",
                "gg"
            ];
            return arr[Math.floor(Math.random() * arr.length)];
        },

        /**
        * Get the key of an Object by the value.
        * @returns {string} The name of a property.
        * */
        GetKeyByValue: function (object, value) {
            return Object.keys(object).find(key => object[key] === value);
        },
        
        /**
        * Convert milliseconds to days/hours/minutes/seconds.
        * @param {number} milliseconds The value to convert.
        * @param {string} format The value you want back. Defaults to all.
        * @returns {string} Days, Hours, Minutes, Seconds
        * */
        ConvertMiliseconds: function (milliseconds, format) {
            var days, hours, minutes, seconds, total_hours, total_minutes, total_seconds;

            total_seconds = parseInt(Math.floor(milliseconds / 1000));
            total_minutes = parseInt(Math.floor(total_seconds / 60));
            total_hours = parseInt(Math.floor(total_minutes / 60));
            days = parseInt(Math.floor(total_hours / 24));

            seconds = parseInt(total_seconds % 60);
            minutes = parseInt(total_minutes % 60);
            hours = parseInt(total_hours % 24);

            switch (format) {
                case "s":
                    return total_seconds;
                case "m":
                    return total_minutes;
                case "h":
                    return total_hours;
                case "d":
                    return days;
                default:
                    return {
                        d: days,
                        h: hours,
                        m: minutes,
                        s: seconds 
                    };
            }
        },

        /**
        * Alphabetize by the name property.
        * */
        CompareNames: function (a, b) {
            const nameA = a.name.toUpperCase();
            const nameB = b.name.toUpperCase();

            let comparison = 0;
            if (nameA > nameB) {
                comparison = 1;
            } else if (nameA < nameB) {
                comparison = -1;
            }
            return comparison;
        },

        /**
        * Shuffle an array using Fisher-Yates
        * @param {Array} array The array to be shuffled.
        * @returns {Array} The original array.
        * */
        ShuffleArray: function (array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        },

        /**
        * Returns true if two arrays contain the same elements in the same order.
        * @param {Array} arr1 The array to be checked.
        * @param {Array} arr2 The array to be checked.
        * @returns {Boolean}
        * */
        ArraysMatch: function (arr1, arr2) {
            if (arr1.length != arr2.length) {
                return false; 
            }
            for (let i = 0; i < arr1.length; i++) {
                if (arr1[i] !== arr2[i]) {
                    return false; 
                }
            }
            return true;
        },

        /**
        * Pause execution for a number of milliseconds.
        * @param {Number} ms The amount of milliseconds to wait.
        * */
        Sleep: function (ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },
        
        /**
        * Split an array into smaller arrays.
        * @param {Array} array The array to be split.
        * @param {number} max The maximum amount of elements per split array. Defaults to 100.
        * @returns {Array} An array of arrays.
        * */
        SplitArrayUpTo: function (array, max) {
            if (!max) {
                max = 100; 
            }
            const arr = array.slice();
            const result = [];
            while (arr.length) {
                result.push(arr.splice(0, max));
            }
            return result;
        },

        /**
        * Split a string into smaller strings.
        * @param {string} string The string to be split.
        * @param {number} max The maximum amount of characters per split string. Defaults to 2000.
        * @returns {Array} An array of strings.
        * */
        SplitStringUpTo: function (string, max) {
            if (!max) {
                max = 2000; 
            }
            const result = [];
            for (let i = 0; i < string.length; i += max) {
                const substr = string.substring(i, Math.min(string.length, i + max));
                result.push(substr);
            }
            return result;
        },

        /**
        * Truncate a string after a max and return a new string.
        * @param {string} string The string to be truncated.
        * @param {number} max The maximum amount of characters to be allowed.
        * @returns {String} A new string.
        * */
        TruncateString: function (string, max) {
            if (string.length <= max) {
                return string.slice(); 
            }
            return string.slice(0, max);
        },

        /**
        * Convert the args array the message event passes, into a new array that is split by comma instead of spaces.
        * @param {Array} args The message args.
        * @returns {Array} An array of strings.
        * */
        GetCommaArgs: function (args) {
            let commaArgs = args.join(" ").split(",");
            commaArgs = commaArgs.map(e => e.trim());
            return commaArgs;
        }
    }
};
