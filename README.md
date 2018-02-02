# BabyFoot

## Goals

- Applying simple CQRS/ES and DDD.
- Creating a REST API based on Node + Express + TypeScript.
- Unit Testing with coverage > 80%
- REST API documentation, samples & testing with PostMan + NewMan (CLI automation)

## Install, build, run

- ❏ clone this repository
- `npm install`
- `npm test`
- `npm start`, keep the process running and:

  - `npm newman`
  - OR : open localhost:3000
  - OR : use PostMan and import collection + environment and start testing !
  - then, CTRL+C on the `npm start` process.

## Unit Testing

`npm test`

Unit Testing is done with Chai, Mocha, TypeScript.

It definitely helped me:

- see my Domain in action without a UI layer on top (manual testing).
- find a ton of errors, and fix them!
- debug in vscode to go step-by-step and inspect variable contents
- refactor blindly once everything was covered, yay!

## PostMan collection & automated REST API testing

`npm run newman`

I also added a **Postman** collection to give you something to test the API with.

I find it great for APIs because:

- you can play with it,
- you can run automated tests,
- you can provide sample calls
- you can document your API
- and you can export cURL shell commands (or any HTTP call code you want).

Also my goal is to automate this with **Newman**.

## Future possibilities

- Use Jest for Unit Testing?
- have CI, CD, coverage automation, badges, etc.
- have Gemnasium check security flaws.
- add more API endpoints/features.
- add a PWA client for the API.

## Thanks

- the [Devoxx 2017 session "CQRS/ES from Scratch" by Emilien Pecoul and Florian Pellet](https://www.youtube.com/watch?v=S1V4t7SXXCU)
- the associated project : https://github.com/DevLyon/mixter
