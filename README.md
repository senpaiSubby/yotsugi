[![Discord](https://img.shields.io/badge/Discord-Invite-7289DA.svg?style=for-the-badge&logo=appveyor)](https://discord.gg/xhnkTUH) ![Discord](https://img.shields.io/discord/302306803880820736?style=for-the-badge) ![GitHub contributors](https://img.shields.io/github/contributors/callmekory/subbyBot?style=for-the-badge) ![GitHub followers](https://img.shields.io/github/followers/callmekory?style=for-the-badge)

<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://github.com/callmekory/subbyBot">
    <img src="data/images/logo.png" alt="Logo" width="126" height="126">
  </a>

**<h2 align="center">Subby Bot</h2>**

  <p align="center">
    Home automation, media management and server automation bot.
    <br />
    <br />
    <a href="https://github.com/callmekory/subbyBot/issues">Report Bug</a>
    ·
    <a href="https://github.com/callmekory/subbyBot/issues">Request Feature</a>
  </p>
</p>

<!-- ABOUT THE PROJECT -->

<h2 align="center"><b>About The Project</b></h2>

This bot was made to help me automate and control my lights, computers, smart plugs and various other things. It's really just a all purpose bot for whatever I want it to do really.

<!-- COMMANDS -->

<h2 align="center"><b>Commands</b></h2>

| Name     | Status | Web UI Enabled | Description (Click for full details)                                                                                                                                                                                                                                                                                                                              |
| -------- | ------ | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| sab      | 1.0    |                | <details><summary>sabNZBD Management</summary><p>Commands:<p><ul><li><b>list</b> - List all downloads in queue</li><li><b>add</b> - Add NZB's via link</li></ul></details>                                                                                                                                                                                        |
| tor      | 1.0    |                | <details><summary>Transmission Management</summary><p>Commands:<p><ul><li><b>list</b> - List all downloads in queue</li><li><b>add</b> - Add Torrent via link</li></ul>                                                                                                                                                                                           |
| movie    | 1.0    |                | <details><summary>Search and request movies in Ombi</summary><p>Commands:<p><ul><li><b>MOVIE NAME</b> - Search for movie to add</li></ul></details>                                                                                                                                                                                                               |
| series   | 1.0    |                | <details><summary>Search and request TV shows in Ombi</summary><p>Commands:<p><ul><li><b>SERIES NAME</b> - Search for show to add</li></ul></details>                                                                                                                                                                                                             |
| docker   | 1.0    | working        | <details><summary>Manage Docker contaienrs</summary><p>Commands:<p><ul><li><b>list running/paused/exited/etc</b> - List containers</li><li><b>stop/start/restart/etc CONTAINER</b> - Manage container states</li></ul></details>                                                                                                                                  |
| avr      | 1.0    | working        | <details><summary>Pioneer AVR controller</summary><p>Commands:<p><ul><li><b>on/off</b> - Power on/off</li><li><b>vol</b> - Show current volume</li><li><b>vol 0-100</b> - Set AVR volume</li></ul></details>                                                                                                                                                      |
| lights   | 1.0    | working        | <details><summary>Sengled light controller</summary><p>Commands:<p><ul><li><b>list</b> - List all lights</li><li><b>LIGHTNAME</b> - Toggle light on/off</li><li><b>LIGHTNAME 85</b> - Set light brightness</li></ul></details>                                                                                                                                    |
| plug     | 1.0    | working        | <details><summary>Tuya plug smart plug controller</summary><p>Commands:<p><ul><li><b>list</b> - List all plugs in your config file</li><li><b>PLUGNAME</b> - Toggle plug on/off</li><li><b>PLUGNAME on/off</b> - Set state of plug</li></ul><p>Learn how to setup your devices here(https://github.com/codetheweb/tuyapi/blob/master/docs/SETUP.md)</p></details> |
| meraki   | 1.0    |                | <details><summary>Meraki network statistics</summary><p>Commands:<p><ul><li><b>list</b> - List all devices on network</li></ul></details>                                                                                                                                                                                                                         |
| pihole   | 1.0    | working        | <details><summary>PiHole management</summary><p>Commands:<p><ul><li><b>stats</b> - List usage statistics</li><li><b>on/off</b> - Enable/disable DNS filtering</li></ul></details>                                                                                                                                                                                 |
| pc       | 1.0    | working        | <details><summary>Linux system power controller</summary><p>Commands:<p><ul><li><b>on/off/restart</b> - State to set system</li></ul><p>Requires addon in data/addons/powerserver to be running on system you want to control.</p></details>                                                                                                                      |
| routines | 1.0    | working        | <details><summary>Routines to run multiple commands at once</summary><p>Commands:<p><ul><li><b>ROUTINE NAME</b> - name of routine you configure.</li></ul></details>                                                                                                                                                                                              |
| ip       | 1.0    | working        | Shows server public and local IP                                                                                                                                                                                                                                                                                                                                  |
| ports    | alpha  | inprogress     | <details><summary>Check open/closed ports of specified system</summary><p>Commands:<p><ul><li><b>PORT NUMER</b> - Port number to check</li></ul></details>                                                                                                                                                                                                        |
| say      | 1.0    | working        | <details><summary>Speak through Google Home</summary><p>Commands:<p><ul><li><b>say</b> - Text to be spoken</li></ul></details>                                                                                                                                                                                                                                    |
| ping     | 1.0    | working        | Check bot latency                                                                                                                                                                                                                                                                                                                                                 |

<!-- Web UI -->

<h2 align="center"><b>Web UI - Work in progress</b></h2>

![alt text](/data/images/webui.png 'Logo Title Text 1')

<!-- GETTING STARTED -->

SubbyBot has a built in web UI / express api server for remotely running commands. For Web UI enabled commands you can add them as buttons on the Web UI and have nice buttons to click or tap on to control things like your lights / plugs / etc aswell as via HTTP POST requests from your favorite applications like Insomnia or Postman.

<h2 align="center"><b>Getting Started</b></h2>

To get a local copy up and running follow these simple steps.

1. Clone the subbyBot

```sh
git clone https://github.com/callmekory/subbyBot.git
```

2. Install Yarn

```curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -```
```echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list```
```sudo apt install yarn```

3: Install NPM packages 
```sh
yarn install
```

<h2 align="center"><b>Roadmap</b></h2>

See the [open issues](https://github.com/callmekory/subbyBot/issues) for a
list of proposed features (and known issues).

<!-- CONTRIBUTING -->

<h2 align="center"><b>Contributing</b></h2>

Contributions are what make the open source community such an amazing place to
be learn, inspire, and create. Any contributions you make are **greatly
appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<!-- LICENSE -->

<h2 align="center"><b>License</b></h2>

Distributed under the GPL3 License. See `LICENSE` for more information. Do whatever you want IDC

<!-- CONTACT -->

<h2 align="center"><b>Contact</b></h2>

[![Discord](https://img.shields.io/badge/Discord-Invite-7289DA.svg?style=for-the-badge&logo=appveyor)](https://discord.gg/xhnkTUH) ![Discord](https://img.shields.io/discord/302306803880820736?style=for-the-badge) ![GitHub contributors](https://img.shields.io/github/contributors/callmekory/subbyBot?style=for-the-badge) ![GitHub followers](https://img.shields.io/github/followers/callmekory?style=for-the-badge)

<!-- ACKNOWLEDGEMENTS -->

<h2 align="center"><b>Acknowledgements</b></h2>

- [Mellow - Ombi movies/series code](https://github.com/v0idp/Mellow)
- [nwithan8](https://github.com/nwithan8)
- [codetheweb/tuyapi](https://github.com/codetheweb/tuyapi)

<!-- MARKDOWN LINKS & IMAGES -->
