[![CodeFactor](https://www.codefactor.io/repository/github/callmekory/nezuko/badge)](https://www.codefactor.io/repository/github/callmekory/nezuko)

<!------------------------- PROJECT LoggerO ------------------------->
<br />
<p align="center">
  <a href="https://github.com/callmekory/nezuko">
    <img src="src/core/images/logo.png" alt="Loggero" width="256" height="256">
  </a>

<h2 align="center"><b>Nezuko</b></h2>

  <p align="center">
    Smart Home, Automation, and all purpose homelab management bot.
    <br />
    <br />
    <a href="https://github.com/callmekory/nezuko/issues">Report Bug</a>
    ·
    <a href="https://github.com/callmekory/nezuko/issues">Request Feature</a>
  </p>
</p>

<!------------------------- ABOUT THE PROJECT ------------------------->

<h2 align="center"><b>About The Project</b></h2>

Nezuko was created to simplify the management of my servers. I wanted a easy way to manage my docker container, smart devices, download clients and many more.

<!------------------------- COMMANDS ------------------------->

<h2 align="center"><b>Commands</b></h2>

| Category             | Command   | Description                                |
| -------------------- | --------- | ------------------------------------------ |
| Bot Utils            | autorun   | Autorun commands at specified times        |
| Bot Utils            | bot       | General bot options                        |
| Bot Utils            | clear     | Remove messages from channels              |
| Bot Utils            | command   | Lock, unlock, disable, enable commands     |
| Bot Utils            | config    | View and edit bot settings                 |
| Bot Utils            | eval      | Eval Javascript code                       |
| Bot Utils            | exec      | Run shell commands                         |
| Bot Utils            | ping      | Check discord latency                      |
| Bot Utils            | routine   | Run multiple commands as routines          |
| Bot Utils            | server    | View and edit server settings              |
| Bot Utils            | shortcut  | Make and run shortcuts to other commands   |
| DL & File Management | archive   | Archive web pages via ArchiveBox           |
| DL & File Management | aria      | Aria2 download management                  |
| DL & File Management | rclone    | Search and get info from RClone            |
| DL & File Management | sab       | Control SABNZBD downloads                  |
| DL & File Management | tor       | Control Transmission downloads             |
| DL & File Management | torrent   | Search and find torrents                   |
| General              | help      | Get help on command usage                  |
| General              | invite    | Invite Nezuko to your own server           |
| General              | remindme  | Set yourself some reminders                |
| General              | todo      | Your personal todo list                    |
| Information          | npm       | Search the NPM package repos               |
| Information          | whois     | Get WHOIS information on a domain          |
| Management           | docker    | Manage Docker containers                   |
| Media                | anime     | Search Kitsu.io for anime                  |
| Media                | jf        | Jellyfin media server info and stats       |
| Media                | manga     | Search Kitsu.io for manga                  |
| Media                | movie     | Search and request movies via Ombi         |
| Media                | tv        | Search and request TV Shows via Ombi       |
| Media                | yt        | Search Youtube videos                      |
| Networking           | meraki    | Get network information for Meraki Devices |
| Networking           | pihole    | PiHole stats and management                |
| Smart Home           | avr       | Control Pioneer AV Recievers               |
| Smart Home           | pc        | Manage power state of linux computers      |
| Smart Home           | say       | Speak through Google Home devices          |
| Smart Home           | sengled   | Control Sengled smart lights               |
| Smart Home           | tuya      | Control Tuya smart plugs and devices       |
| Utils                | ip        | Get the server IP                          |
| Utils                | si        | Live system stats                          |
| Utils                | speedtest | Runs a network speedtest                   |



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

3. Install needed libraries

```sh
> yarn install
```

<h2 align="center"><b>Setup</b></h2>




<h2 align="center"><b>Roadmap</b></h2>

See the [open issues](https://github.com/callmekory/nezuko/issues) for a
list of proposed features (and known issues).

<!------------------------- CONTRIBUTING ------------------------->

<h2 align="center"><b>Contributing</b></h2>

Contributions are what make the open source community such an amazing place to
be learn, inspire, and create. Any contributions you make are **greatly
appreciated**.

1. Fork the Project
2. `yarn install` to get all dependencies
3. Edit config in /src/config/config.json with your bot token and user ID
4. Run `tsc -w` to watch and build the project as you edit source
5. Run the bot with `nodemon build/index.js` make sure you have `nodemon` install globally with NPM

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

<!------------------------- MARKDOWN LINKS & IMAGES ------------------------->
