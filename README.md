# BabyFoot

![Table Football picture](https://source.unsplash.com/7de474KZIbs/270x180)

[![Build Status](https://github.com/doppelganger9/babyfoot/actions/workflows/main.yml/badge.svg)](https://github.com/doppelganger9/babyfoot/actions) [![Coverage Status](https://coveralls.io/repos/github/doppelganger9/babyfoot/badge.svg?branch=master)](https://coveralls.io/github/doppelganger9/babyfoot?branch=master) [![Mutation testing badge](https://badge.stryker-mutator.io/github.com/doppelganger9/babyfoot/master)](https://stryker-mutator.github.io) [![Known Vulnerabilities](https://snyk.io/test/github/doppelganger9/babyfoot/badge.svg?targetFile=package.json)](https://snyk.io/test/github/doppelganger9/babyfoot?targetFile=package.json) [![BCH compliance](https://bettercodehub.com/edge/badge/doppelganger9/babyfoot?branch=master)](https://bettercodehub.com/) [![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fdoppelganger9%2Fbabyfoot.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fdoppelganger9%2Fbabyfoot?ref=badge_shield) [![Maintainability](https://api.codeclimate.com/v1/badges/6df9f2100fc61a97bcf2/maintainability)](https://codeclimate.com/github/doppelganger9/babyfoot/maintainability)

## Goals

- Applying simple CQRS/ES and DDD.
- Creating a REST API based on Node + Express + TypeScript.
- Unit Testing with coverage > 80%
- REST API documentation, samples & testing with PostMan + NewMan (CLI automation)
- Exploring GitHub platform possibilites & integrations (CI/CD, NPM dependencies update Automation, etc.)

## Usage

- clone this repository somewhere on your local environment with `git clone https://github.com/doppelganger9/babyfoot.git` (or the SSH URL if you prefer)
- install all dependencies with `npm install`
- you can check the unit tests with `npm test`
- then you can run the server API with `npm start`, just keep the process running and in another shell:

  - run the API tests with `npm newman` which will use PostMan on the CLI
  - OR : open localhost:3000
  - OR : use PostMan and import collection + environment and start manually exploring the API
  - then, CTRL+C on the `npm start` process to stop the local development server.

## Unit Testing

`npm test`

Unit Testing was done by leveraging [Vitest](https://vitest.dev/) and [TypeScript](https://www.typescriptlang.org/).

It definitely helped me:

- see my Domain in action without a UI layer on top (manual testing);
- find a ton of errors, and fix them! even before using the API "for real";
- debug in vscode to go step-by-step and inspect variable contents;
- refactor blindly once everything was covered, that's the real deal 😎!

### Mutation testing

Code coverage is nice, but it only really tells you which part of your code is not yet covered.

What it does not tell you is if the current coverage is really testing or just passing over code.

Enters mutation testing! By changing parts of the tested code, it checks that related unit tests covering it should fail. If not, then the test does not really test anything, it just passes over the code.

Run `npm run test:mutations` and check the generated [Stryker Mutator](https://stryker-mutator.io) in the `reports` directory.

Look for surviving mutants, and test them one by one by replicating the mutation on our code and then if necessary, fix it.

Fixing means either adding meaningful assertions, or removing code that is not really useful.

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

- have Continuous Deployment, etc.
- add more API endpoints/features.
- add a PWA client for the API.

## Thanks

- the [Devoxx 2017 session "CQRS/ES from Scratch" by Emilien Pecoul and Florian Pellet](https://www.youtube.com/watch?v=S1V4t7SXXCU)
- the associated project : https://github.com/DevLyon/mixter
- Photo by [Pascal Swier](https://unsplash.com/photos/7de474KZIbs?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/collections/1408473/grato?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

## Code of Conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

## Contributing

Well, I'm honored you are even thinking about contributing to this project 🤗

This is one of many side project, made for fun, and to explore some concepts and technology I was not using on my daily job.

I will not be actively maintaining it, just looking from afar, coldly, waiting for your contributions (issues, comments, questions, PRs..), or for my curiosity to arise again.

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
