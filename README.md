[![Discord](https://img.shields.io/badge/Discord-Invite-7289DA.svg?style=for-the-badge&logo=appveyor)](https://discord.gg/xhnkTUH) ![Discord](https://img.shields.io/discord/302306803880820736?style=for-the-badge) ![GitHub contributors](https://img.shields.io/github/contributors/callmekory/nezuko?style=for-the-badge) ![GitHub followers](https://img.shields.io/github/followers/callmekory?style=for-the-badge)

<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://github.com/callmekory/nezuko">
    <img src="data/images/logo.png" alt="Logo" width="126" height="126">
  </a>

**<h2 align="center">Nezuko</h2>**

  <p align="center">
    Smart Home, Automation, and all purpose server management bot.
    <br />
    <br />
    <a href="https://github.com/callmekory/nezuko/issues">Report Bug</a>
    ·
    <a href="https://github.com/callmekory/nezuko/issues">Request Feature</a>
  </p>
</p>

<!-- ABOUT THE PROJECT -->

<h2 align="center"><b>About The Project</b></h2>

### I made Nezuko to automate my life. From controlling my lights and smart plugs to media management and Docker control. If its not here it'll be here. Feel free to PR and ask for new features!

<!-- COMMANDS -->

<h2 align="center"><b>Commands</b></h2>

| Command    | Status | API | Description (Click for full details)                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------- | :----: | :-: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| sab        |  1.0   |  Y  | <details><summary>sabNZBD Management</summary><p>Commands:<p><ul><li><b>list</b> - List all downloads in queue</li><li><b>add</b> - Add NZB's via link</li></ul></details>                                                                                                                                                                                                                                                                                    |
| tor        |  1.0   |  Y  | <details><summary>Transmission Management</summary><p>Commands:<p><ul><li><b>list</b> - List all downloads in queue</li><li><b>add [magnet link]</b> - Add Torrent via link</li></ul></details>                                                                                                                                                                                                                                                               |
| movie      |  1.0   |     | <details><summary>Search and request movies in Ombi</summary><p>Commands:<p><ul><li><b>[movie name]</b> - Movie to search for</li></ul></details>                                                                                                                                                                                                                                                                                                             |
| series     |  1.0   |     | <details><summary>Search and request TV shows in Ombi</summary><p>Commands:<p><ul><li><b>[series name]</b> - Series to search for</li></ul></details>                                                                                                                                                                                                                                                                                                         |
| emby       |  1.0   |     | <details><summary>Get stats from Emby</summary><p>Commands:<p><ul><li><b>stats</b> - Media library stats</li><li><b>recent [movies/series/music]</b> - View recent media and get links to watch</li><li><b>streams</b> - View who and whats currently streaming</li></ul></details>                                                                                                                                                                           |
| plex       |  1.0   |     | <details><summary>Get stats from Plex via Tautulli</summary><p>Commands:<p><ul><li><b>stats</b> - Media library stats</li><li><b>recent [movies/series/music]</b> - View recent media and get links to watch</li><li><b>streams</b> - View who and whats currently streaming</li></ul></details>                                                                                                                                                              |
| archivebox |  1.0   |  Y  | <details><summary>Clone webpages via ArchiveBox</summary><p>Commands:<p><ul><li><b>[url]</b> - Url to add</li></ul></details>                                                                                                                                                                                                                                                                                                                                 |
| rclone     |  1.0   |  Y  | <details><summary>List directories and get info on your rclone mounts</summary><p>Commands:<p><ul><li><b>ls [/some/rclone/dir]</b> - List files in a dir and navigate in pages</li><li><b>size[/some/rclone/dir]</b> - Get the size of a dir on rclone</li></ul></details>                                                                                                                                                                                    |
| speedtest  |  1.0   |  Y  | <details><summary>Runs a speedtest on the host the bot is running on</summary></details>                                                                                                                                                                                                                                                                                                                                                                      |
| todo       |  1.0   |  Y  | <details><summary>Your personal todo list</summary><p>Commands:<p><ul><li><b>list</b> - List all todos</li><li><b>add [take out trash]</b> - Add a todo</li><li><b>remove [1]</b> - Remove a todo</li></ul></details>                                                                                                                                                                                                                                         |
| docker     |  1.0   |  Y  | <details><summary>Manage Docker contaienrs</summary><p>Commands:<p><ul><li><b>list running/paused/exited/etc</b> - List containers</li><li><b>stop/start/restart/etc [CONTAINER]</b> - Manage container states</li></ul></details>                                                                                                                                                                                                                            |
| avr        |  1.0   |  Y  | <details><summary>Pioneer AVR controller</summary><p>Commands:<p><ul><li><b>on/off</b> - Power on/off</li><li><b>vol</b> - Show current volume</li><li><b>vol [0-100]</b> - Set AVR volume</li></ul></details>                                                                                                                                                                                                                                                |
| lights     |  1.0   |  Y  | <details><summary>Sengled light controller</summary><p>Commands:<p><ul><li><b>list</b> - List all lights</li><li><b>[light name]</b> - Toggle light on/off</li><li><b>[light name] 0-100</b> - Set light brightness</li></ul></details>                                                                                                                                                                                                                       |
| plug       |  1.0   |  Y  | <details><summary>Meraki network statistics</summary><p>Commands:<p><ul><li><b>list</b> - List all devices on network</li></ul></details>                                                                                                                                                                                                                                                                                                                     |
| pihole     |  1.0   |  Y  | <details><summary>PiHole management</summary><p>Commands:<p><ul><li><b>stats</b> - List usage statistics</li><li><b>on/off</b> - Enable/disable DNS filtering</li></ul></details>                                                                                                                                                                                                                                                                             |
| pc         |  1.0   |  Y  | <details><summary>Linux system power controller</summary><p>Commands:<p><ul><li><b>on/off/restart</b> - State to set system</li></ul><p>Requires addon in core/addons/powerserver to be running on the system you want to control.</p></details>                                                                                                                                                                                                              |
| routines   |  1.0   |  Y  | <details><summary>Routines to run multiple commands at once</summary><p>Commands:<p><ul><li><b>add [routine name][command]</b> - Add a command to a routine</li><li><b>remove [routine name][command # from list command]</b> - Remove a command from routine</li><li><b>disable/enable [routine name][command # from list command]</b> - Enable/disable a command in a routine</li><li><b>list</b> - List all your routines and commands</li></ul></details> |
| ip         |  1.0   |  Y  | <details><summary>Shows server public and local IP</summary></details>                                                                                                                                                                                                                                                                                                                                                                                        |
| say        |  1.0   |  Y  | <details><summary>Speak through Google Home</summary><p>Commands:<p><ul><li><b>say [waddup my dude]</b> - Text to be spoken</li></ul></details>                                                                                                                                                                                                                                                                                                               |

<!-- Web UI -->

<h2 align="center"><b>Web UI - Work in progress</b></h2>

<center>

![alt text](/data/images/webui.png 'Logo Title Text 1')

</center>

### Nezuko has a built in web UI / API server for remotely running commands. For API enabled commands you can add them as buttons on the Web UI send HTTP POST requests from your favorite applications. I personally use [HTTP Request Shortcuts](https://github.com/Waboodoo/HTTP-Shortcuts) on my Galaxy. It has a nice UI with support for custom icons, etc.

<div style="display: flex; justify-content: center">
<img src="data/images/app1.png"
     alt="Markdown Monster icon"
     style="width: 300px" />
<img src="data/images/app2.png"
     alt="Markdown Monster icon"
     style="width: 300px" />
</div>
<!-- GETTING STARTED -->
<h2 align="center"><b>Getting Started</b></h2>

### To get a local copy up and running follow these simple steps.

#### 1. Clone Nezuko

```sh
git clone https://github.com/callmekory/nezuko.git
```

#### 2. Install Yarn

`curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -`

`echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list`

`sudo apt install yarn`

#### 3: Install NPM packages

```sh
yarn install
```

<h2 align="center"><b>Roadmap</b></h2>

### See the [open issues](https://github.com/callmekory/nezuko/issues) for a list of proposed features (and known issues).

<!-- CONTRIBUTING -->

<h2 align="center"><b>Contributing</b></h2>

### Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**!

#### 1. Fork the Project

#### 2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)

#### 3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)

#### 4. Push to the Branch (`git push origin feature/AmazingFeature`)

#### 5. Open a Pull Request

<!-- LICENSE -->

<h2 align="center"><b>License</b></h2>

### Distributed under the GPL3 License. See `LICENSE` for more information. Do whatever you want IDC

<!-- CONTACT -->

<h2 align="center"><b>Contact</b></h2>

[![Discord](https://img.shields.io/badge/Discord-Invite-7289DA.svg?style=for-the-badge&logo=appveyor)](https://discord.gg/xhnkTUH) ![Discord](https://img.shields.io/discord/302306803880820736?style=for-the-badge) ![GitHub contributors](https://img.shields.io/github/contributors/callmekory/nezuko?style=for-the-badge) ![GitHub followers](https://img.shields.io/github/followers/callmekory?style=for-the-badge)

<!-- ACKNOWLEDGEMENTS -->

<h2 align="center"><b>Acknowledgements</b></h2>

- [Mellow - Ombi movies/series code](https://github.com/v0idp/Mellow)
- [nwithan8](https://github.com/nwithan8)
- [codetheweb/tuyapi](https://github.com/codetheweb/tuyapi)

<!-- MARKDOWN LINKS & IMAGES -->
