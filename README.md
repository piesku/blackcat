# 33 Duels

**33 Duels** is a fast-paced, high-energy, micro-roguelike auto-battler built for a game jam with the theme "Black Cat."

The player must win 33 consecutive one-on-one duels against randomly generated opponents to become the last human on Earth. The core loop is built around choosing one of three random upgrades before each fight, creating chaotic and strategic builds that clash in spectacular, 10-second battles.

After each victory, the world's population is halved, and the game presents a historical factoid from the new, earlier era. The goal is to survive all 33 rounds and stand alone at the dawn of humanity.

---

This project is based on [Goodluck](https://github.com/piesku/goodluck), a hackable template for creating small and fast browser games.

## Running Locally

To run locally, install the dependencies and start the local dev server:

    npm install
    npm start

Then, open http://localhost:1234 in the browser.

### VS Code

VS Code is configured to automatically start the esbuild dev server and TypeScript type checking when you open the folder. You can see these background tasks running in the terminal panel.

Ctrl+Shift+B will show all available build tasks, and F5 will open the browser.

### Claude Code

Claude will automatically read `CLUADE.md` and all the files in the `docs/` directory to learn about the project and its structure.

To enable Playwright integration, run:

    claude mcp add playwright npx '@playwright/mcp@latest'

### Setting up Git Hooks

To ensure code quality and consistent formatting, configure git to use the shared hooks:

    git config core.hooksPath scripts/hooks

This will enable a pre-commit hook that automatically runs `prettier` on TypeScript files before each commit.

## Building

To produce the optimized build, use the `Makefile` in `play/`.

    make -C play

The default target will create a single HTML file, `play/index.html`, will all resources inlined.

If you have the 7-Zip command line utility installed (`p7zip-full` on Ubuntu), you can build the ZIP file by running:

    make -C play index.zip
