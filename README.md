# Adventure Land Typescript Kit 

## About

This is a starter kit to use typescript for [Adventure Land](https://adventure.land). It is based off of the [adventureland-typescript-starter](https://github.com/saevarb/adventureland-typescript-starter) by [saevarb](https://github.com/saevarb).

## Features

- Filename based uploading
- Minimal configuration to get started
- Allows importing from your own modules, or node_modules
- Automatically uploads your code to Adventure.Land servers

## Getting Started

- Clone this repository
- Create a .env file with cookie
- Open a terminal in the cloned repository and run 
```npm install```
- create a .env file in the root directory
  - Go to adventure.land in your browser and login
  - Open your browser dev tools
  - Click on the application tab and go to cookies
  - Find the cookie named auth
  - Copy into your .env file like so
  ```
    AUTH_COOKIE=YOUR_COOKIE_HERE
  ```
- When ready to run your dev environment run ```npm run dev``` in a console pointing to the root directory
- Code will only be uploaded to the adventure.land servers if the file is in the src/uploads directory AND is named in the format [saveName].[saveSlot].ts (without the [ ])