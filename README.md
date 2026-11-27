<div align="center">

# ⚓ IRONTIDE

### *The port's security net has gone feral. Cut its three uplinks. Reach the boat.*

**A first-person tactical shooter that runs entirely in your browser, from one HTML file.**

![HTML5](https://img.shields.io/badge/HTML5-single%20file-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![WebGL](https://img.shields.io/badge/WebGL-Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)
![Platform](https://img.shields.io/badge/Desktop%20·%20Mobile%20·%20Gamepad-supported-2ea44f?style=for-the-badge)
![Install](https://img.shields.io/badge/install-none-blue?style=for-the-badge)

**[▶ Play now](https://buinghiemtrang.github.io/irontide/)**

</div>

---

## 🌊 The Mission

> **Irontide Terminal · Berth 4 · 05:42**
> *Port Authority Breach Unit: one breacher, no backup.*

Dawn breaks over an automated container port, and its security system has turned hostile. A rogue intelligence called the **Harbormaster** has taken control of the berth.

You are the **Breacher**. Control's orders are simple:

1. 🔌 **Cut three uplink relays**, one each in the **yard**, the **shed** and the **quay**.
2. ⚔️ **Survive the machines.** *Gulls* hunt from the air and *Hounds* stalk the ground. Every relay you cut makes the Harbormaster send more.
3. 🚤 **Reach the boat.** When all three relays are dark, the extraction boat waits at the quay ladder at the south end. Run.

> *"Breacher is aboard. Irontide is dark. Good work."*

---

## ✨ Features

| | |
|---|---|
| 🎨 **Generated in the browser** | Every surface, machine and sound is created when the game runs. It downloads no textures, models or audio files. |
| 📦 **One HTML file** | The build packs the whole game into one `index.html` that runs with no server or install. |
| 🌗 **Three conditions** | Play at **Dawn**, in a **Storm** with heavy rain and lightning, or at **Night** under floodlights with a weapon flashlight. |
| 🌅 **Atmospheric harbor** | A custom sky, a moving sea, shadows, post-processing and seagulls overhead. The terminal is full of cranes, containers, warning signs and a docked ship. |
| 🤖 **Escalating AI** | Enemies patrol, pursue and come in waves that grow stronger with every relay you cut. Later waves bring **Shield Hounds** that block shots from the front. |
| 👹 **The Warden** | Cut the last relay and the Harbormaster sends a giant armoured Hound after you. |
| 🎮 **Plays on anything** | Supports keyboard and mouse, touch screens and gamepads. |
| ⚙️ **Auto quality** | The game picks a graphics level for your device, and you can change it at any time. |
| 🔫 **Two weapons** | The PAC-9 rifle and the M-12 Breakwater pump shotgun. Switch with `1` / `2` or the mouse wheel. |
| ⚡ **EMP grenades** | Two per mission. The pulse damages and stuns every machine in range, and cover blocks it. |
| 🛡️ **Holdout mode** | No relays, no boat: survive escalating waves on the quay, with resupply between waves and a Warden every fifth wave. |
| 🎚️ **Difficulty** | Easy, Normal or Hard changes enemy health, damage, fire rate and wave size. |
| 🏅 **Records & badges** | Each run ends with a rating, your personal best for that condition and difficulty, and 10 badges to unlock. |

---

## 🕹️ Controls

<table>
<tr><th>⌨️ Keyboard & Mouse</th><th>🎮 Gamepad</th><th>📱 Touch</th></tr>
<tr valign="top"><td>

| Action | Key |
|---|---|
| Move | `W` `A` `S` `D` |
| Look | Mouse |
| Fire | `LMB` |
| Aim | `RMB` |
| Reload | `R` |
| Cut relay | `E` (hold) |
| Jump | `Space` |
| Sprint | `Shift` |
| Crouch | `C` |
| Flashlight | `F` |
| EMP grenade | `G` |
| Rifle / Shotgun | `1` / `2`, wheel |
| Pause | `Esc` |

</td><td>

| Action | Button |
|---|---|
| Move / Look | Sticks |
| Fire | `RT` |
| Aim | `LT` |
| Jump | `A` |
| Crouch | `B` |
| Reload | `X` |
| Cut relay | `Y` |
| Sprint | `L3` |
| Flashlight | D-pad up |
| EMP grenade | `LB` |
| Switch weapon | D-pad ← → |
| Pause | `Start` |

</td><td>

| Action | Input |
|---|---|
| Move | Left thumb |
| Look | Right thumb |
| Fire · Aim · Reload · Jump | On-screen buttons |
| Sprint | Push the stick fully forward |
| Cut relay | Hold **USE** at a relay |

</td></tr>
</table>

> 💡 If your browser won't lock the mouse, turn with the arrow keys or `I` `J` `K` `L` and fire with `Enter`.

---

## 🚀 Getting Started

**Play online:** open **[buinghiemtrang.github.io/irontide](https://buinghiemtrang.github.io/irontide/)**.

**Run locally (development):**

```bash
git clone https://github.com/buinghiemtrang/irontide.git
cd irontide
npm install
npm run dev        # dev server with hot reload
npm run build      # builds a single self-contained dist/index.html
```

Works best in a recent version of **Chrome, Edge, Firefox or Safari** with WebGL enabled.

---

## 🛠️ Settings

- **Graphics quality**: auto-selected for your device and adjustable in-game
- **Mouse sensitivity** and **Invert Y**
- **Field of view**
- **Master volume**
- **Fullscreen**

Settings are saved in your browser between sessions.

---

## 🗂️ Project Structure

```
src/
├── main.js              # boot sequence + main loop
├── core/                # config, events, RNG, math, geometry helpers
├── render/              # renderer, post-processing, sky, materials
├── world/               # level layout, physics, backdrop, ground, props
├── fx/                  # tracers, smoke, sparks, explosions, rain
├── audio/               # procedural sound synthesis + mixer
├── player/              # input (keyboard, mouse, touch, gamepad) + movement
├── combat/              # hit detection and damage
├── weapon/              # first-person rifle
├── enemies/             # Gulls, Hounds and their AI
├── ui/                  # HUD, menus, settings
├── game/                # mission flow, objectives, radio
└── styles/ui.css
```

See [ROADMAP.md](ROADMAP.md) for planned updates.

---

## 🧱 Built With

- **[Three.js](https://threejs.org/)** for WebGL rendering
- **Custom GLSL shaders** for the sky, sea, shadows and post-processing
- **Web Audio API** for sound generated as you play
- **Vanilla JavaScript and CSS**, with no frameworks
- **[Vite](https://vite.dev/)** to build everything into one HTML file

---

<div align="center">

**Made by [buinghiemtrang](https://github.com/buinghiemtrang)**

*If you enjoyed the mission, leave a ⭐*

</div>
