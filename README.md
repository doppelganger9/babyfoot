# BabyFoot
[![Build Status](https://travis-ci.org/doppelganger9/babyfoot.svg?branch=master)](https://travis-ci.org/doppelganger9/babyfoot) [![Dependency Status](https://beta.gemnasium.com/badges/github.com/doppelganger9/babyfoot.svg)](https://beta.gemnasium.com/projects/github.com/doppelganger9/babyfoot) [![Coverage Status](https://coveralls.io/repos/github/doppelganger9/babyfoot/badge.svg?branch=master)](https://coveralls.io/github/doppelganger9/babyfoot?branch=master) [![Known Vulnerabilities](https://snyk.io/test/github/doppelganger9/babyfoot/badge.svg?targetFile=package.json)](https://snyk.io/test/github/doppelganger9/babyfoot?targetFile=package.json) [![BCH compliance](https://bettercodehub.com/edge/badge/doppelganger9/babyfoot?branch=master)](https://bettercodehub.com/) [![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fdoppelganger9%2Fbabyfoot.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fdoppelganger9%2Fbabyfoot?ref=badge_shield)

## Goals

- Applying simple CQRS/ES and DDD.
- Creating a REST API based on Node + Express + TypeScript.
- Unit Testing with coverage > 80%
- REST API documentation, samples & testing with PostMan + NewMan (CLI automation)
- Exploring GitHub platform possibilites & integrations

## Usage

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

## Future plans

- Use Jest for Unit Testing?
- have Continuous Deployment, etc.
- add more API endpoints/features.
- add a PWA client for the API.

## Thanks

- the [Devoxx 2017 session "CQRS/ES from Scratch" by Emilien Pecoul and Florian Pellet](https://www.youtube.com/watch?v=S1V4t7SXXCU)
- the associated project : https://github.com/DevLyon/mixter

## Code of Conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

## Contributing

Well, I'm honored you are even thinking about contributing to this project 🤗

I do not have set up a proper CONTRIBUTING.md guide 🤭 so let's just say all contributions are welcomed 😉.
You should follow our Code of Conduct 🤝.
Use the GitHub platform 😎:

- open an issue for discussion
- create a Pull Request
- do your best for the automated checks to pass before merging is possible

Anyway, I will review any PRs and do my best to provide answers and make merging happen, and clarify the CONTRIBUTING rules using a test & learn approach as the need arise.

You can of course message me on Twitter [@doppelganger9](https://twitter.com/doppelganger9).

## License

MIT License

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fdoppelganger9%2Fbabyfoot.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fdoppelganger9%2Fbabyfoot?ref=badge_large)
