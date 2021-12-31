(() =>
{
    /**
     * @return {void}
     * @protected
     */
    const initialize = () =>
    {
        const element = document.getElementById("contributors");
        if (!element) {
            return ;
        }

        /**
         * @param  {array} users
         * @return {void}
         * @protected
         */
        const appendUser = (users) =>
        {
            const element = document.getElementById("contributors");

            for (let idx = 0; idx < users.length; ++idx) {

                const user = users[idx];

                const htmlTag = `<div>
    <a href="${user.html_url}">
        <img loading="lazy" src="${user.avatar_url}" width="60" height="60" title="${user.login}">
    </a>
</div>`;

                element.insertAdjacentHTML("beforeend", htmlTag);

            }

        };

        const cache = localStorage.getItem("contributors");
        if (cache) {
            const data = JSON.parse(cache);
            if (data.timestamp > Date.now()) {
                return appendUser(data.users);
            }
        }

        fetch("https://api.github.com/orgs/Next2D/repos")
            .then(response => response.json())
            .then((repos) =>
            {
                const promises = [];
                for (let idx = 0; idx < repos.length; ++idx) {
                    promises.push(fetch(repos[idx].contributors_url)
                        .then(response => response.json()));
                }

                Promise
                    .all(promises)
                    .then((responses) =>
                    {
                        const contributors = new Map();
                        for (let idx = 0; idx < responses.length; ++idx) {

                            const users = responses[idx];
                            for (let idx = 0; idx < users.length; ++idx) {

                                const user = users[idx];
                                if (contributors.has(user.id)) {
                                    continue;
                                }

                                contributors.set(user.id, user);
                            }
                        }

                        const users = [];
                        for (const user of contributors.values()) {
                            users.push(user);
                        }

                        localStorage.setItem("contributors", JSON.stringify({
                            "timestamp": Date.now() + 86400000,
                            "users": users
                        }));

                        appendUser(users);
                    });
            });
    };

    if (document.readyState === "loading") {
        window.addEventListener("DOMContentLoaded", initialize);
    } else {
        initialize();
    }
})();