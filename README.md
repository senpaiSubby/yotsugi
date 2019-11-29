<!---------------------------------- Badges ---------------------------------->

<center>

[![Discord](https://img.shields.io/badge/Discord-Invite-7289DA.svg?style=for-the-badge&logo=appveyor)](https://discord.gg/xhnkTUH) ![Discord](https://img.shields.io/discord/302306803880820736?style=for-the-badge) ![GitHub contributors](https://img.shields.io/github/contributors/callmekory/nezuko?style=for-the-badge) ![GitHub followers](https://img.shields.io/github/followers/callmekory?style=for-the-badge)

[![Logo](data/images/logo.png) ](https://github.com/callmekory/nezuko)

</center>

<!---------------------------------- Logo / header ---------------------------------->

<center>

## **Nezuko**

#### Smart Home, Automation, and all purpose server management bot.

[Report Bug](https://github.com/callmekory/nezuko/issues) · [Request Feature](https://github.com/callmekory/nezuko/issues)

</center>

---

<!---------------------------------- About the project ---------------------------------->

<center>

## **About The Project**

</center>

#### I made Nezuko to automate my life. From controlling my lights and smart plugs to media management and Docker control. If its not here it'll be here. Feel free to PR and ask for new features!

---

<!---------------------------------- Command Table ---------------------------------->

<center>

## **Commands**

</center>

<table>

<thead>
<tr>
<th>Command</th>
<th style="text-align:center">API</th>
<th>Description (Click for full details)</th>
</tr>
</thead>

<tbody>

<tr>
<td>sab</td>
<td style="text-align:center">Y</td>
<td><details><summary>sabNZBD Management</summary>

Commands:

- **list** - List all downloads in queue
- **add** - Add NZB's via link
  </details></td>
  </tr>

<tr>
<td>tor</td>
<td style="text-align:center">Y</td>
<td><details><summary>Transmission Management</summary>

Commands:

- **list** - List all downloads in queue
- **add [magnet link]** - Add Torrent via link
  </details></td>
  </tr>

<tr>
<td>jackett</td>
<td style="text-align:center"></td>
<td><details><summary>Search torrents via Jackett</summary>

Commands:

- **[search term]** - Torrent to search for
  </details></td>
  </tr>

<tr>
<td>yt</td>
<td style="text-align:center"></td>
<td><details><summary>Search for youtube videos</summary>

Commands:

- **[search term]** - Torrent to search for
  </details></td>
  </tr>

<tr>
<td>movie</td>
<td style="text-align:center"></td>
<td><details><summary>Search and request movies in Ombi</summary>

Commands:

- **[movie name]** - Movie to search for
  </details></td>
  </tr>

<tr>
<td>series</td>
<td style="text-align:center"></td>
<td><details><summary>Search and request TV shows in Ombi</summary>

Commands:

- **[series name]** - Series to search for
  </details></td>
  </tr>

<tr>
<td>emby</td>
<td style="text-align:center"></td>
<td><details><summary>Get stats from Emby</summary>
Commands:

- **stats** - Media library stats
- **recent [movies/series/music]** - View recent media and get links to watch
- **streams** - View who and whats currently streaming
  </details></td>
  </tr>

<tr>
<td>plex</td>
<td style="text-align:center"></td>
<td><details><summary>Get stats from Plex via Tautulli</summary>

Commands:

- **stats** - Media library stats
- **recent [movies/series/music]** - View recent media and get links to watch
- **streams** - View who and whats currently streaming
  </details></td>
  </tr>

<tr>
<td>archivebox</td>
<td style="text-align:center">Y</td>
<td><details><summary>Clone webpages via ArchiveBox</summary>

Commands:

- **[url]** - Url to add
  </details></td>
  </tr>

<tr>
<td>rclone</td>
<td style="text-align:center">Y</td>
<td><details><summary>List directories and get info on your rclone mounts</summary>

Commands:

- **ls [/some/rclone/dir]** - List files in a dir and navigate in pages
- **size[/some/rclone/dir]** - Get the size of a dir on rclone
  </details></td>
  </tr>

<tr>
<td>speedtest</td>
<td style="text-align:center">Y</td>
<td><details><summary>Runs a speedtest on the host the bot is running on</summary></details></td>
</tr>

<tr>
<td>todo</td>
<td style="text-align:center">Y</td>
<td><details><summary>Your personal todo list</summary>

Commands:

- **list** - List all todos
- **add [take out trash]** - Add a todo
- **remove [1]** - Remove a todo
  </details></td>
  </tr>

<tr>
<td>docker</td>
<td style="text-align:center">Y</td>
<td><details><summary>Manage Docker contaienrs</summary>

Commands:

- **list running/paused/exited/etc** - List containers
- **stop/start/restart/etc [CONTAINER]** - Manage container states
  </details></td>
  </tr>

<tr>
<td>avr</td>
<td style="text-align:center">Y</td>

<td><details><summary>Pioneer AVR controller</summary>

Commands:

- **on/off** - Power on/off
- **vol** - Show current volume
- **vol [0-100]** - Set AVR volume
  </details></td>
  </tr>

<tr>
<td>lights</td>
<td style="text-align:center">Y</td>
<td><details><summary>Sengled light controller</summary>

Commands:

- **list** - List all lights
- **[light name]** - Toggle light on/off
- **[light name] 0-100** - Set light brightness
  </details></td>

</tr>
<tr>
<td>plug</td>
<td style="text-align:center">Y</td>
<td><details><summary>Meraki network statistics</summary>

Commands:

- **list** - List all devices on network
  </details></td>
  </tr>

<tr>
<td>pihole</td>
<td style="text-align:center">Y</td>
<td><details><summary>PiHole management</summary>

Commands:

- **stats** - List usage statistics
- **on/off** - Enable/disable DNS filtering
  </details></td>
  </tr>

<tr>
<td>pc</td>
<td style="text-align:center">Y</td>
<td><details><summary>Linux system power controller</summary>

Commands:

- **on/off/restart** - State to set system
  Requires addon in core/addons/powerserver to be running on the system you want to control.
  </details></td>
  </tr>

<tr>
<td>routines</td>
<td style="text-align:center">Y</td>
<td><details><summary>Routines to run multiple commands at once</summary>

Commands:

- **add [routine name][command]** - Add a command to a routine
- **remove [routine name][command # from list command]** - Remove a command from routine
- **disable/enable [routine name][command # from list command]** - Enable/disable a command in a routine
- **list** - List all your routines and commands
  </details></td>
  </tr>

<tr>
<td>ip</td>
<td style="text-align:center">Y</td>
<td><details><summary>Shows server public and local IP</summary></details></td>
</tr>

<tr>
<td>say</td>
<td style="text-align:center">Y</td>
<td><details><summary>Speak through Google Home</summary>

Commands:

- **say [waddup my dude]** - Text to be spoken
  </details></td>
  </tr>

</tbody>
</table>

---

<!---------------------------------- Web UI ---------------------------------->

 <center>

## **Web UI - Work in progress**

</center>

![alt text](data/images/webui.png 'Logo Title Text 1')

#### Nezuko has a built in web UI / API server for remotely running commands. For API enabled commands you can add them as buttons on the Web UI send HTTP POST requests from your favorite applications. I personally use [HTTP Request Shortcuts](https://github.com/Waboodoo/HTTP-Shortcuts) on my Galaxy. It has a nice UI with support for custom icons, etc.

<center>

<div>
  <img src="data/images/app1.png" width="300px" />
  <img src="data/images/app2.png" width="300px" />
</div>

</center>

---

<!---------------------------------- Getting Started ---------------------------------->

<center>

## **Getting Started**

</center>

#### To get a local copy up and running follow these simple steps.

#### 1\. Clone Nezuko

    git clone https://github.com/callmekory/nezuko.git

#### 2\. Install Yarn

`curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -`

`echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list`

`sudo apt install yarn`

#### 3: Install NPM packages

    yarn install

---

<!---------------------------------- Roadmap ---------------------------------->

<center>

## **Roadmap**

</center>

#### See the [open issues](https://github.com/callmekory/nezuko/issues) for a list of proposed features (and known issues).

---

<!---------------------------------- Contributing ---------------------------------->

<center>

## **Contributing**

</center>

#### Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**!

#### 1\. Fork the Project

#### 2\. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)

#### 3\. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)

#### 4\. Push to the Branch (`git push origin feature/AmazingFeature`)

#### 5\. Open a Pull Request

---

<!---------------------------------- License ---------------------------------->

<center>

## **License**

</center>

#### Distributed under the GPL3 License. See `LICENSE` for more information.

---

<!---------------------------------- Contact ---------------------------------->

<center>

## **Contact**

</center>

#### You can find me on Discord on various servers. Shoot me a pm my tag is Sublime#4233 if you have any questions!

---

<!---------------------------------- Acknowledgements ---------------------------------->

<center>

## **Acknowledgements**

</center>

- [Mellow - Ombi movies/series code](https://github.com/v0idp/Mellow)
- [nwithan8](https://github.com/nwithan8)
- [codetheweb/tuyapi](https://github.com/codetheweb/tuyapi)</center>
