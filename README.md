<!------------------------- PROJECT LoggerO ------------------------->
<br />
<p align="center">
  <a href="https://github.com/callmekory/nezuko">
    <img src="src/core/images/logo.png" alt="Loggero" width="256" height="256">
  </a>

<h2 align="center"><b>Nezuko</b></h2>

  <p align="center">
    Smart Home, Automation, and all purpose server management bot.
    <br />
    <br />
    <a href="https://github.com/callmekory/nezuko/issues">Report Bug</a>
    ·
    <a href="https://github.com/callmekory/nezuko/issues">Request Feature</a>
  </p>
</p>

<!------------------------- ABOUT THE PROJECT ------------------------->

<h2 align="center"><b>About The Project</b></h2>

I made Nezuko to automate and simplify my life. From controlling lights and smart plugs to media management and Docker control. If its not here it'll be here. Feel free to PR and ask for new features!

<!------------------------- COMMANDS ------------------------->

<h2 align="center"><b>Commands</b></h2>

| Command    | API | Description (Click for full details)                        |
| ---------- | :-: | ----------------------------------------------------------- |
| archivebox |  Y  | Clone webpages via ArchiveBox                               |
| autorun    |  Y  | Schedule commands to auto run at specified times            |
| avr        |  Y  | Pioneer AVR controller                                      |
| docker     |  Y  | Manage Docker contaienrs                                    |
| emby       |     | Get stats from Emby                                         |
| ip         |  Y  | Shows server public and local IP                            |
| jackett    |     | Search for torrents via Jackett                             |
| lamp       |  Y  | Sengled light controller                                    |
| meraki     |  Y  | Meraki network statistics                                   |
| movie      |     | Search and request movies in Ombi                           |
| pc         |  Y  | Linux system power controller                               |
| pihole     |  Y  | PiHole management                                           |
| plex       |     | Get stats from Plex via Tautulli                            |
| plug       |  Y  | Tuya smartplug controller                                   |
| rclone     |  Y  | List directories and get info on your rclone mounts         |
| routines   |  Y  | Routines to run multiple commands at once                   |
| sab        |  Y  | sabNZBD Management                                          |
| say        |  Y  | Speak through Google Home                                   |
| series     |     | Search and request TV shows in Ombi                         |
| speedtest  |     | Runs a internet speedtest on the host the bot is running on |
| todo       |  Y  | Your personal todo list                                     |
| tor        |  Y  | Transmission Management                                     |
| yt         |     | Search Youtube for videos                                   |

<!------------------------- Web UI ------------------------->

Nezuko has a built in web UI / API server for remotely running commands. For API enabled commands you can add them as buttons on the Web UI send HTTP POST requests from your favorite applications. I personally use HTTP Request Shortcuts on my Galaxy. It has a nice UI with support for custom icons, etc.

<div align="center">
<img src="src/core/images/screenshots/app1.png" width="200px" />
<img src="src/core/images/screenshots/app2.png" width="200px" />
<img src="src/core/images/screenshots/app3.png" width="200px" />
<img src="src/core/images/screenshots/app4.png" width="200px" />
</div>

<!------------------------- GETTING STARTED ------------------------->

<h2 align="center"><b>Prerequisites</b></h2>

To get a local copy up and running follow these simple steps.

1. Clone Nezuko

```sh
git clone https://github.com/callmekory/nezuko.git
```

2. Install Yarn

Ubuntu / Debain

```sh
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -

echo deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list

sudo apt install yarn
```

Arch Linux

```sh
sudo pacman -S yarn
```

3. Install packages

```sh
> yarn install
```

<h2 align="center"><b>Setup</b></h2>

1. Setup Bot Token and Prefix

> Navigate to /nezuko/data and rename `config.js.sample` to `config.js`. Open the file and edit as needed.

2. Setup Command Configs

> All commands and other settings are setup after the bot is added to your server. Either by running `config get` which will list all the settings you can edit and how to edit them or by navigating to `http://botIP:5700` and setting up your details there. Everything is saved to the database at `/nezuko/data/db.sqlite`.

If you would like to run Nezuko as a Docker container you'll need to build the image yourself.

1. Clone the repo to a folder of choice
2. CD into the folder and inside the folder `data` rename `config.js.sample` to `config.js` and enter your discord user ID and your bot token.
3. Navigate back into the main directory and run `docker build -t nezuko .`
4. After the build is finished you can run Nezuko with `docker run -p 570:5700 --name nezuko nezuko`. If you'd rather use Docker-Compose as I do then you can use the following sample config. Simply save it as `docker-compose.yml` and run `docker-compose up -d` to start her up. The webUI will be available at `http://BOTIP:5700`.

```json
version: '3'
services:
  nezukoBot:
    image: callmekory/nezuko
    container_name: nezuko
    volumes:
      - ./config:/app/build/config
    ports:
      - 5700:5700
    network_mode: bridge
    restart: unless-stopped

```

<h2 align="center"><b>Roadmap</b></h2>

See the [open issues](https://github.com/callmekory/nezuko/issues) for a
list of proposed features (and known issues).

<!------------------------- CONTRIBUTING ------------------------->

<h2 align="center"><b>Contributing</b></h2>

Contributions are what make the open source community such an amazing place to
be learn, inspire, and create. Any contributions you make are **greatly
appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<!------------------------- LICENSE ------------------------->

<h2 align="center"><b>License</b></h2>

Distributed under the GPL3 License. See `LICENSE` for more information.

<!------------------------- CONTACT ------------------------->

<h2 align="center"><b>Contact</b></h2>

You can shoot me a PM on Discord if you have any question. My tag is Sublime#4233

<!------------------------- ACKNOWLEDGEMENTS ------------------------->

<h2 align="center"><b>Acknowledgements</b></h2>

- [Mellow - Ombi movies/series code](https://github.com/v0idp/Mellow)
- [nwithan8](https://github.com/nwithan8)
- [codetheweb/tuyapi](https://github.com/codetheweb/tuyapi)

<!------------------------- MARKDOWN LINKS & IMAGES ------------------------->
