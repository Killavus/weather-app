# Tools used to create Weather.app

- [TailwindCSS](https://tailwindcss.com/) - allows rapid prototyping, custom theming & creating design system in the long term. Downside is long class lists to style elements. It allowed me to create the project without spending time on CSS at all.
- [Express](https://expressjs.com/) - application requires querying a big list of cities - putting it inside bundle file seemed to be unreasonable. During development it became apparent that OpenWeatherMap API can't handle CORS requests despite having headers set - so the need of proxying API requests arose. Express is a de-facto standard of API services in Node - it's familiar for Node.js developers and it was good enough to implement quick backend for the app.
- [Axios](https://github.com/axios/axios) - popular HTTP client for Node.js environment. I've chosen it because it is very popular and does its job well which is proxying OWM POST/DELETE requests.
- [TypeScript](https://www.typescriptlang.org/) - static typing helps a lot with reducing amount of mistakes while developing the project. It also provides way more context for reading code.
- [React.js](https://reactjs.org/) - view library of choice. I've chosen it because of declarative model of programming it provides.
- [Leaflet.js](https://leafletjs.com/) - used to integrate OpenStreetMap maps to the project. Recommended by OWM API documentation as well.
- [React Query](https://react-query.tanstack.com/) - covers frontend needs of data fetching / caching & mutating in a very clean way. It's ability to re-fetch stale data is very beneficial for such 'widget-like' app like Weather.app. I've also wanted to try it out and it was a great fit for this project.
- [Prettier](https://prettier.io/) - code formatter. Used to maintain consistent styling of code within the project. This saves a lot of time.
- [React-Router](https://reactrouter.com/) - frontend routing. It is an industry standard in React world. It's programming model is very good as well, allowing composable routers to be created.
- [Vite](https://vitejs.dev/) - project creation & setup. It is fast on development mode (rapid prototyping with HMR as well) and uses modern tooling to buiild production bundle (esbuild, which is a faster alternative to Webpack).

# Tools NOT USED to create Weather.app:

- Standard library replacements (lodash, ramda) - project needs were too low to justify adding such library to the project. In 5-day forecast view there was a need of `groupBy` function, but I managed to implement it using standard library. It's a part of `WeatherForecast` component.
- Autocomplete library - I wrote my own widget for this. It took some time, but all libraries I've tried were either deprecated (which makes a cost of adding it higher for maintentance) or had very bad programming model. It's contained within `CitySearch` component.
- State management library (Redux, zustand) - there is no need in Weather.app for a technology like this. There are no places of cross-cutting data between views - each view has its own set of data.

# Testing

To test the app I'd use the following stack:

- [Jest](https://jestjs.io/) - unit tests & functional tests. It has utilities for mocking & testing React components - namely so-called [snapshot testing](https://jestjs.io/docs/snapshot-testing).
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) - component tests. This allows to test them in a 'blackbox' way, without testing internals of React. It's programming model forces you to write tests from the user perspective - so you need to think in interactions, making tests more resilient to code changes.
- [Cypress](https://www.cypress.io/) - end-to-end tests. Used to cover critical business interactions in staging-like environment. The purpose of those tests are to test integration between components & modules and ensure that application is working after changes from the user perspective.

Testing strategy would be as follows:

- Add unit tests at the module boundary. Do not test private functions inside module, test only public API of every module. Amount of these tests should be always around the number of modules.
- Write component tests. For every non-trivial component there should be at least a snapshot test. In case of more complicated modules, test user interactions through React Testing Library. Amount of these tests should be around number of components inside the app.
- Identify critical flows in the app and write E2E tests covering these flows. There should be 3, max 4 of such tests in the app - they are slow and can be brittle.
- Think about test coverage analysis tools, set up a meaningful threshold. Avoid 100% test coverage to avoid britleness of tests.

All tests should be run on CI and should block production releases. It should NOT block preview releases used by developers but it should block merging to `master` branch.

# Performance maintentance

There is a backlog of todos to make application faster right now:

- Replace quick-and-dirty Trie-based city searching with a proper API solution - move city data inside full-text-search index tool (PostgreSQL, ElasticSearch).
- Limit number of cities in City search by API & instruct frontend using HTTP status code/response payload to wait for more specific search. There are certain searches (like "sa") that are slow now because of amount of data that needs to be fetched, parsed & rendered.
- Add pagination for weather stations, right now they are rendered as-is so with higher count of them we may experience performance problems.
- Weather stations & current weather sections can be splitted and async loaded to improve time to first paint.

Next steps to ensure performance is not degraded:

- Add reporting of bundle size with every CI build. Add alerts about significant increases in bundle size. Set up maximum "budget" of bundle size depending on devices/end-users the app targets.
- Use performance analysis tools like [Lighthouse](https://developers.google.com/web/tools/lighthouse) to development processes. Interate Lighthouse reports with CI and periodically review results.
- Add timers to asynchronous actions like API requests - alert when they are taking too long using Sentry or other error reporting tooling.
- Add health check periodic task to alert when time to first paint is degraded on production. This can be achieved using DevOps tooling & JS-aware crawler like Puppeteer.

# Code maintenance

- Document technical debt in some kind of document. Speak with product managers about allocating time for fixing bugs / technical debt in the future.
- Automate dependency update process. Use technologies like repository bots (like [Dependabot](https://dependabot.com/) or [Renovatebot](https://github.com/renovatebot/renovate)).
- Integrate linter like [ESLint](https://eslint.org/) to maintain consistent code practices and avoid easily checkable mistakes. Review rules periodically to add useful rules, remove frustrating ones from the workflow. Integrate it with CI and use [Husky](https://www.npmjs.com/package/husky) & [lint-staged](https://github.com/okonet/lint-staged) to ensure that linter & formatter are called often in the workflow.
- Set up code quality practices inside the team. Set up code reviews as a necessary step in pull request approval process. Create architectural review meetings led by the technical owner of the project to identify code pain points fast. Set up ready-to-release checklist to ensure all non-feature requirements are met before release to prod (logging, error reporting, automated tooling integration) for new projects.
- Create architectural guidelines document documenting do's and don'ts of project architecture (like "for every page set up a nested router and compose them", "use consistent naming of queries"). Review it periodically.

# Deployment

- All secrets must not be stored in repository. All secrets, API keys & such should be passed through configuration files or environment variables.
- Use CI to build, test & lint code. Integrate it with repository storage of choice (like GitHub) to make step results available in every code change.
- Production deployments should be manually triggered by developers but through CI (if no Continous Delivery is applied to the project), or with every master merge (if CD is applied). Development builds should automatically create preview deploys (for example, using Netlify previews feature for frontend).
- Frontend code should be served to an end user using CDN like CloudFlare or others. Cache invalidation and regeneration should be handled by CI pipeline.
- API code should be deployed using CI as well, through proxy service implementing rate limiting, SSL termination & caching where applicable.
