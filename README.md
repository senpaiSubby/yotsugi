![CodeFactor Grade](https://img.shields.io/codefactor/grade/github/callmekory/yotsugi?style=for-the-badge)
![Docker Pulls](https://img.shields.io/docker/pulls/callmekory/yotsugi?style=for-the-badge)
![GitHub stars](https://img.shields.io/github/stars/callmekory/yotsugi?style=for-the-badge)
![GitHub contributors](https://img.shields.io/github/contributors/callmekory/yotsugi?style=for-the-badge)
![GitHub issues](https://img.shields.io/github/issues/callmekory/yotsugi?style=for-the-badge)

<!------------------------- PROJECT LoggerO ------------------------->
<br />
<p align="center">
  <a href="https://github.com/callmekory/yotsugi">
    <img src="src/core/images/logo.png" alt="Loggero" width="256" height="256">
  </a>

<h2 align="center"><b>Yotsugi</b></h2>

  <p align="center">
    Smart Home, Automation, and all purpose homelab management bot.
    <br />
    <br />
    <a href="https://github.com/callmekory/yotsugi/issues">Report Bug</a>
    ·
    <a href="https://github.com/callmekory/yotsugi/issues">Request Feature</a>
  </p>
</p>

<!------------------------- ABOUT THE PROJECT ------------------------->

<h2 align="center"><b>About The Project</b></h2>

Yotsugi was created to simplify the management of my servers. I wanted a easy way to manage my docker container, smart devices, download clients and many more.

<!------------------------- COMMANDS ------------------------->

<h2 align="center"><b>Commands</b></h2>

| Category        | Command     | Description                                    |
| --------------- | ----------- | ---------------------------------------------- |
| Bot Tools       | bot         | General bot options                            |
| Bot Tools       | command     | Lock, unlock, disable, enable commands         |
| Bot Tools       | config      | View and edit bot settings                     |
| Bot Tools       | ping        | Check discord latency                          |
| Bot Tools       | server      | View and edit server settings                  |
| Downloaders     | aria        | Aria2 download management                      |
| Downloaders     | deluge      | Control Deluge downloads                       |
| Downloaders     | rclone      | Search and get info from RClone                |
| Downloaders     | sab         | Control SABNZBD downloads                      |
| Downloaders     | tor         | Control Transmission downloads                 |
| General         | help        | Get help on command usage                      |
| General         | notes       | Your personal notepad                          |
| General         | remindme    | Set yourself some reminders                    |
| General         | todo        | Your personal todo list                        |
| Management      | docker      | Manage Docker containers                       |
| Media           | anime       | Search Kitsu.io for anime                      |
| Media           | emby        | Emby media server info and stats               |
| Media           | jf          | Jellyfin media server info and stats           |
| Media           | manga       | Search Kitsu.io for manga                      |
| Media           | movie       | Search and request movies via Ombi             |
| Media           | tv          | Search and request TV Shows via Ombi           |
| Media           | yt          | Search Youtube videos                          |
| Networking      | meraki      | Get network information for Meraki Devices     |
| Networking      | pihole      | PiHole stats and management                    |
| Search & Lookup | brandfinder | Check if a twitter or domain name is available |
| Search & Lookup | corona      | Get info on the Corona Virus                   |
| Search & Lookup | npm         | Search the NPM package repos                   |
| Search & Lookup | nyaa        | Search Nyaa.si for anime torrents              |
| Search & Lookup | torrent     | Search and find torrents                       |
| Search & Lookup | whois       | Get WHOIS information on a domain              |
| Smart Home      | avr         | Control Pioneer AV Recievers                   |
| Smart Home      | pc          | Manage power state of linux computers          |
| Smart Home      | say         | Speak through Google Home devices              |
| Smart Home      | sengled     | Control Sengled smart lights                   |
| Smart Home      | tuya        | Control Tuya smart plugs and devices           |
| Utils           | autorun     | Autorun commands at specified times            |
| Utils           | clear       | Remove messages from channels                  |
| Utils           | eval        | Eval Javascript code                           |
| Utils           | routine     | Run multiple commands as routines              |
| Utils           | shortcut    | Make and run shortcuts to other commands       |
| Utils           | speedtest   | Runs a network speedtest                       |

<!------------------------- GETTING STARTED ------------------------->

<h2 align="center"><b>Prerequisites</b></h2>
Yotsugi uses MongoDB as the database backend and will need to be setup before the bot can be run. This guide assumed you are going to be using Docker.

1. You can create your MongoDB container using docker-compose. Save this as `docker-compose.yml` where you would like to save the data at and run `docker-compose up -d` to start the container.

```yaml
version: '3'
services:
  mongodb:
    image: mongo
    container_name: mongodb
    ports:
      - 27017:27017
    volumes:
      - ./mongodb/data:/data/db
    restart: unless-stopped
```

<h2 align="center"><b>Setup With Docker</b></h2>
Easy setup with docker-compose

1. Create a folder for Yotsugi with a `config` and `logs` directory inside of it.
2. Inside the `config` directory make a `config.json` file with the following content. Changing ownerID, prefix and token accordingly. `trustedUsers` are the user ID's of members who bypass permission checks for commands.

```json
{
  "mongoUrl": "mongodb://USERNAME:PASS@HOST:27017/yotsugi",
  "ownerID": "YOUR DISCORD USER ID",
  "prefix": "//",
  "apiKey": "1234",
  "token": "YOUR BOT TOKEN",
  "trustedUsers": ["userID 1", "userID 2"]
}
```

3. Create a docker-compose.yml file with the following content. Changing the host directories if opting to store the config and log directories elsewhere.

```yaml
version: '3'
services:
  yotsugi:
    image: callmekory/yotsugi:latest
    container_name: yotsugi
    volumes:
      - /path/for/config/files:/app/dist/config # where config.json, rclone.conf and db are stored
    ports:
      - 5055:5055 # api server port
    restart: unless-stopped
```

4. Run `docker-compose up` in the same directory as your `docker-compose.yml` file. If all goes well you should see the bot login and present you with a invite link to add her to your server. Press `ctrl + c` to exit then run it with `docker-compose up -d` to start the bot in the background.

![sample](https://i.imgur.com/nJeAIU1.png)

<h2 align="center"><b>Setup Without Docker</b></h2>

To get a local copy up and running follow these simple steps.

1. Download latest release

```sh
https://github.com/callmekory/yotsugi/releases
```

2. Unzip yotsugi.zip

3. Navigate into yotsugi folder

4. Run `npm install` to install project dependencies

5. Edit `config/config.json` with you bot token and user ID

6. Run the bot with `npm start`

<h2 align="center"><b>Usage</b></h2>

All commands in Yotsugi are linked to a database where all params are set with the command `//config`. For example to see Embys config you would do `//config get emby` and to set a param like apiKey you would do `//config set emby apiKey YOURAPIKEY`. For command usages, etc run the `//help` command.

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

<h2 align="center"><b>Roadmap</b></h2>

See the [open issues](https://github.com/callmekory/yotsugi/issues) for a
list of proposed features (and known issues).

<!------------------------- LICENSE ------------------------->

<h2 align="center"><b>License</b></h2>

Distributed under the GPL3 License. See `LICENSE` for more information.

<!------------------------- CONTACT ------------------------->

<h2 align="center"><b>Contact</b></h2>

You can open a issue on github or join my personal Discord server and chat with me there if you'd like some help. Feel free to also DM me, my tag is callmekory#4233

<div align="center">
	<p>
		<a href="https://discord.gg/ZmtfTvU"><img src="https://discordapp.com/api/guilds/302306803880820736/widget.png?style=banner2" alt="" /></a>
	</p>
</div>

<!------------------------- ACKNOWLEDGEMENTS ------------------------->

<h2 align="center"><b>Acknowledgements</b></h2>

- [Mellow - Ombi movies/series code](https://github.com/v0idp/Mellow)
- [nwithan8](https://github.com/nwithan8) Command ideas, testing and making some of the best bots on discord

<!------------------------- MARKDOWN LINKS & IMAGES ------------------------->
