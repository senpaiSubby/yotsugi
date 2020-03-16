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

| Category             | Command     | Description                                    |
| -------------------- | ----------- | ---------------------------------------------- |
| DL & File Management | archive     | Archive web pages via ArchiveBox               |
| DL & File Management | aria        | Aria2 download management                      |
| DL & File Management | rclone      | Search and get info from RClone                |
| DL & File Management | sab         | Control SABNZBD downloads                      |
| DL & File Management | tor         | Control Transmission downloads                 |
| DL & File Management | torrent     | Search and find torrents                       |
| Fun                  | jumbo       | Enlarge emojies                                |
| Information          | brandfinder | Check if a twitter or domain name is available |
| Information          | corona      | Get info on the Corona Virus                   |
| Information          | help        | Get help on command usage                      |
| Information          | npm         | Search the NPM package repos                   |
| Information          | whois       | Get WHOIS information on a domain              |
| Management           | docker      | Manage Docker containers                       |
| Media                | anime       | Search Kitsu.io for anime                      |
| Media                | emby        | Emby media server info and stats               |
| Media                | jf          | Jellyfin media server info and stats           |
| Media                | manga       | Search Kitsu.io for manga                      |
| Media                | movie       | Search and request movies via Ombi             |
| Media                | tv          | Search and request TV Shows via Ombi           |
| Media                | yt          | Search Youtube videos                          |
| Networking           | meraki      | Get network information for Meraki Devices     |
| Networking           | pihole      | PiHole stats and management                    |
| Settings             | bot         | General bot options                            |
| Settings             | clear       | Remove messages from channels                  |
| Settings             | command     | Lock, unlock, disable, enable commands         |
| Settings             | config      | View and edit bot settings                     |
| Settings             | ping        | Check discord latency                          |
| Settings             | server      | View and edit server settings                  |
| Smart Home           | avr         | Control Pioneer AV Recievers                   |
| Smart Home           | pc          | Manage power state of linux computers          |
| Smart Home           | say         | Speak through Google Home devices              |
| Smart Home           | sengled     | Control Sengled smart lights                   |
| Smart Home           | tuya        | Control Tuya smart plugs and devices           |
| Utils                | autorun     | Autorun commands at specified times            |
| Utils                | eval        | Eval Javascript code                           |
| Utils                | exec        | Run shell commands                             |
| Utils                | ip          | Get the server IP                              |
| Utils                | remindme    | Set yourself some reminders                    |
| Utils                | routine     | Run multiple commands as routines              |
| Utils                | shortcut    | Make and run shortcuts to other commands       |
| Utils                | si          | Live system stats                              |
| Utils                | speedtest   | Runs a network speedtest                       |
| Utils                | todo        | Your personal todo list                        |

<!------------------------- GETTING STARTED ------------------------->

<h2 align="center"><b>Setup With Docker</b></h2>
Easy setup with docker-compose

1. Create a folder for Nezuko with a `config` and `logs` directory inside of it. 
2. Inside the `config` directory make a `config.json` file with the following content. Changing ownerID, prefix and token accordingly. `exceptUsers` are the user ID's of members who bypass permission checks for commands.

```json
{
  "ownerID": "YOUR DISCORD USER ID",
  "prefix": "//",
  "token": "YOUR BOT TOKEN",
  "exemptUsers": []
}

```

3. Create a docker-compose.yml file with the following content. Changing the host directories if opting to store the config and log directories elsewhere.

```yaml
version: '3'
services:
  nezuko:
    image: callmekory/nezuko:latest
    container_name: nezuko
    volumes:
      # where config.json, rclone.conf and db are stored
      - ./config:/app/dist/config
      # path for logs
      - ./logs:/app/logs
    restart: unless-stopped
```

4. Run `docker-compose up` in the same directory as your `docker-compose.yml` file. If all goes well you should see the bot login and present you with a invite link to add her to your server. Press `ctrl + c` to exit then run it with `docker-compose up -d` to start the bot in the background.

![sample](https://i.imgur.com/nJeAIU1.png)


<h2 align="center"><b>Setup Without Docker</b></h2>

To get a local copy up and running follow these simple steps.

1. Download latest release

```sh
https://github.com/callmekory/nezuko/releases
```

2. Unzip nezuko.zip

3. Navigate into nezuko folder

4. Run `npm install` to install project dependencies

5. Edit `config/config.json` with you bot token and user ID

6. Run the bot with `npm start`


<h2 align="center"><b>Usage</b></h2>

All commands in Nezuko are linked to a database where all params are set with the command `//config`. For example to see Embys config you would do `//config get emby` and to set a param like apiKey you would do `//config set emby apiKey YOURAPIKEY`. For command usages, etc run the `//help` command.

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

See the [open issues](https://github.com/callmekory/nezuko/issues) for a
list of proposed features (and known issues).

<!------------------------- LICENSE ------------------------->

<h2 align="center"><b>License</b></h2>

Distributed under the GPL3 License. See `LICENSE` for more information.

<!------------------------- CONTACT ------------------------->

<h2 align="center"><b>Contact</b></h2>

You can shoot me a PM on Discord if you have any question. My tag is Sublime#4233

<!------------------------- ACKNOWLEDGEMENTS ------------------------->

<h2 align="center"><b>Acknowledgements</b></h2>

- [Mellow - Ombi movies/series code](https://github.com/v0idp/Mellow)
- [nwithan8](https://github.com/nwithan8) Command ideas, testing and making some of the best bots on discord

<!------------------------- MARKDOWN LINKS & IMAGES ------------------------->
